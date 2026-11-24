import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { RedisService } from '../redis';

describe('RateLimitGuard Unit Tests', () => {
  let guard: RateLimitGuard;
  let reflector: Reflector;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(() => {
    reflector = new Reflector();
    redisService = {
      incr: jest.fn(),
      ttl: jest.fn(),
    } as any;

    guard = new RateLimitGuard(reflector, redisService);
  });

  const createMockContext = (options: {
    ip?: string;
    userId?: string;
    method?: string;
    url?: string;
  }) => {
    const headers: Record<string, string> = {};
    if (options.ip) {
      headers['x-forwarded-for'] = options.ip;
    }

    const setHeaderMock = jest.fn();

    const req: any = {
      headers,
      ip: options.ip || '127.0.0.1',
      method: options.method || 'POST',
      url: options.url || '/auth/login',
      user: options.userId ? { userId: options.userId } : undefined,
    };

    const res: any = {
      setHeader: setHeaderMock,
    };

    return {
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => req,
          getResponse: () => res,
        }),
      } as unknown as ExecutionContext,
      req,
      res,
      setHeaderMock,
    };
  };

  it('Cho phép đi qua khi số lượng request vẫn dưới ngưỡng cho phép', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      points: 5,
      duration: 60,
      message: 'Bạn đã thử đăng nhập quá 5 lần.',
    });

    redisService.incr.mockResolvedValue(3); // Lần thứ 3 (nhỏ hơn 5)

    const { context, setHeaderMock } = createMockContext({
      ip: '192.168.1.50',
      url: '/auth/login',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '2'); // 5 - 3 = 2
  });

  it('Chặn lại với mã 429 và thông báo Tiếng Việt hợp lý khi request vượt quá số lần cho phép', async () => {
    const customMessage =
      'Bạn đã thử đăng nhập quá 5 lần. Vui lòng đợi 1 phút trước khi thử lại để bảo vệ tài khoản.';

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      points: 5,
      duration: 60,
      message: customMessage,
    });

    redisService.incr.mockResolvedValue(6); // Vượt quá 5
    redisService.ttl.mockResolvedValue(45); // Còn 45s

    const { context, setHeaderMock } = createMockContext({
      ip: '192.168.1.50',
      url: '/auth/login',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(HttpException);

    try {
      await guard.canActivate(context);
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);

      const response = err.getResponse();
      expect(response.message).toBe(customMessage);
      expect(response.retryAfter).toBe(45);
      expect(setHeaderMock).toHaveBeenCalledWith('Retry-After', '45');
    }
  });

  it('Định danh bằng User ID khi người dùng đã đăng nhập (chống đổi IP né rate limit)', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      points: 5,
      duration: 60,
      message: 'Hệ thống đang xử lý đơn hàng của bạn.',
    });

    redisService.incr.mockResolvedValue(1);

    const { context } = createMockContext({
      userId: 'usr_logged_in_999',
      ip: '10.0.0.1',
      url: '/orders/checkout',
    });

    await guard.canActivate(context);

    // Key lưu trong Redis phải gắn với usr:usr_logged_in_999
    expect(redisService.incr).toHaveBeenCalledWith(
      expect.stringContaining('usr:usr_logged_in_999'),
      60,
    );
  });

  it('Bỏ qua rate limit khi endpoint được cấu hình skip: true', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      skip: true,
    });

    const { context } = createMockContext({
      url: '/health',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(redisService.incr).not.toHaveBeenCalled();
  });

  it('Áp dụng mức mặc định toàn sàn (120 req/phút) khi route không gắn decorator @RateLimit', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    redisService.incr.mockResolvedValue(1);

    const { context, setHeaderMock } = createMockContext({
      url: '/catalog/categories',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '120');
  });

  it('Fail-Open an toàn: Nếu Redis gặp lỗi bất ngờ, hệ thống vẫn cho phép request đi qua không gây sập app', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      points: 10,
      duration: 60,
    });

    redisService.incr.mockRejectedValue(new Error('Redis connection lost'));

    const { context } = createMockContext({
      url: '/catalog/products',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
