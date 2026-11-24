import { z } from 'zod';

export const recipientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ và tên.')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại.')
    .regex(
      /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
      'Số điện thoại không hợp lệ (gồm 10 chữ số, VD: 0912345678).',
    ),
  province: z.string().trim().min(1, 'Vui lòng chọn Tỉnh / Thành phố.'),
  district: z.string().trim().min(1, 'Vui lòng chọn Quận / Huyện.'),
  ward: z.string().trim().min(1, 'Vui lòng chọn Phường / Xã.'),
  line1: z
    .string()
    .trim()
    .min(
      3,
      'Vui lòng nhập số nhà, tên đường, tòa nhà...',
    )
    .max(255, 'Địa chỉ chi tiết không được vượt quá 255 ký tự.'),
  saveToAddressBook: z.boolean().default(false),
  note: z
    .string()
    .trim()
    .max(300, 'Ghi chú giao hàng không được vượt quá 300 ký tự.')
    .optional()
    .default(''),
});

export type RecipientFormData = z.infer<typeof recipientSchema>;

