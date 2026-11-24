import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface StandardResponse<T> {
  data: T;
  meta: {
    requestId: string;
    [key: string]: any;
  };
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return next.handle().pipe(
      map((data) => {
        // If data already contains meta or is a stream/buffer, return as is
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data;
        }

        return {
          data,
          meta: {
            requestId,
          },
        };
      }),
    );
  }
}
