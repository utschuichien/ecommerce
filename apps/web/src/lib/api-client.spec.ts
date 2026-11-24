import { describe, it, expect } from 'vitest';
import { formatVND, extractErrorMessage } from './api-client';

describe('Frontend API Client & Helper Utilities', () => {
  describe('formatVND', () => {
    it('Định dạng số tiền VND chính xác với dấu chấm ngăn cách và ký hiệu ₫', () => {
      const formatted = formatVND(100000);
      expect(formatted).toContain('100.000');
      expect(formatted).toContain('₫');
    });

    it('Định dạng đúng cho số 0', () => {
      const formatted = formatVND(0);
      expect(formatted).toContain('0');
      expect(formatted).toContain('₫');
    });

    it('Hỗ trợ kiểu dữ liệu BigInt an toàn', () => {
      const formatted = formatVND(BigInt(5000000));
      expect(formatted).toContain('5.000.000');
      expect(formatted).toContain('₫');
    });
  });

  describe('extractErrorMessage', () => {
    it('Trích xuất message từ response.data.error.message', () => {
      const mockErr = {
        response: {
          data: {
            error: { message: 'Tài khoản đã bị tạm khóa' },
          },
        },
      };
      expect(extractErrorMessage(mockErr)).toBe('Tài khoản đã bị tạm khóa');
    });

    it('Trích xuất mảng message và nối lại bằng dấu phẩy', () => {
      const mockErr = {
        response: {
          data: {
            message: ['Tên không được để trống', 'SĐT không hợp lệ'],
          },
        },
      };
      expect(extractErrorMessage(mockErr)).toBe('Tên không được để trống, SĐT không hợp lệ');
    });

    it('Trả về fallback message khi không có thông tin lỗi cụ thể', () => {
      expect(extractErrorMessage({}, 'Lỗi mặc định')).toBe('Lỗi mặc định');
    });
  });
});
