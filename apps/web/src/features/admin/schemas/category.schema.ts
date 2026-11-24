import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên danh mục không được để trống.')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự.')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự.')
    .refine(
      (val) => !/^[\s]+$/.test(val),
      'Tên danh mục không được chỉ chứa khoảng trắng.',
    ),
  slug: z
    .string()
    .trim()
    .max(100, 'Slug không được vượt quá 100 ký tự.')
    .refine(
      (val) => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      'Slug chỉ được chứa chữ thường không dấu, số và dấu gạch nối (ví dụ: dien-thoai-thong-minh).',
    )
    .optional(),
  position: z.coerce
    .number()
    .int('Thứ tự ưu tiên phải là số nguyên.')
    .min(0, 'Thứ tự ưu tiên phải lớn hơn hoặc bằng 0.')
    .max(9999, 'Thứ tự ưu tiên không được vượt quá 9999.')
    .default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/**
 * Hàm tiện ích chuyển đổi tiếng Việt có dấu thành Slug chuẩn SEO
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
