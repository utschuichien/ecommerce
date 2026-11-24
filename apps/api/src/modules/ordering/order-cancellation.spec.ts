jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_5_MINUTES: '*/5 * * * *',
    EVERY_MINUTE: '* * * * *',
  },
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OrderingService } from './ordering.service';
import { InventoryExpirationCronService } from '../inventory/inventory-expiration-cron.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailQueueService } from '../../platform/mail/mail.queue';

describe('Module Hủy đơn & Hoàn tồn kho (Order Cancellation & Inventory Release - P2)', () => {
  let orderingService: OrderingService;
  let cronService: InventoryExpirationCronService;
  let prisma: any;
  let notificationsService: any;

  const mockUser = {
    id: BigInt(1),
    publicId: 'usr_buyer_cancel_1',
    email: 'buyer@commerce.vn',
  };

  const mockOrderId = BigInt(100);
  const mockOrderPublicId = 'ord_pub_cancel_100';
  const mockOrderNumber = 'ORD-CANCEL-100';

  const mockActiveOrder = {
    id: mockOrderId,
    publicId: mockOrderPublicId,
    orderNumber: mockOrderNumber,
    userId: mockUser.id,
    status: 'PENDING_PAYMENT',
    reservations: [
      {
        id: BigInt(501),
        orderId: mockOrderId,
        variantId: BigInt(201),
        quantity: 2,
        status: 'ACTIVE',
      },
      {
        id: BigInt(502),
        orderId: mockOrderId,
        variantId: BigInt(202),
        quantity: 1,
        status: 'ACTIVE',
      },
    ],
    voucherUsages: [
      {
        id: BigInt(601),
        voucherId: BigInt(301),
        userId: mockUser.id,
        orderId: mockOrderId,
        discountAmount: 50000n,
      },
    ],
    orderItems: [
      {
        id: BigInt(701),
        orderId: mockOrderId,
        shopId: BigInt(401),
        variantId: BigInt(201),
        quantity: 2,
      },
      {
        id: BigInt(702),
        orderId: mockOrderId,
        shopId: BigInt(402),
        variantId: BigInt(202),
        quantity: 1,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      order: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      sellerOrder: {
        updateMany: jest.fn(),
      },
      inventoryReservation: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      inventoryMovement: {
        create: jest.fn(),
      },
      voucher: {
        update: jest.fn(),
      },
      voucherUsage: {
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
      $executeRaw: jest.fn(),
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderingService,
        InventoryExpirationCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: VouchersService, useValue: { evaluateVoucher: jest.fn() } },
        { provide: MailQueueService, useValue: { enqueueSendOrderConfirmation: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    orderingService = module.get<OrderingService>(OrderingService);
    cronService = module.get<InventoryExpirationCronService>(InventoryExpirationCronService);
  });

  // =========================================================================
  // 1. [IT] Người mua chủ động hủy đơn (cancelMyOrder)
  // =========================================================================
  describe('1. [IT] Người mua hủy đơn hàng (cancelMyOrder)', () => {
    it('Hủy thành công khi đơn đang ở PENDING_PAYMENT: Giải phóng tồn kho reserved, hoàn voucher & đổi trạng thái CANCELLED', async () => {
      prisma.order.findFirst.mockResolvedValue(mockActiveOrder);

      const updatedReservations: any[] = [];
      const createdMovements: any[] = [];
      let updatedOrderStatus: string | null = null;
      let updatedSellerOrderStatus: string | null = null;
      let decrementedVoucherId: any = null;
      let deletedVoucherUsageId: any = null;

      // Giả lập transaction DB
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const fakeTx = {
          inventoryReservation: {
            update: jest.fn().mockImplementation(({ where, data }) => {
              updatedReservations.push({ id: where.id, ...data });
              return Promise.resolve({});
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          inventoryMovement: {
            create: jest.fn().mockImplementation(({ data }) => {
              createdMovements.push(data);
              return Promise.resolve({});
            }),
          },
          voucher: {
            update: jest.fn().mockImplementation(({ where, data }) => {
              decrementedVoucherId = where.id;
              return Promise.resolve({});
            }),
          },
          voucherUsage: {
            delete: jest.fn().mockImplementation(({ where }) => {
              deletedVoucherUsageId = where.id;
              return Promise.resolve({});
            }),
          },
          order: {
            update: jest.fn().mockImplementation(({ data }) => {
              updatedOrderStatus = data.status;
              return Promise.resolve({});
            }),
          },
          sellerOrder: {
            updateMany: jest.fn().mockImplementation(({ data }) => {
              updatedSellerOrderStatus = data.status;
              return Promise.resolve({});
            }),
          },
        };
        return callback(fakeTx);
      });

      const response = await orderingService.cancelMyOrder(
        mockUser.publicId,
        mockOrderPublicId,
        'Tôi đổi ý không muốn mua nữa',
      );

      // 1. Kết quả trả về thông báo hủy thành công
      expect(response.status).toBe('CANCELLED');
      expect(response.message).toContain('Hủy đơn hàng thành công');

      // 2. Cả 2 phiếu giữ chỗ phải chuyển sang RELEASED
      expect(updatedReservations.length).toBe(2);
      expect(updatedReservations[0].status).toBe('RELEASED');
      expect(updatedReservations[1].status).toBe('RELEASED');

      // 3. Phải ghi nhận 2 giao dịch hoàn kho (RELEASE) vào sổ cái InventoryMovement
      expect(createdMovements.length).toBe(2);
      expect(createdMovements[0].type).toBe('RELEASE');
      expect(createdMovements[0].reservedDelta).toBe(-2); // Trả lại 2 món
      expect(createdMovements[1].type).toBe('RELEASE');
      expect(createdMovements[1].reservedDelta).toBe(-1); // Trả lại 1 món

      // 4. Lượt dùng của voucher phải được hoàn trả lại
      expect(decrementedVoucherId).toBe(BigInt(301));
      expect(deletedVoucherUsageId).toBe(BigInt(601));

      // 5. Trạng thái Order và SellerOrder đều phải là CANCELLED
      expect(updatedOrderStatus).toBe('CANCELLED');
      expect(updatedSellerOrderStatus).toBe('CANCELLED');
    });

    it('Từ chối hủy nếu đơn hàng đã được shop duyệt hoặc đang vận chuyển (PROCESSING / SHIPPED / COMPLETED)', async () => {
      const processingOrder = {
        ...mockActiveOrder,
        status: 'PROCESSING', // Shop đang đóng gói hàng
      };
      prisma.order.findFirst.mockResolvedValue(processingOrder);

      await expect(
        orderingService.cancelMyOrder(mockUser.publicId, mockOrderPublicId),
      ).rejects.toThrow(BadRequestException);

      await expect(
        orderingService.cancelMyOrder(mockUser.publicId, mockOrderPublicId),
      ).rejects.toThrow('Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý.');

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('Từ chối nếu không tìm thấy đơn hàng hoặc đơn không thuộc về tài khoản người dùng', async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(
        orderingService.cancelMyOrder(mockUser.publicId, 'non-existent-order-id'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 2. [IT] Hệ thống tự động thu hồi tồn kho quá hạn 24h (Cron processExpiredReservations)
  // =========================================================================
  describe('2. [IT] Tự động giải phóng tồn kho cho đơn quá hạn 24h (Cron Service)', () => {
    it('Thu hồi tồn kho tự động khi có phiếu đặt trước quá hạn (expiresAt <= NOW)', async () => {
      const expiredReservations = [
        {
          id: BigInt(901),
          orderId: mockOrderId,
          variantId: BigInt(201),
          quantity: 3,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() - 3600000), // Quá hạn 1 giờ
          order: {
            id: mockOrderId,
            orderNumber: mockOrderNumber,
            status: 'PENDING_PAYMENT',
            sellerOrders: [{ id: BigInt(801), status: 'PENDING' }],
            voucherUsages: [],
            orderItems: [{ variantId: BigInt(201), shopId: BigInt(401) }],
          },
        },
      ];

      prisma.inventoryReservation.findMany.mockResolvedValue(expiredReservations);

      let updatedResStatus: string | null = null;
      let createdMovement: any = null;
      let updatedOrderStatus: string | null = null;

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const fakeTx = {
          inventoryReservation: {
            update: jest.fn().mockImplementation(({ data }) => {
              updatedResStatus = data.status;
              return Promise.resolve({});
            }),
          },
          $executeRaw: jest.fn().mockResolvedValue(1),
          inventoryMovement: {
            create: jest.fn().mockImplementation(({ data }) => {
              createdMovement = data;
              return Promise.resolve({});
            }),
          },
          order: {
            update: jest.fn().mockImplementation(({ data }) => {
              updatedOrderStatus = data.status;
              return Promise.resolve({});
            }),
          },
          sellerOrder: {
            updateMany: jest.fn().mockResolvedValue({}),
          },
          voucher: { update: jest.fn() },
          voucherUsage: { delete: jest.fn() },
        };
        return callback(fakeTx);
      });

      const result = await cronService.processExpiredReservations();

      // Kết quả thu hồi: Đã giải phóng đúng 1 phiếu và 3 sản phẩm
      expect(result.releasedQuantity).toBe(3);
      expect(result.expiredCount).toBe(1);

      // Trạng thái phiếu đặt trước chuyển thành EXPIRED
      expect(updatedResStatus).toBe('EXPIRED');

      // Ghi sổ cái hoàn trả kho
      expect(createdMovement).toBeDefined();
      expect(createdMovement.type).toBe('RELEASE');
      expect(createdMovement.reservedDelta).toBe(-3);
      expect(createdMovement.reason).toContain('Hết hạn giữ chỗ 24h');

      // Đơn hàng quá hạn thanh toán chuyển sang EXPIRED
      expect(updatedOrderStatus).toBe('EXPIRED');
    });

    it('Không làm gì khi không có phiếu giữ hàng nào quá hạn', async () => {
      prisma.inventoryReservation.findMany.mockResolvedValue([]);

      const result = await cronService.processExpiredReservations();

      expect(result.expiredCount).toBe(0);
      expect(result.releasedQuantity).toBe(0);
      expect(result.message).toContain('Không có phiếu giữ hàng nào quá hạn');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
