import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email.')
    .email('Định dạng email không hợp lệ.'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự.'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên.')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự.')
      .max(100, 'Họ tên không được vượt quá 100 ký tự.'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập địa chỉ email.')
      .email('Định dạng email không hợp lệ.'),
    phone: z
      .string()
      .min(1, 'Vui lòng nhập số điện thoại.')
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
        'Số điện thoại không hợp lệ.',
      ),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu.')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
      .max(100, 'Mật khẩu không được vượt quá 100 ký tự.'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận lại mật khẩu.'),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên không được để trống.')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự.')
    .max(100, 'Họ tên không được vượt quá 100 ký tự.'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(val),
      {
        message: 'Số điện thoại không hợp lệ.',
      },
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới.')
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự.')
      .max(100, 'Mật khẩu mới không được vượt quá 100 ký tự.'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu mới.'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createAddressSchema = z.object({
  recipientName: z
    .string()
    .min(1, 'Vui lòng nhập tên người nhận.')
    .min(2, 'Tên người nhận phải có ít nhất 2 ký tự.')
    .max(100, 'Tên người nhận không được vượt quá 100 ký tự.'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ.'),
  province: z
    .string()
    .min(1, 'Vui lòng nhập Tỉnh / Thành phố.'),
  district: z
    .string()
    .min(1, 'Vui lòng nhập Quận / Huyện.'),
  ward: z
    .string()
    .min(1, 'Vui lòng nhập Phường / Xã.'),
  line1: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ cụ thể.')
    .min(3, 'Địa chỉ cụ thể phải có ít nhất 3 ký tự.')
    .max(255, 'Địa chỉ cụ thể không được vượt quá 255 ký tự.'),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
