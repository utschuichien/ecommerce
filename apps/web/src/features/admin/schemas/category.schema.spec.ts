import { describe, it, expect } from 'vitest';
import { categoryFormSchema, generateSlug } from './category.schema';

describe('Category Form Schema & Slug Helper', () => {
  describe('1. categoryFormSchema', () => {
    it('Hợp lệ với thông tin danh mục cơ bản', () => {
      const result = categoryFormSchema.safeParse({
        name: 'Thời trang nam',
        slug: 'thoi-trang-nam',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.position).toBe(0);
        expect(result.data.isActive).toBe(true);
      }
    });

    it('Báo lỗi khi tên danh mục để trống hoặc quá ngắn (< 2 ký tự)', () => {
      const emptyResult = categoryFormSchema.safeParse({ name: '' });
      expect(emptyResult.success).toBe(false);

      const shortResult = categoryFormSchema.safeParse({ name: 'A' });
      expect(shortResult.success).toBe(false);
      if (!shortResult.success) {
        expect(shortResult.error.flatten().fieldErrors.name?.[0]).toContain('ít nhất 2 ký tự');
      }
    });

    it('Chặn tên danh mục chỉ chứa khoảng trắng (tự động trim và báo lỗi trống)', () => {
      const result = categoryFormSchema.safeParse({ name: '     ' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name?.[0]).toContain('không được để trống');
      }
    });

    it('Báo lỗi khi slug chứa chữ hoa hoặc ký tự đặc biệt không đúng chuẩn SEO', () => {
      const invalidSlugs = ['Thoi-Trang', 'dien_thoai', 'laptop@2024', 'giay--dep'];
      for (const slug of invalidSlugs) {
        const result = categoryFormSchema.safeParse({
          name: 'Điện tử gia dụng',
          slug,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.flatten().fieldErrors.slug).toBeDefined();
        }
      }
    });

    it('Ép kiểu số (coerce) và kiểm tra thứ tự ưu tiên (position)', () => {
      const coerced = categoryFormSchema.safeParse({
        name: 'Đồng hồ',
        position: '15' as unknown as number,
      });
      expect(coerced.success).toBe(true);
      if (coerced.success) {
        expect(coerced.data.position).toBe(15);
      }

      const negative = categoryFormSchema.safeParse({
        name: 'Đồng hồ',
        position: -1,
      });
      expect(negative.success).toBe(false);
    });
  });

  describe('2. generateSlug helper function', () => {
    it('Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu chuẩn SEO', () => {
      expect(generateSlug('Thời Trang Nam & Nữ Cao Cấp')).toBe('thoi-trang-nam-nu-cao-cap');
      expect(generateSlug('Điện Thoại Di Động - Phụ Kiện')).toBe('dien-thoai-di-dong-phu-kien');
    });

    it('Xóa bỏ các ký tự đặc biệt, dấu câu, emoji', () => {
      expect(generateSlug('Giảm giá sốc 50% 🔥 Duy nhất hôm nay!')).toBe('giam-gia-soc-50-duy-nhat-hom-nay');
    });

    it('Rút gọn các khoảng trắng và dấu gạch nối liên tiếp', () => {
      expect(generateSlug('   Đồ   gia    dụng   ---   bếp  ')).toBe('do-gia-dung-bep');
    });

    it('Trả về chuỗi rỗng khi tham số rỗng hoặc falsy', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null as unknown as string)).toBe('');
    });
  });
});
