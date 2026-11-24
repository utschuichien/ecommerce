import { describe, it, expect } from 'vitest';
import {
  productVariantItemSchema,
  createProductSchema,
} from './seller-product.schema';
import {
  sellerShippingSchema,
} from './seller-settings.schema';

describe('Seller Product & Settings Validation Schemas', () => {
  describe('1. productVariantItemSchema', () => {
    it('Hợp lệ với phân loại hàng chuẩn và tự động ép kiểu số nguyên cho giá và kho', () => {
      const result = productVariantItemSchema.safeParse({
        sku: 'IP15-BLK-128',
        price: '21500000',
        stock: '50',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(21500000);
        expect(result.data.stock).toBe(50);
      }
    });

    it('Báo lỗi khi giá phân loại < 1.000 VNĐ hoặc kho là số âm', () => {
      const invalidPrice = productVariantItemSchema.safeParse({
        sku: 'SKU-01',
        price: 500,
        stock: 10,
      });
      expect(invalidPrice.success).toBe(false);

      const invalidStock = productVariantItemSchema.safeParse({
        sku: 'SKU-01',
        price: 50000,
        stock: -5,
      });
      expect(invalidStock.success).toBe(false);
    });
  });

  describe('2. createProductSchema (Single vs Multi-variant Product)', () => {
    const baseProduct = {
      name: 'Áo Thun Nam Cotton Thoáng Khí',
      subtitle: 'Chất vải 100% cotton cao cấp',
      category: 'cat-fashion-1',
      imagesCount: 2,
      status: 'ACTIVE' as const,
    };

    it('Sản phẩm đơn (hasVariants = false): Bắt buộc nhập giá >= 1.000đ và tồn kho >= 0', () => {
      const valid = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: false,
        price: 199000,
        stock: 100,
      });
      expect(valid.success).toBe(true);

      const missingPrice = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: false,
        price: 0,
        stock: 50,
      });
      expect(missingPrice.success).toBe(false);
      if (!missingPrice.success) {
        expect(missingPrice.error.flatten().fieldErrors.price?.[0]).toContain('Giá bán phải từ 1.000 VNĐ trở lên');
      }
    });

    it('Sản phẩm có biến thể (hasVariants = true): Bắt buộc có ít nhất 1 phân loại hàng', () => {
      const noVariants = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: true,
        variants: [],
      });
      expect(noVariants.success).toBe(false);
      if (!noVariants.success) {
        expect(noVariants.error.flatten().fieldErrors.variants?.[0]).toContain('Vui lòng tạo ít nhất 1 phân loại hàng');
      }

      const withVariants = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: true,
        variants: [
          { sku: 'AO-TRANG-L', price: 180000, stock: 20 },
          { sku: 'AO-DEN-XL', price: 190000, stock: 30 },
        ],
      });
      expect(withVariants.success).toBe(true);
    });

    it('Báo lỗi khi số lượng ảnh không nằm trong khoảng 1 - 8 ảnh', () => {
      const zeroImages = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: false,
        price: 50000,
        stock: 10,
        imagesCount: 0,
      });
      expect(zeroImages.success).toBe(false);

      const tooManyImages = createProductSchema.safeParse({
        ...baseProduct,
        hasVariants: false,
        price: 50000,
        stock: 10,
        imagesCount: 9,
      });
      expect(tooManyImages.success).toBe(false);
    });
  });

  describe('3. sellerShippingSchema (Cấu hình vận chuyển Shop)', () => {
    const validShipping = {
      pickupContactName: 'Kho Tổng Shopee Mall',
      pickupPhone: '0988776655',
      pickupAddress: 'Kho số 5, KCN Tân Bình, Tân Phú, TP. HCM',
      carriers: {
        ghn: true,
        ghtk: false,
        viettelPost: false,
        express: false,
      },
      flatShippingFee: 25000,
      enableFreeShipping: true,
      freeShippingThreshold: 500000,
    };

    it('Hợp lệ khi bật ít nhất 1 đơn vị vận chuyển đối tác', () => {
      const result = sellerShippingSchema.safeParse(validShipping);
      expect(result.success).toBe(true);
    });

    it('Báo lỗi khi Shop tắt toàn bộ đơn vị vận chuyển đối tác', () => {
      const result = sellerShippingSchema.safeParse({
        ...validShipping,
        carriers: {
          ghn: false,
          ghtk: false,
          viettelPost: false,
          express: false,
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.carriers?.[0]).toContain('Vui lòng bật ít nhất 1 đơn vị vận chuyển');
      }
    });

    it('Báo lỗi khi thiếu thông tin người liên hệ hoặc địa chỉ kho lấy hàng', () => {
      const result = sellerShippingSchema.safeParse({
        ...validShipping,
        pickupContactName: '',
        pickupAddress: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.pickupContactName).toBeDefined();
        expect(errors.pickupAddress).toBeDefined();
      }
    });
  });
});
