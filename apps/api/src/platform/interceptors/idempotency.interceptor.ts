import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Hàm tuần tự hóa JSON xác định (Deterministic JSON Stringify)
 * Đảm bảo các thuộc tính trong Object luôn được sắp xếp theo thứ tự bảng chữ cái
 * để mã băm SHA-256 không bị thay đổi dù client gửi key theo thứ tự khác nhau.
 */
function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]));
  return '{' + pairs.join(',') + '}';
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const key = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string;

    // Nếu client không gửi header Idempotency-Key thì tiếp tục xử lý bình thường
    if (!key || typeof key !== 'string' || !key.trim()) {
      return next.handle();
    }

    const cleanKey = key.trim();
    // Scope chuẩn: method + path (ví dụ: POST:/orders/checkout)
    const rawPath = req.route?.path || req.baseUrl || req.url || 'DEFAULT';
    const scope = `${req.method || 'POST'}:${rawPath}`.substring(0, 40);
    const requestHash = this.hashRequest(req.body);

    const userPublicId = req.user?.userId;

    // Resolve userId nội bộ (BigInt)
    const resolveUserPromise = userPublicId
      ? this.prisma.user.findUnique({
          where: { publicId: userPublicId },
          select: { id: true },
        })
      : Promise.resolve(null);

    return from(
      resolveUserPromise.then(async (userRecord) => {
        if (!userRecord) {
          // Nếu không tìm thấy người dùng trong phiên, bỏ qua interceptor
          return { type: 'bypass' as const };
        }
        return this.claimOrReplay(userRecord.id, scope, cleanKey, requestHash);
      }),
    ).pipe(
      mergeMap((outcome) => {
        if (outcome.type === 'bypass') {
          return next.handle();
        }

        // Nhánh Replay: Trả về kết quả đã lưu trong DB từ lần trước mà không gọi lại Controller
        if (outcome.type === 'replay') {
          const res = context.switchToHttp().getResponse();
          res.status(outcome.statusCode || 200);
          return from(Promise.resolve(outcome.body));
        }

        const userInternalId = outcome.userId;

        // Nhánh xử lý mới (Process): Chạy Controller
        return next.handle().pipe(
          mergeMap(async (result) => {
            const res = context.switchToHttp().getResponse();
            const statusCode = res.statusCode || 201;
            await this.complete(userInternalId, scope, cleanKey, statusCode, result);
            return result;
          }),
          catchError((err) => {
            // Đánh dấu thất bại / xóa key để client có thể retry lại sau
            return from(this.fail(userInternalId, scope, cleanKey)).pipe(
              mergeMap(() => throwError(() => err)),
            );
          }),
        );
      }),
    );
  }

  /**
   * Tranh chấp khóa nguyên tử: Thử INSERT vào bảng idempotency_keys
   */
  private async claimOrReplay(
    userId: bigint,
    scope: string,
    key: string,
    hash: string,
  ) {
    const now = new Date();
    try {
      await this.prisma.idempotencyKey.create({
        data: {
          userId,
          scope,
          idemKey: key,
          requestHash: hash,
          status: 'IN_PROGRESS',
          lockedUntil: new Date(now.getTime() + 60 * 1000), // Khóa 60 giây
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Hết hạn sau 24h
        },
      });
      return { type: 'process' as const, userId };
    } catch (e: any) {
      // P2002: Lỗi vi phạm Unique Constraint của Prisma (đã có request gửi key này trước đó)
      if (e.code !== 'P2002') throw e;

      const existing = await this.prisma.idempotencyKey.findUnique({
        where: {
          userId_scope_idemKey: {
            userId,
            scope,
            idemKey: key,
          },
        },
      });

      if (!existing) {
        throw new ConflictException(
          'Xung đột yêu cầu Idempotency. Vui lòng thử lại sau vài giây.',
        );
      }

      // 1. Kiểm tra chữ ký request: Nếu cùng key nhưng gửi body khác
      if (existing.requestHash !== hash) {
        throw new ConflictException(
          'Idempotency-Key này đã được sử dụng với một nội dung yêu cầu khác.',
        );
      }

      // 2. Request trước đã hoàn tất thành công -> Phát lại kết quả (Replay Cache)
      if (existing.status === 'COMPLETED') {
        return {
          type: 'replay' as const,
          statusCode: existing.responseStatus || 200,
          body: existing.responseBody,
        };
      }

      // 3. Nếu request trước bị crash / treo quá 60s (lockedUntil đã qua) -> cho phép thử lại
      if (existing.status === 'IN_PROGRESS' && existing.lockedUntil < new Date()) {
        await this.prisma.idempotencyKey.update({
          where: { id: existing.id },
          data: {
            lockedUntil: new Date(Date.now() + 60 * 1000),
          },
        });
        return { type: 'process' as const, userId };
      }

      // 4. Request trước vẫn đang trong quá trình xử lý -> Chặn đứng double-click
      throw new ConflictException(
        'Yêu cầu thanh toán với cùng mã Idempotency-Key đang được xử lý. Vui lòng không bấm gửi lại.',
      );
    }
  }

  /**
   * Hoàn tất request và lưu responseBody để replay
   */
  private async complete(
    userId: bigint,
    scope: string,
    key: string,
    statusCode: number,
    body: any,
  ) {
    try {
      await this.prisma.idempotencyKey.update({
        where: {
          userId_scope_idemKey: {
            userId,
            scope,
            idemKey: key,
          },
        },
        data: {
          status: 'COMPLETED',
          responseStatus: statusCode,
          responseBody: body ? (JSON.parse(JSON.stringify(body)) as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        this.logger.warn(`Idempotency record không tồn tại khi complete (scope=${scope}, key=${key})`);
        return;
      }
      this.logger.error('Lỗi khi cập nhật trạng thái Idempotency COMPLETED', e);
    }
  }

  /**
   * Xử lý khi request bị lỗi: Xóa bản ghi để client có thể retry lại
   */
  private async fail(userId: bigint, scope: string, key: string) {
    try {
      await this.prisma.idempotencyKey.delete({
        where: {
          userId_scope_idemKey: {
            userId,
            scope,
            idemKey: key,
          },
        },
      });
    } catch (e: any) {
      if (e.code === 'P2025') return; // Bản ghi đã bị xóa trước đó
      this.logger.error('Lỗi khi xóa Idempotency record khi request lỗi', e);
    }
  }

  private hashRequest(body: any): string {
    return createHash('sha256')
      .update(stableStringify(body ?? {}))
      .digest('hex');
  }
}

