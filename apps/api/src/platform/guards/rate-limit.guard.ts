import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

/**
 * Helper lấy IP thực của Client (hỗ trợ qua Nginx / Cloudflare Proxy)
 */
function getClientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
    if (ip) return ip;
  }
  return req.headers?.['x-real-ip'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // Cấu hình mặc định toàn sàn (Global sensible fallback)
  private readonly DEFAULT_POINTS = 120; // 120 requests
  private readonly DEFAULT_DURATION = 60; // trong 60 giây (1 phút)
  private readonly DEFAULT_MESSAGE =
    'Bạn đang gửi quá nhiều yêu cầu cùng lúc. Vui lòng chờ ít giây trước khi thử lại.';

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Bỏ qua nếu endpoint được cấu hình skip: true
    if (options?.skip) {
      return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const points = options?.points ?? this.DEFAULT_POINTS;
    const duration = options?.duration ?? this.DEFAULT_DURATION;
    const defaultMsg = options?.message || this.DEFAULT_MESSAGE;

    // Định danh rate limit: Ưu tiên User ID nếu đã đăng nhập, hoặc IP nếu là khách
    const identifier = req.user?.userId ? `usr:${req.user.userId}` : `ip:${getClientIp(req)}`;
    const routePath = req.route?.path || req.baseUrl || req.url || 'default';
    const scope = options?.keyPrefix || `${req.method || 'GET'}:${routePath}`;
    const redisKey = `ratelimit:${scope}:${identifier}`;

    try {
      const currentCount = await this.redisService.incr(redisKey, duration);

      if (currentCount > points) {
        const ttl = await this.redisService.ttl(redisKey);
        const retryAfter = ttl > 0 ? ttl : duration;

        if (res && typeof res.setHeader === 'function') {
          res.setHeader('Retry-After', String(retryAfter));
        }

        const formattedMessage =
          defaultMsg.includes('{retryAfter}')
            ? defaultMsg.replace('{retryAfter}', String(retryAfter))
            : `${defaultMsg}`;

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: formattedMessage,
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Đính kèm headers thông tin hạn mức nếu có response object
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('X-RateLimit-Limit', String(points));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, points - currentCount)));
      }

      return true;
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      // Khi Redis gặp sự cố bất ngờ -> Không làm gián đoạn request của khách hàng (Fail Open)
      this.logger.warn(`RateLimit check failed for ${redisKey}: ${err.message}. Passing through.`);
      return true;
    }
  }
}
