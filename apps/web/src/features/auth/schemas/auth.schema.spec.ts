import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
} from './auth.schema';

describe('Auth & User Validation Schemas', () => {
  describe('1. loginSchema', () => {
    it('Báo lỗi khi bỏ trống email hoặc mật khẩu', () => {
      const result = loginSchema.safeParse({ email: '', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.email).toBeDefined();
        expect(errors.password).toBeDefined();
      }
    });

    it('Báo lỗi khi định dạng email không hợp lệ', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email-format',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email?.[0]).toContain('Định dạng email không hợp lệ');
      }
    });

    it('Báo lỗi khi mật khẩu ít hơn 6 ký tự', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password?.[0]).toContain('Mật khẩu phải có tối thiểu 6 ký tự');
      }
    });

    it('Hợp lệ với email và mật khẩu đúng chuẩn, hỗ trợ rememberMe', () => {
      const result = loginSchema.safeParse({
        email: 'customer@gmail.com',
        password: 'Password@123',
        rememberMe: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('customer@gmail.com');
        expect(result.data.rememberMe).toBe(true);
      }
    });
  });

  describe('2. registerSchema', () => {
    const validRegistration = {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0987654321',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
      agreeTerms: true,
    };

    it('Hợp lệ khi cung cấp đầy đủ thông tin đăng ký chuẩn', () => {
      const result = registerSchema.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });

    it('Báo lỗi khi số điện thoại Việt Nam sai định dạng', () => {
      const invalidPhones = ['123456', '012345678901', 'abc0987654', '0281234567'];
      for (const phone of invalidPhones) {
        const result = registerSchema.safeParse({
          ...validRegistration,
          phone,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.flatten().fieldErrors.phone).toBeDefined();
        }
      }
    });

    it('Hợp lệ với các đầu số di động Việt Nam phổ biến (03, 05, 07, 08, 09, 84...)', () => {
      const validPhones = ['0398765432', '0587654321', '0771234567', '0868123456', '0912345678', '8498765432'];
      for (const phone of validPhones) {
        const result = registerSchema.safeParse({
          ...validRegistration,
          phone,
        });
        expect(result.success).toBe(true);
      }
    });

    it('Báo lỗi khi mật khẩu ngắn hơn 8 ký tự', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password?.[0]).toContain('Mật khẩu phải có ít nhất 8 ký tự');
      }
    });

    it('Báo lỗi khi mật khẩu xác nhận không khớp', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        password: 'Password123',
        confirmPassword: 'DifferentPassword456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toContain('Mật khẩu xác nhận không khớp');
      }
    });

    it('Báo lỗi khi người dùng chưa đồng ý điều khoản dịch vụ (agreeTerms = false)', () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        agreeTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.agreeTerms?.[0]).toContain('Bạn cần đồng ý với Điều khoản');
      }
    });
  });

  describe('3. updateProfileSchema', () => {
    it('Hợp lệ với họ tên chuẩn và không bắt buộc số điện thoại', () => {
      const result = updateProfileSchema.safeParse({
        fullName: 'Trần Thị B',
      });
      expect(result.success).toBe(true);
    });

    it('Báo lỗi khi họ tên ít hơn 2 ký tự hoặc bỏ trống', () => {
      const result = updateProfileSchema.safeParse({ fullName: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.fullName).toBeDefined();
      }
    });

    it('Kiểm tra regex khi có nhập số điện thoại', () => {
      const invalid = updateProfileSchema.safeParse({
        fullName: 'Lê Văn C',
        phone: '111222',
      });
      expect(invalid.success).toBe(false);

      const valid = updateProfileSchema.safeParse({
        fullName: 'Lê Văn C',
        phone: '0909123456',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('4. changePasswordSchema', () => {
    it('Báo lỗi khi mật khẩu mới trùng với mật khẩu hiện tại', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'OldPassword123',
        confirmPassword: 'OldPassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.newPassword?.[0]).toContain('Mật khẩu mới không được trùng');
      }
    });

    it('Báo lỗi khi mật khẩu xác nhận không khớp mật khẩu mới', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'BrandNewPassword123',
        confirmPassword: 'MismatchPassword123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toContain('Mật khẩu xác nhận không khớp');
      }
    });

    it('Hợp lệ khi thay đổi mật khẩu đúng quy tắc', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'NewSecurePassword456',
        confirmPassword: 'NewSecurePassword456',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('5. createAddressSchema', () => {
    const validAddress = {
      recipientName: 'Phạm Văn D',
      phone: '0978123456',
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Dịch Vọng Hậu',
      line1: 'Số 123 Đường Xuân Thủy',
      isDefault: true,
    };

    it('Hợp lệ với địa chỉ giao hàng đầy đủ thông tin', () => {
      const result = createAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('Báo lỗi khi địa chỉ chi tiết (line1) quá ngắn (< 3 ký tự)', () => {
      const result = createAddressSchema.safeParse({
        ...validAddress,
        line1: 'Ab',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.line1?.[0]).toContain('ít nhất 3 ký tự');
      }
    });
  });
});
