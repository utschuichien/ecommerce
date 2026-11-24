import { z } from 'zod';

export const productVariantItemSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .trim()
    .min(1, 'Mã SKU phân loại không được để trống.')
    .max(64, 'Mã SKU phân loại không vượt quá 64 ký tự.'),
  price: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const str = String(val).trim();
      if (!str) return false;
      const n = Number(str);
      return !isNaN(n) && n >= 1000;
    }, 'Giá phân loại phải từ 1.000 VNĐ trở lên.')
    .refine((val) => {
      const n = Number(val);
      return n <= 1_000_000_000;
    }, 'Giá phân loại không được vượt quá 1.000.000.000 VNĐ.')
    .transform((val) => Math.floor(Number(val))),
  stock: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const str = String(val).trim();
      if (!str) return false;
      const n = Number(str);
      return !isNaN(n) && n >= 0 && Number.isInteger(n);
    }, 'Kho phân loại phải là số nguyên không âm (≥ 0).')
    .refine((val) => {
      const n = Number(val);
      return n <= 1_000_000;
    }, 'Kho phân loại không được vượt quá 1.000.000.')
    .transform((val) => Math.floor(Number(val))),
  optionValues: z.record(z.string(), z.string()).optional(),
  image: z.string().optional(),
});

export type ProductVariantItemInput = z.infer<typeof productVariantItemSchema>;

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên sản phẩm không được để trống.')
      .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.')
      .max(200, 'Tên sản phẩm không được vượt quá 200 ký tự.'),
    subtitle: z
      .string()
      .trim()
      .max(500, 'Mô tả ngắn không được vượt quá 500 ký tự.')
      .optional()
      .or(z.literal('')),
    category: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn danh mục sản phẩm.'),
    hasVariants: z.boolean().default(false),
    price: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? Math.floor(Number(val)) : 0)),
    stock: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? Math.floor(Number(val)) : 0)),
    variants: z.array(productVariantItemSchema).optional(),
    imagesCount: z
      .number()
      .min(1, 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm từ máy tính.')
      .max(8, 'Tối đa 8 ảnh cho một sản phẩm.'),
    status: z.enum(['ACTIVE', 'HIDDEN']),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants) {
      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng tạo ít nhất 1 phân loại hàng.',
          path: ['variants'],
        });
      }
    } else {
      if (!data.price || data.price < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giá bán phải từ 1.000 VNĐ trở lên.',
          path: ['price'],
        });
      }
      if (data.stock === undefined || data.stock < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Số lượng kho phải là số nguyên không âm (≥ 0).',
          path: ['stock'],
        });
      }
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên sản phẩm không được để trống.')
      .min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.')
      .max(200, 'Tên sản phẩm không được vượt quá 200 ký tự.'),
    subtitle: z
      .string()
      .trim()
      .max(500, 'Mô tả ngắn không được vượt quá 500 ký tự.')
      .optional()
      .or(z.literal('')),
    sku: z
      .string()
      .trim()
      .min(1, 'Mã SKU không được để trống.')
      .min(2, 'Mã SKU phải có ít nhất 2 ký tự.')
      .max(64, 'Mã SKU không được vượt quá 64 ký tự.')
      .regex(/^[A-Za-z0-9-_]+$/, 'Mã SKU chỉ được chứa chữ cái, số, dấu gạch nối và gạch dưới.'),
    category: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn danh mục sản phẩm.'),
    hasVariants: z.boolean().default(false),
    price: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? Math.floor(Number(val)) : 0)),
    stock: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val !== undefined && val !== '' ? Math.floor(Number(val)) : 0)),
    variants: z.array(productVariantItemSchema).optional(),
    imagesCount: z
      .number()
      .min(1, 'Sản phẩm phải có ít nhất 1 hình ảnh.')
      .max(8, 'Tối đa 8 ảnh cho một sản phẩm.'),
    status: z.enum(['ACTIVE', 'HIDDEN', 'OUT_OF_STOCK']),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants) {
      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng tạo ít nhất 1 phân loại hàng.',
          path: ['variants'],
        });
      }
    } else {
      if (!data.price || data.price < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Giá bán phải từ 1.000 VNĐ trở lên.',
          path: ['price'],
        });
      }
      if (data.stock === undefined || data.stock < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Số lượng kho phải là số nguyên không âm (≥ 0).',
          path: ['stock'],
        });
      }
    }
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
