import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CartService } from './cart.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

describe('Module Giỏ hàng & Tồn kho (Cart & Inventory)', () => {
  let service: CartService;
  let prisma: any;
  const mockUser = {
    id: BigInt(1),
    publicId: 'usr_test_123',
    email: 'buyer@example.com',
  };

  const mockCart = {
    id: BigInt(10),
    userId: mockUser.id,
  };

  const mockActiveVariant = {
    id: BigInt(101),
    publicId: 'var_active_101',
    status: 'ACTIVE',
    price: 100000,
    inventory: {
      onHand: 5,
      reserved: 0,
    },
    product: {
      id: BigInt(201),
      publicId: 'prod_active_201',
      status: 'ACTIVE',
      name: 'Áo Thun Cao Cấp',
      shop: { id: BigInt(301), name: 'Shop Thời Trang', slug: 'shop-thoi-trang' },
    },
  };

  const mockInactiveVariant = {
    id: BigInt(102),
    publicId: 'var_inactive_102',
    status: 'INACTIVE', // Đã ngừng bán
    price: 150000,
    inventory: {
      onHand: 10,
      reserved: 0,
    },
    product: {
      id: BigInt(202),
      publicId: 'prod_inactive_202',
      status: 'INACTIVE',
      name: 'Sản phẩm ngừng kinh doanh',
      shop: { id: BigInt(301), name: 'Shop Thời Trang', slug: 'shop-thoi-trang' },
    },
  };

  const mockEmptyCartResponse = {
    totalItems: 0,
    totalQuantity: 0,
    selectedCount: 0,
    selectedQuantity: 0,
    shops: [],
    summary: { originalTotal: 0, finalTotal: 0, productDiscount: 0 },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      cart: {
        findUnique: jest.fn().mockResolvedValue(mockCart),
        create: jest.fn().mockResolvedValue(mockCart),
      },
      productVariant: {
        findFirst: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
      },
      cartItem: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  // =========================================================================
  // 1. [UT] Thêm vào giỏ: Validate số lượng (không âm, không vượt quá giới hạn)
  // =========================================================================
  describe('1. [UT] Thêm vào giỏ: Validate số lượng', () => {
    it('DTO: Báo lỗi khi số lượng < 1 (bằng 0 hoặc số âm)', async () => {
      // Trường hợp quantity = 0
      const dtoZero = plainToInstance(AddToCartDto, {
        variantId: 'var_test',
        quantity: 0,
      });
      const errorsZero = await validate(dtoZero);
      expect(errorsZero.length).toBeGreaterThan(0);
      expect(errorsZero[0].constraints?.min).toContain('Số lượng phải lớn hơn hoặc bằng 1');

      // Trường hợp quantity = -5 (số âm)
      const dtoNegative = plainToInstance(AddToCartDto, {
        variantId: 'var_test',
        quantity: -5,
      });
      const errorsNegative = await validate(dtoNegative);
      expect(errorsNegative.length).toBeGreaterThan(0);
      expect(errorsNegative[0].constraints?.min).toContain('Số lượng phải lớn hơn hoặc bằng 1');
    });

    it('DTO: Hợp lệ khi số lượng là số nguyên dương >= 1', async () => {
      const dtoValid = plainToInstance(AddToCartDto, {
        variantId: 'var_test',
        quantity: 3,
      });
      const errors = await validate(dtoValid);
      expect(errors.length).toBe(0);
    });

    it('Service: Ném BadRequestException nếu số lượng không phải số nguyên dương hợp lệ', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockActiveVariant);

      await expect(
        service.addToCart(mockUser.publicId, {
          variantId: mockActiveVariant.publicId,
          quantity: -1,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.addToCart(mockUser.publicId, {
          variantId: mockActiveVariant.publicId,
          quantity: 0,
        }),
      ).rejects.toThrow('Số lượng sản phẩm phải là số nguyên dương lớn hơn 0.');
    });
  });

  // =========================================================================
  // 2. [IT] Thêm vào giỏ: Số lượng thêm + số lượng đã có > tồn kho -> Tự động cap
  // =========================================================================
  describe('2. [IT] Thêm vào giỏ: Tự động cap lại đúng bằng tồn kho khi vượt mức', () => {
    beforeEach(() => {
      prisma.productVariant.findFirst.mockResolvedValue(mockActiveVariant);
      jest.spyOn(service, 'getCart').mockResolvedValue({
        ...mockEmptyCartResponse,
        shops: [
          {
            shopId: 'shop-thoi-trang',
            items: [
              {
                id: mockActiveVariant.publicId,
                variantId: mockActiveVariant.publicId,
                quantity: 5,
              },
            ],
          },
        ] as any,
      });
    });

    it('Khi số lượng thêm vào (4) + số lượng đã có (2) > tồn kho (5) -> Tự động cap về 5 và tăng thêm 3', async () => {
      // Giả lập trong giỏ đã có 2 món
      prisma.cartItem.findUnique.mockResolvedValue({
        id: BigInt(501),
        cartId: mockCart.id,
        variantId: mockActiveVariant.id,
        quantity: 2,
      });

      // Người dùng thêm 4 món (2 + 4 = 6 > tồn kho khả dụng là 5)
      const result = await service.addToCart(mockUser.publicId, {
        variantId: mockActiveVariant.publicId,
        quantity: 4,
      });

      // Kiểm tra upsert: chỉ được phép tăng thêm đúng (5 - 2 = 3) món
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            quantity: { increment: 3 },
          }),
        }),
      );

      // Kiểm tra kết quả trả về có flag capped = true và số lượng cappedTo = 5
      expect((result as any).capped).toBe(true);
      expect((result as any).cappedTo).toBe(5);
      expect((result as any).cappedMessage).toContain('Chỉ còn 5 sản phẩm, đã thêm tối đa.');
    });

    it('Khi trong giỏ ĐÃ ĐẠT ĐÚNG TỒN KHO TỐI ĐA (5/5) mà vẫn cố thêm -> Báo lỗi BadRequestException', async () => {
      // Giả lập giỏ hàng đã có đủ 5 món (bằng đúng tồn kho)
      prisma.cartItem.findUnique.mockResolvedValue({
        id: BigInt(501),
        cartId: mockCart.id,
        variantId: mockActiveVariant.id,
        quantity: 5,
      });

      await expect(
        service.addToCart(mockUser.publicId, {
          variantId: mockActiveVariant.publicId,
          quantity: 1,
        }),
      ).rejects.toThrow('Số lượng trong giỏ hàng đã đạt giới hạn tồn kho hiện có (5 sản phẩm).');
    });

    it('Khi sản phẩm đã hoàn toàn hết hàng (tồn kho = 0) -> Báo lỗi hết hàng', async () => {
      const outOfStockVariant = {
        ...mockActiveVariant,
        inventory: { onHand: 0, reserved: 0 },
      };
      prisma.productVariant.findFirst.mockResolvedValue(outOfStockVariant);

      await expect(
        service.addToCart(mockUser.publicId, {
          variantId: outOfStockVariant.publicId,
          quantity: 1,
        }),
      ).rejects.toThrow('Sản phẩm này hiện tại đã hết hàng.');
    });
  });

  // =========================================================================
  // 3. [IT] Update số lượng (PATCH): Tăng vượt tồn kho -> Báo lỗi. Giảm -> Cho phép
  // =========================================================================
  describe('3. [IT] Update số lượng (PATCH)', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getCart').mockResolvedValue(mockEmptyCartResponse as any);
    });

    it('Nếu tăng số lượng vượt quá tồn kho khả dụng (từ 3 lên 12 khi kho chỉ có 5) -> Báo lỗi BadRequestException', async () => {
      // Giả lập giỏ hàng đang có 3 món
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(601),
        cartId: mockCart.id,
        variantId: mockActiveVariant.id,
        quantity: 3,
        variant: mockActiveVariant, // tồn kho khả dụng = 5
      });

      // Cố tình PATCH số lượng = 12 (> 5)
      await expect(
        service.updateItemQuantity(mockUser.publicId, mockActiveVariant.publicId, {
          quantity: 12,
        }),
      ).rejects.toThrow('Số lượng yêu cầu (12) vượt quá tồn kho khả dụng (5 sản phẩm).');

      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });

    it('Nếu giảm số lượng (từ 3 xuống 2) -> Cho phép cập nhật thành công', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(601),
        cartId: mockCart.id,
        variantId: mockActiveVariant.id,
        quantity: 3,
        variant: mockActiveVariant,
      });

      await service.updateItemQuantity(mockUser.publicId, mockActiveVariant.publicId, {
        quantity: 2,
      });

      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 2 },
        }),
      );
    });

    it('Nếu cập nhật số lượng về 0 -> Tự động xóa món khỏi giỏ hàng', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(601),
        cartId: mockCart.id,
        variantId: mockActiveVariant.id,
        quantity: 3,
        variant: mockActiveVariant,
      });

      await service.updateItemQuantity(mockUser.publicId, mockActiveVariant.publicId, {
        quantity: 0,
      });

      expect(prisma.cartItem.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            cartId_variantId: {
              cartId: mockCart.id,
              variantId: mockActiveVariant.id,
            },
          },
        }),
      );
    });
  });

  // =========================================================================
  // 4. [IT] Update/Xóa món: Vẫn xóa/giảm được kể cả khi sản phẩm đã ngừng bán (INACTIVE)
  // =========================================================================
  describe('4. [IT] Thao tác với sản phẩm đã ngừng bán (INACTIVE)', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getCart').mockResolvedValue(mockEmptyCartResponse as any);
    });

    it('Xóa món (DELETE /cart/items/:id): Vẫn xóa thành công khi sản phẩm đã bị INACTIVE', async () => {
      // Món hàng trong giỏ của sản phẩm INACTIVE
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(701),
        cartId: mockCart.id,
        variantId: mockInactiveVariant.id,
        quantity: 2,
      });

      await service.removeItem(mockUser.publicId, mockInactiveVariant.publicId);

      expect(prisma.cartItem.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            cartId_variantId: {
              cartId: mockCart.id,
              variantId: mockInactiveVariant.id,
            },
          },
        }),
      );
    });

    it('Giảm số lượng về 0 (PATCH quantity: 0): Vẫn cho phép xóa món kể cả khi sản phẩm INACTIVE', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(701),
        cartId: mockCart.id,
        variantId: mockInactiveVariant.id,
        quantity: 2,
        variant: mockInactiveVariant,
      });

      await service.updateItemQuantity(mockUser.publicId, mockInactiveVariant.publicId, {
        quantity: 0,
      });

      expect(prisma.cartItem.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            cartId_variantId: {
              cartId: mockCart.id,
              variantId: mockInactiveVariant.id,
            },
          },
        }),
      );
    });

    it('Chặn tăng số lượng (PATCH): Báo lỗi "Sản phẩm đã ngừng bán." nếu cố tình tăng món INACTIVE', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: BigInt(701),
        cartId: mockCart.id,
        variantId: mockInactiveVariant.id,
        quantity: 2,
        variant: mockInactiveVariant,
      });

      // Cố tình tăng số lượng từ 2 lên 3 đối với sản phẩm đã INACTIVE
      await expect(
        service.updateItemQuantity(mockUser.publicId, mockInactiveVariant.publicId, {
          quantity: 3,
        }),
      ).rejects.toThrow('Sản phẩm đã ngừng bán.');

      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });
});
