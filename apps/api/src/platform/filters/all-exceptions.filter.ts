import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Đã có lỗi xảy ra trên hệ thống.';
    let details: any[] = [];
    let retryable = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        code = res.code || (status === 422 ? 'VALIDATION_FAILED' : exception.name);
        message = res.message || message;
        details = Array.isArray(res.message) ? res.message : res.details || [];
      }

      if (status >= 500) {
        retryable = true;
      }
    } else {
      this.logger.error(
        `[${requestId}] Unhandled Exception: ${(exception as any)?.message}`,
        (exception as any)?.stack,
      );
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        retryable,
        requestId,
      },
    });
  }
}
