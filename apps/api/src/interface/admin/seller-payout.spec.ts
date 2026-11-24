import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../platform/prisma/prisma.service';

describe('Module Tài Chính Shop & Quyết Toán (Seller Payout & Commission - P3)', () => {
  let adminService: AdminService;
  let prisma: any;

  const mockShop1 = {
    id: BigInt(101),
    publicId: 'shp_pub_101',
    name: 'Tech World Store',
    slug: 'tech-world-store',
    status: 'ACTIVE',
    members: [
      {
        role: 'OWNER',
        user: {
          fullName: 'Trần Văn Chủ Shop',
          email: 'techworld@seller.vn',
          phone: '0988776655',
        },
      },
    ],
    sellerOrders: [
      {
        status: 'DELIVERED', // Đã giao thành công -> Được quyết toán
        total: 2000000n, // 2.000.000đ
        deliveredAt: new Date(),
      },
      {
        status: 'DELIVERED',
        total: 500000n, // 500.000đ
        deliveredAt: new Date(),
      },
      {
        status: 'SHIPPED', // Đang giao -> Chưa được giải ngân
        total: 800000n,
        deliveredAt: null,
      },
      {
        status: 'CANCELLED', // Đã hủy -> Không tính vào doanh thu
        total: 300000n,
        deliveredAt: null,
      },
    ],
  };

  const mockShop2 = {
    id: BigInt(102),
    publicId: 'shp_pub_102',
    name: 'Fashion Boutique',
    slug: 'fashion-boutique',
    status: 'ACTIVE',
    members: [
      {
        role: 'OWNER',
        user: {
          fullName: 'Lê Thị Thời Trang',
          email: 'fashion@seller.vn',
          phone: '0911223344',
        },
      },
    ],
    sellerOrders: [
      {
        status: 'PROCESSING', // Chưa có đơn nào DELIVERED
        total: 450000n,
        deliveredAt: null,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      shop: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
  });

  // =========================================================================
  // 1. [UT] Công thức tính hoa hồng sàn 5% và Doanh thu thực nhận của Shop
  // =========================================================================
  describe('1. [UT] Công thức tính hoa hồng sàn (Commission Fee) và Thực nhận (Net Payout)', () => {
    it('Tính chính xác phí sàn 5% trên đơn hàng đã giao (DELIVERED) và số tiền thực nhận (95%)', async () => {
      prisma.shop.findMany.mockResolvedValue([mockShop1]);

      const result = await adminService.getPayouts();
      expect(result.items.length).toBe(1);

      const shopPayout = result.items[0];

      // Đơn DELIVERED: 2.000.000 + 500.000 = 2.500.000đ
      expect(shopPayout.deliveredRevenue).toBe(2500000);
      expect(shopPayout.deliveredOrdersCount).toBe(2);

      // Phí sàn thu 5%: 2.500.000 x 5% = 125.000đ
      expect(shopPayout.commissionFee).toBe(125000);

      // Thực nhận của Shop: 2.500.000 - 125.000 = 2.375.000đ
      expect(shopPayout.netPayout).toBe(2375000);

      // Gross Revenue loại trừ đơn CANCELLED: 2.000k + 500k + 800k = 3.300.000đ
      expect(shopPayout.grossRevenue).toBe(3300000);
    });

    it('Không tính phí sàn trên đơn hàng bị hủy (CANCELLED) và đơn chưa giao (SHIPPED/PROCESSING)', async () => {
      prisma.shop.findMany.mockResolvedValue([mockShop2]);

      const result = await adminService.getPayouts();
      const shopPayout = result.items[0];

      // Shop 2 chỉ có đơn PROCESSING -> deliveredRevenue = 0
      expect(shopPayout.deliveredRevenue).toBe(0);
      expect(shopPayout.deliveredOrdersCount).toBe(0);
      expect(shopPayout.commissionFee).toBe(0);
      expect(shopPayout.netPayout).toBe(0);

      // Gross Revenue vẫn ghi nhận giá trị đơn đang xử lý
      expect(shopPayout.grossRevenue).toBe(450000);
    });
  });

  // =========================================================================
  // 2. [IT] Trạng thái giải ngân (payoutStatus)
  // =========================================================================
  describe('2. [IT] Trạng thái giải ngân (payoutStatus)', () => {
    it('Gán trạng thái READY khi shop có đơn hàng đã giao thành công chờ đối soát', async () => {
      prisma.shop.findMany.mockResolvedValue([mockShop1]);

      const result = await adminService.getPayouts();
      expect(result.items[0].payoutStatus).toBe('READY');
    });

    it('Gán trạng thái SETTLED khi shop không có đơn hàng nào chờ giải ngân', async () => {
      prisma.shop.findMany.mockResolvedValue([mockShop2]);

      const result = await adminService.getPayouts();
      expect(result.items[0].payoutStatus).toBe('SETTLED');
    });
  });

  // =========================================================================
  // 3. [IT] Tổng hợp đối soát toàn sàn (Summary Metrics)
  // =========================================================================
  describe('3. [IT] Tổng hợp đối soát tài chính toàn sàn (Summary)', () => {
    it('Cộng dồn chuẩn xác GMV toàn sàn, tổng hoa hồng nền tảng và tổng tiền giải ngân', async () => {
      // Hệ thống có cả Shop 1 và Shop 2
      prisma.shop.findMany.mockResolvedValue([mockShop1, mockShop2]);

      const result = await adminService.getPayouts();
      const summary = result.summary;

      // Tổng GMV thực giao của cả sàn = 2.500.000đ (Shop 1) + 0đ (Shop 2) = 2.500.000đ
      expect(summary.totalDeliveredGMV).toBe(2500000);

      // Tổng hoa hồng nền tảng thu được = 125.000đ
      expect(summary.totalPlatformCommission).toBe(125000);

      // Tổng số tiền sàn cần chuyển khoản cho các đối tác = 2.375.000đ
      expect(summary.totalNetPayout).toBe(2375000);

      expect(summary.cycleType).toContain('T+3');
    });
  });

  // =========================================================================
  // 4. [IT] Lệnh giải ngân doanh thu cho Shop (settlePayout)
  // =========================================================================
  describe('4. [IT] Lệnh giải ngân cho Shop (settlePayout)', () => {
    it('Giải ngân thành công khi tìm thấy gian hàng hợp lệ', async () => {
      prisma.shop.findFirst.mockResolvedValue({
        id: mockShop1.id,
        publicId: mockShop1.publicId,
        name: mockShop1.name,
      });

      const response = await adminService.settlePayout(mockShop1.publicId);

      expect(response.success).toBe(true);
      expect(response.shopId).toBe(mockShop1.publicId);
      expect(response.message).toContain('Đã hoàn tất lệnh giải ngân');
      expect(response.message).toContain('Tech World Store');
    });

    it('Báo lỗi NotFoundException khi mã gian hàng không tồn tại', async () => {
      prisma.shop.findFirst.mockResolvedValue(null);

      await expect(adminService.settlePayout('non_existent_shop')).rejects.toThrow(
        NotFoundException,
      );

      await expect(adminService.settlePayout('non_existent_shop')).rejects.toThrow(
        'Không tìm thấy gian hàng.',
      );
    });
  });

  // =========================================================================
  // 5. [UT] Thông tin liên hệ chủ shop để chuyển khoản
  // =========================================================================
  describe('5. [UT] Thông tin người thụ hưởng (Shop Owner)', () => {
    it('Trích xuất đúng Tên, Email và Số điện thoại của chủ gian hàng (Owner)', async () => {
      prisma.shop.findMany.mockResolvedValue([mockShop1]);

      const result = await adminService.getPayouts();
      const shopItem = result.items[0];

      expect(shopItem.ownerName).toBe('Trần Văn Chủ Shop');
      expect(shopItem.ownerEmail).toBe('techworld@seller.vn');
      expect(shopItem.ownerPhone).toBe('0988776655');
    });
  });
});
