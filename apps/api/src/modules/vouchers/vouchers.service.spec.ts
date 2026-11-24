import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { PrismaService } from '../../platform/prisma/prisma.service';

describe('Module Khuyến Mãi & Voucher (Vouchers & Promotions)', () => {
  let service: VouchersService;
  let prisma: any;

  const mockUserId = BigInt(1);
  const mockUserPublicId = 'usr_voucher_test_1';

  const mockShop1Id = BigInt(101);
  const mockShop2Id = BigInt(102);

  const mockShop1 = {
    id: mockShop1Id,
    name: 'Shop Công Nghệ',
    slug: 'shop-cong-nghe',
    publicId: 'shp_pub_101',
  };

  const mockShop2 = {
    id: mockShop2Id,
    name: 'Shop Thời Trang',
    slug: 'shop-thoi-trang',
    publicId: 'shp_pub_102',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      shop: {
        findFirst: jest.fn(),
      },
      voucher: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      voucherUsage: {
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
  });

  // =========================================================================
  // 1. [UT] Công thức tính toán chiết khấu (Percentage, Fixed Amount, Free Shipping)
  // =========================================================================
  describe('1. [UT] Công thức tính chiết khấu giảm giá', () => {
    it('PERCENTAGE: Đơn 1.000.000đ giảm 20% nhưng có cap tối đa 50.000đ -> Chỉ giảm đúng 50.000đ', async () => {
      const voucherWithCap = {
        id: BigInt(1),
        code: 'SALE20MAX50K',
        name: 'Giảm 20% tối đa 50k',
        scope: 'GLOBAL',
        type: 'PERCENTAGE',
        discountValue: 20n, // 20%
        maxDiscountAmount: 50000n, // Giới hạn tối đa 50k
        minOrderValue: 200000n,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 1000,
        usedCount: 10,
        usagePerUser: 1,
      };

      prisma.voucher.findUnique.mockResolvedValue(voucherWithCap);

      const totalSubtotal = 1000000n; // 1 triệu (20% là 200k)
      const shopSubtotals = new Map([[mockShop1Id, { shop: mockShop1, subtotal: totalSubtotal }]]);

      const result = await service.evaluateVoucher(
        mockUserId,
        voucherWithCap.code,
        totalSubtotal,
        shopSubtotals,
        30000n,
      );

      // 200k > 50k nên phải bị chặn lại đúng mốc 50k
      expect(result.discountAmount).toBe(50000n);
    });

    it('PERCENTAGE: Đơn 200.000đ giảm 10% không vượt mốc tối đa -> Giảm đúng 20.000đ', async () => {
      const voucherNormal = {
        id: BigInt(2),
        code: 'SALE10',
        name: 'Giảm 10%',
        scope: 'GLOBAL',
        type: 'PERCENTAGE',
        discountValue: 10n,
        maxDiscountAmount: 50000n,
        minOrderValue: 100000n,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 1000,
        usedCount: 0,
        usagePerUser: 1,
      };

      prisma.voucher.findUnique.mockResolvedValue(voucherNormal);

      const totalSubtotal = 200000n;
      const shopSubtotals = new Map([[mockShop1Id, { shop: mockShop1, subtotal: totalSubtotal }]]);

      const result = await service.evaluateVoucher(
        mockUserId,
        voucherNormal.code,
        totalSubtotal,
        shopSubtotals,
        30000n,
      );

      expect(result.discountAmount).toBe(20000n);
    });

    it('FIXED_AMOUNT: Đơn 40.000đ áp mã giảm 50.000đ -> Số tiền giảm được cap lại đúng 40.000đ (không bị âm tiền)', async () => {
      const fixedVoucher = {
        id: BigInt(3),
        code: 'GIAM50K',
        name: 'Giảm ngay 50k',
        scope: 'GLOBAL',
        type: 'FIXED_AMOUNT',
        discountValue: 50000n,
        maxDiscountAmount: null,
        minOrderValue: 30000n,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 500,
        usedCount: 0,
        usagePerUser: 1,
      };

      prisma.voucher.findUnique.mockResolvedValue(fixedVoucher);

      const totalSubtotal = 40000n; // Đơn 40k nhỏ hơn mã 50k
      const shopSubtotals = new Map([[mockShop1Id, { shop: mockShop1, subtotal: totalSubtotal }]]);

      const result = await service.evaluateVoucher(
        mockUserId,
        fixedVoucher.code,
        totalSubtotal,
        shopSubtotals,
        30000n,
      );

      // Tiền giảm chỉ được tối đa bằng tiền hàng (40k)
      expect(result.discountAmount).toBe(40000n);
    });

    it('FREE_SHIPPING: Mã freeship 50.000đ trên phí vận chuyển thực tế 30.000đ -> Chỉ giảm tối đa 30.000đ tiền ship', async () => {
      const freeshipVoucher = {
        id: BigInt(4),
        code: 'FREESHIP50K',
        name: 'Miễn phí vận chuyển tới 50k',
        scope: 'GLOBAL',
        type: 'FREE_SHIPPING',
        discountValue: 50000n,
        maxDiscountAmount: null,
        minOrderValue: 50000n,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 500,
        usedCount: 0,
        usagePerUser: 1,
      };

      prisma.voucher.findUnique.mockResolvedValue(freeshipVoucher);

      const totalSubtotal = 200000n;
      const actualShippingFee = 30000n;
      const shopSubtotals = new Map([[mockShop1Id, { shop: mockShop1, subtotal: totalSubtotal }]]);

      const result = await service.evaluateVoucher(
        mockUserId,
        freeshipVoucher.code,
        totalSubtotal,
        shopSubtotals,
        actualShippingFee,
      );

      // Tiền giảm freeship không được vượt quá tiền ship thực tế
      expect(result.discountAmount).toBe(30000n);
    });
  });

  // =========================================================================
  // 2. [IT] Ràng buộc điều kiện áp mã (Validation constraints)
  // =========================================================================
  describe('2. [IT] Ràng buộc điều kiện áp mã voucher', () => {
    const baseValidVoucher = {
      id: BigInt(10),
      code: 'VALIDVOUCHER',
      name: 'Voucher chuẩn',
      scope: 'GLOBAL',
      type: 'FIXED_AMOUNT',
      discountValue: 20000n,
      minOrderValue: 150000n,
      isActive: true,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
      usageLimit: 100,
      usedCount: 5,
      usagePerUser: 1,
    };

    it('Từ chối khi mã voucher không tồn tại trong hệ thống', async () => {
      prisma.voucher.findUnique.mockResolvedValue(null);

      await expect(
        service.evaluateVoucher(mockUserId, 'NOTEXIST', 200000n, new Map(), 30000n),
      ).rejects.toThrow('Mã giảm giá "NOTEXIST" không tồn tại trên hệ thống.');
    });

    it('Từ chối khi mã voucher đang bị Admin tạm dừng (isActive = false)', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...baseValidVoucher,
        isActive: false,
      });

      await expect(
        service.evaluateVoucher(mockUserId, baseValidVoucher.code, 200000n, new Map(), 30000n),
      ).rejects.toThrow('hiện đang tạm ngừng áp dụng.');
    });

    it('Từ chối khi mã voucher đã hết hạn sử dụng (now > endDate)', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...baseValidVoucher,
        endDate: new Date(Date.now() - 3600000), // Đã hết hạn 1 tiếng trước
      });

      await expect(
        service.evaluateVoucher(mockUserId, baseValidVoucher.code, 200000n, new Map(), 30000n),
      ).rejects.toThrow('đã hết hạn sử dụng.');
    });

    it('Từ chối khi mã voucher chưa đến thời gian áp dụng (now < startDate)', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...baseValidVoucher,
        startDate: new Date(Date.now() + 86400000), // Ngày mai mới bắt đầu
      });

      await expect(
        service.evaluateVoucher(mockUserId, baseValidVoucher.code, 200000n, new Map(), 30000n),
      ).rejects.toThrow('chưa đến thời gian áp dụng');
    });

    it('Từ chối khi mã voucher đã hết lượt sử dụng toàn hệ thống (usedCount >= usageLimit)', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...baseValidVoucher,
        usageLimit: 100,
        usedCount: 100, // Đã dùng hết 100/100 lượt
      });

      await expect(
        service.evaluateVoucher(mockUserId, baseValidVoucher.code, 200000n, new Map(), 30000n),
      ).rejects.toThrow('đã hết lượt sử dụng.');
    });

    it('Từ chối khi người dùng đã dùng hết số lượt cá nhân cho phép (userUsedCount >= usagePerUser)', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...baseValidVoucher,
        usagePerUser: 1, // Mỗi khách chỉ được dùng 1 lần
      });

      // DB đếm thấy user này đã từng dùng mã này 1 lần rồi
      prisma.voucherUsage.count.mockResolvedValue(1);

      await expect(
        service.evaluateVoucher(mockUserId, baseValidVoucher.code, 200000n, new Map(), 30000n),
      ).rejects.toThrow('Bạn đã sử dụng hết số lượt cho phép (1 lần)');
    });

    it('Từ chối khi đơn hàng chưa đạt giá trị tối thiểu (minOrderValue = 150k nhưng đơn chỉ 120k)', async () => {
      prisma.voucher.findUnique.mockResolvedValue(baseValidVoucher);

      const subtotal120k = 120000n; // Còn thiếu 30k
      const shopSubtotals = new Map([[mockShop1Id, { shop: mockShop1, subtotal: subtotal120k }]]);

      await expect(
        service.evaluateVoucher(
          mockUserId,
          baseValidVoucher.code,
          subtotal120k,
          shopSubtotals,
          30000n,
        ),
      ).rejects.toThrow('Đơn hàng chưa đạt giá trị tối thiểu 150.000₫ (còn thiếu 30.000₫).');
    });
  });

  // =========================================================================
  // 3. [IT] Ràng buộc phạm vi áp dụng (Scope: GLOBAL vs SHOP)
  // =========================================================================
  describe('3. [IT] Ràng buộc phạm vi áp dụng (Scope)', () => {
    const shopVoucher = {
      id: BigInt(20),
      code: 'SHOPTECH30K',
      name: 'Voucher Shop Công Nghệ 30k',
      scope: 'SHOP',
      shopId: mockShop1Id, // Chỉ áp dụng cho Shop 1
      shop: mockShop1,
      type: 'FIXED_AMOUNT',
      discountValue: 30000n,
      minOrderValue: 200000n,
      isActive: true,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
      usageLimit: 500,
      usedCount: 0,
      usagePerUser: 2,
    };

    it('Từ chối khi voucher của Shop 1 nhưng giỏ hàng CHỈ CÓ sản phẩm của Shop 2', async () => {
      prisma.voucher.findUnique.mockResolvedValue(shopVoucher);

      // Giỏ hàng chỉ có sản phẩm của Shop 2
      const onlyShop2Subtotals = new Map([
        [mockShop2Id, { shop: mockShop2, subtotal: 300000n }],
      ]);

      await expect(
        service.evaluateVoucher(
          mockUserId,
          shopVoucher.code,
          300000n,
          onlyShop2Subtotals,
          30000n,
        ),
      ).rejects.toThrow('chỉ áp dụng cho sản phẩm thuộc gian hàng "Shop Công Nghệ"');
    });

    it('Từ chối khi đơn hàng có cả 2 Shop nhưng phần tiền của Shop 1 chưa đủ minOrderValue', async () => {
      prisma.voucher.findUnique.mockResolvedValue(shopVoucher);

      // Shop 1 chỉ có 100k (< 200k), Shop 2 có 300k (tổng = 400k)
      const mixedSubtotals = new Map([
        [mockShop1Id, { shop: mockShop1, subtotal: 100000n }],
        [mockShop2Id, { shop: mockShop2, subtotal: 300000n }],
      ]);

      await expect(
        service.evaluateVoucher(
          mockUserId,
          shopVoucher.code,
          400000n,
          mixedSubtotals,
          30000n,
        ),
      ).rejects.toThrow('Đơn hàng từ "Shop Công Nghệ" chưa đạt giá trị tối thiểu 200.000₫ (còn thiếu 100.000₫).');
    });

    it('Thành công khi phần tiền thuộc Shop 1 đạt đủ minOrderValue', async () => {
      prisma.voucher.findUnique.mockResolvedValue(shopVoucher);

      // Shop 1 đạt 250k (>= 200k)
      const validMixedSubtotals = new Map([
        [mockShop1Id, { shop: mockShop1, subtotal: 250000n }],
        [mockShop2Id, { shop: mockShop2, subtotal: 150000n }],
      ]);

      const result = await service.evaluateVoucher(
        mockUserId,
        shopVoucher.code,
        400000n,
        validMixedSubtotals,
        30000n,
      );

      expect(result.discountAmount).toBe(30000n);
      expect(result.shopId).toBe(mockShop1Id);
      expect(result.shopName).toBe('Shop Công Nghệ');
    });
  });

  // =========================================================================
  // 4. [IT] Thẩm định giỏ hàng (validateVoucher API)
  // =========================================================================
  describe('4. [IT] Thẩm định mã giảm giá trực tiếp từ giỏ hàng (validateVoucher)', () => {
    it('Báo lỗi 400 nếu người dùng chưa chọn (tick chọn) món hàng nào trong giỏ', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        publicId: mockUserPublicId,
        cart: {
          items: [], // Không có item nào có isSelected = true
        },
      });

      await expect(
        service.validateVoucher(mockUserPublicId, { code: 'SALE10' }),
      ).rejects.toThrow('Vui lòng chọn ít nhất 1 sản phẩm trong giỏ hàng để áp dụng mã giảm giá.');
    });

    it('Thành công và tính toán subtotal, discountAmount và finalTotal chuẩn xác', async () => {
      const activeCartItem = {
        id: BigInt(1),
        quantity: 2,
        isSelected: true,
        variant: {
          price: 150000n, // 2 x 150k = 300,000đ
          product: { shop: mockShop1 },
        },
      };

      prisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        publicId: mockUserPublicId,
        cart: {
          items: [activeCartItem],
        },
      });

      const fixed30kVoucher = {
        id: BigInt(99),
        code: 'GIAM30K',
        name: 'Giảm 30k',
        scope: 'GLOBAL',
        type: 'FIXED_AMOUNT',
        discountValue: 30000n,
        minOrderValue: 200000n,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageLimit: 500,
        usedCount: 0,
        usagePerUser: 1,
      };

      prisma.voucher.findUnique.mockResolvedValue(fixed30kVoucher);

      const response = await service.validateVoucher(mockUserPublicId, { code: 'GIAM30K' });

      expect(response.valid).toBe(true);
      expect(response.subtotal).toBe(300000);
      expect(response.discountAmount).toBe(30000);
      expect(response.finalTotal).toBe(270000); // 300k - 30k = 270k
      expect(response.message).toContain('Giảm 30.000₫');
    });
  });
});
