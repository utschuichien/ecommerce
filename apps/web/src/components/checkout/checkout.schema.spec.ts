import { describe, it, expect } from 'vitest';
import { recipientSchema } from './checkout.schema';

describe('Checkout Recipient Form Schema', () => {
  const validRecipient = {
    fullName: 'Hoàng Minh Tuấn',
    phone: '0912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    line1: 'Số 10 Lê Duẩn, Tòa nhà Bitexco',
    note: 'Giao trong giờ hành chính',
  };

  it('Hợp lệ với thông tin người nhận chuẩn xác', () => {
    const result = recipientSchema.safeParse(validRecipient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.saveToAddressBook).toBe(false);
      expect(result.data.note).toBe('Giao trong giờ hành chính');
    }
  });

  it('Báo lỗi khi số điện thoại không đúng chuẩn đầu số Việt Nam (10 chữ số)', () => {
    const invalidPhones = ['091234567', '091234567899', '19001234', '02838222333'];
    for (const phone of invalidPhones) {
      const result = recipientSchema.safeParse({
        ...validRecipient,
        phone,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.phone?.[0]).toContain('Số điện thoại không hợp lệ');
      }
    }
  });

  it('Chấp nhận cả định dạng +84 đối với số điện thoại', () => {
    const result = recipientSchema.safeParse({
      ...validRecipient,
      phone: '+84912345678',
    });
    expect(result.success).toBe(true);
  });

  it('Báo lỗi khi thiếu Tỉnh/Thành, Quận/Huyện hoặc Phường/Xã', () => {
    const result = recipientSchema.safeParse({
      ...validRecipient,
      province: '',
      district: '',
      ward: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.province).toBeDefined();
      expect(errors.district).toBeDefined();
      expect(errors.ward).toBeDefined();
    }
  });

  it('Báo lỗi khi địa chỉ chi tiết (line1) ít hơn 3 ký tự', () => {
    const result = recipientSchema.safeParse({
      ...validRecipient,
      line1: '1A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.line1?.[0]).toContain('Vui lòng nhập số nhà');
    }
  });

  it('Tự động gán default note là chuỗi rỗng và saveToAddressBook là false khi không truyền', () => {
    const { note, ...withoutOptional } = validRecipient;
    const result = recipientSchema.safeParse(withoutOptional);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe('');
      expect(result.data.saveToAddressBook).toBe(false);
    }
  });
});
