import { z } from 'zod';

export const sellerGeneralSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên cửa hàng không được để trống')
    .max(50, 'Tên cửa hàng tối đa 50 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả cửa hàng tối đa 500 ký tự')
    .default(''),
  category: z.string().default('Điện tử - Công nghệ'),
  email: z
    .string()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), {
      message: 'Email liên hệ không hợp lệ',
    })
    .default(''),
  phone: z
    .string()
    .refine((val) => !val || /^[0-9+() -]{8,20}$/.test(val.trim()), {
      message: 'Số điện thoại không hợp lệ',
    })
    .default(''),
  address: z.string().default(''),
  allowOrders: z.boolean().default(true),
  showOutOfStock: z.boolean().default(false),
  requireAuthCheckout: z.boolean().default(true),
  operatingType: z.enum(['always', 'custom']).default('always'),
  openTime: z.string().default('08:00'),
  closeTime: z.string().default('22:00'),
  facebookUrl: z.string().default(''),
  youtubeUrl: z.string().default(''),
  tiktokUrl: z.string().default(''),
  xUrl: z.string().default(''),
});

export type SellerGeneralFormData = z.infer<typeof sellerGeneralSchema>;

export const sellerBrandingSchema = z.object({
  logoKey: z.string().default(''),
  bannerUrl: z.string().default(''),
  slogan: z
    .string()
    .max(80, 'Khẩu hiệu không được vượt quá 80 ký tự')
    .default(''),
  brandStory: z
    .string()
    .max(800, 'Câu chuyện thương hiệu không được vượt quá 800 ký tự')
    .default(''),
});

export type SellerBrandingFormData = z.infer<typeof sellerBrandingSchema>;

export const sellerShippingSchema = z.object({
  flatShippingFee: z.coerce
    .number()
    .min(0, 'Phí vận chuyển không được âm')
    .default(0),
  enableFreeShipping: z.boolean().default(false),
  freeShippingThreshold: z.coerce
    .number()
    .min(0, 'Ngưỡng miễn phí vận chuyển không được âm')
    .default(0),
  pickupContactName: z
    .string()
    .min(1, 'Vui lòng nhập tên người phụ trách kho')
    .max(100, 'Tối đa 100 ký tự'),
  pickupPhone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại kho lấy hàng')
    .refine((val) => /^[0-9+() -]{8,20}$/.test(val.trim()), {
      message: 'Số điện thoại kho hàng không hợp lệ',
    }),
  pickupAddress: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ chi tiết kho xuất hàng')
    .max(255, 'Tối đa 255 ký tự'),
  pickupNote: z.string().default(''),
  carriers: z
    .object({
      ghn: z.boolean().default(false),
      ghtk: z.boolean().default(false),
      viettelPost: z.boolean().default(false),
      express: z.boolean().default(false),
    })
    .refine((c) => c.ghn || c.ghtk || c.viettelPost || c.express, {
      message: 'Vui lòng bật ít nhất 1 đơn vị vận chuyển đối tác',
    }),
  allowInspection: z.boolean().default(true),
  dispatchTime: z.enum(['24h', '48h']).default('24h'),
});

export type SellerShippingFormData = z.infer<typeof sellerShippingSchema>;

export const sellerPaymentSchema = z.object({
  // 1. Tài khoản ngân hàng
  bankName: z.string().default(''),
  bankAccountNumber: z
    .string()
    .refine((val) => !val || /^[0-9A-Za-z]{6,25}$/.test(val.trim()), {
      message: 'Số tài khoản không hợp lệ (từ 6-25 ký tự)',
    })
    .default(''),
  bankAccountHolder: z
    .string()
    .max(100, 'Tên chủ tài khoản tối đa 100 ký tự')
    .default(''),
  bankBranch: z.string().max(100).default(''),

  // 2. Phương thức thanh toán từ người mua
  enableCod: z.boolean().default(true),
  maxCodAmount: z.coerce
    .number()
    .min(0, 'Hạn mức COD không được âm')
    .default(5000000),
  enableOnlinePayment: z.boolean().default(true),

  // 3. Hình thức và chu kỳ rút tiền
  payoutSchedule: z.enum(['manual', 'weekly', 'biweekly', 'monthly']).default('weekly'),
  minPayoutAmount: z.coerce
    .number()
    .min(0, 'Hạn mức rút tiền tối thiểu không được âm')
    .default(100000),
});

export type SellerPaymentFormData = z.infer<typeof sellerPaymentSchema>;

export const sellerPolicySchema = z.object({
  // 1. Chế độ tạm nghỉ bán (Holiday/Vacation Mode)
  holidayMode: z.boolean().default(false),
  holidayMessage: z
    .string()
    .max(250, 'Thông điệp tạm nghỉ tối đa 250 ký tự')
    .default(''),

  // 2. Chính sách Đổi trả & Hoàn tiền
  enableReturn: z.boolean().default(true),
  returnPeriodDays: z.coerce
    .number()
    .min(0, 'Thời gian đổi trả không hợp lệ')
    .default(7),
  requireUnboxVideo: z.boolean().default(true),
  returnPolicyNote: z
    .string()
    .max(500, 'Điều kiện đổi trả tối đa 500 ký tự')
    .default(''),

  // 3. Chính sách Bảo hành
  warrantyType: z
    .enum(['none', 'shop', 'manufacturer', 'electronic'])
    .default('shop'),
  warrantyPeriodMonths: z.coerce
    .number()
    .min(0, 'Thời gian bảo hành không hợp lệ')
    .default(12),
  warrantyPolicyNote: z
    .string()
    .max(500, 'Ghi chú bảo hành tối đa 500 ký tự')
    .default(''),
});

export type SellerPolicyFormData = z.infer<typeof sellerPolicySchema>;

