import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit_options';

export interface RateLimitOptions {
  /**
   * Số lượng yêu cầu tối đa cho phép trong khung thời gian
   * @default 120
   */
  points?: number;

  /**
   * Khung thời gian giới hạn (tính bằng giây)
   * @default 60
   */
  duration?: number;

  /**
   * Thông báo lỗi trả về bằng Tiếng Việt khi vượt quá giới hạn
   */
  message?: string;

  /**
   * Tiền tố định danh trong Redis
   * @default 'rl'
   */
  keyPrefix?: string;

  /**
   * Bỏ qua kiểm tra Rate Limit cho endpoint này
   */
  skip?: boolean;
}

/**
 * Decorator cấu hình giới hạn tần suất yêu cầu (Rate Limiting)
 * Hỗ trợ áp dụng cho Controller hoặc từng Route Handler cụ thể
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
