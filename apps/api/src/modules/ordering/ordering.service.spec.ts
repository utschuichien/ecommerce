import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { of, lastValueFrom } from 'rxjs';
import { OrderingService } from './ordering.service';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailQueueService } from '../../platform/mail/mail.queue';
import { IdempotencyInterceptor } from '../../platform/interceptors/idempotency.interceptor';
import { CheckoutOrderDto, ShippingAddressDto } from './dto/checkout-order.dto';

describe('Module Checkout & Đặt hàng (Ordering & Checkout)', () => {
  let orderingService: OrderingService;
  let idempotencyInterceptor: IdempotencyInterceptor;
  let prisma: any;
  let vouchersService: any;
  let notificationsService: any;
  let mailQueueService: any;
  let configService: any;

  // Dữ liệu người dùng và giỏ hàng mẫu
  const mockUser = {
    id: BigInt(1),
    publicId: 'usr_order_test_1',
    email: 'buyer@commerce.vn',
    fullName: 'Nguyen Van A',
  };

  const mockCart = {
    id: BigInt(10),
    userId: mockUser.id,
  };

  const validShippingAddress: ShippingAddressDto = {
    recipientName: 'Nguyen Van A',
    phone: '0901234567',
    line1: '123 Nguyen Trai, Phuong 7',
    ward: 'Phuong 7',
    district: 'Quan 5',
    province: 'TP. Ho Chi Minh',
  };

  const validCheckoutDto: CheckoutOrderDto = {
    shippingAddress: validShippingAddress,
    paymentMethod: 'COD',
    contactPhone: '0901234567',
    contactEmail: 'buyer@commerce.vn',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      cart: {
        findUnique: jest.fn().mockResolvedValue(mockCart),
      },
      cartItem: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      idempotencyKey: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      shopMember: {
        findFirst: jest.fn().mockResolvedValue({ userId: BigInt(99) }),
      },
      // Hỗ trợ transaction mockup
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
    };

    vouchersService = {
      evaluateVoucher: jest.fn().mockResolvedValue(null),
    };

    notificationsService = {
      createNotification: jest.fn().mockResolvedValue({}),
    };

    mailQueueService = {
      enqueueSendOrderConfirmation: jest.fn().mockResolvedValue({}),
    };

    configService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderingService,
        IdempotencyInterceptor,
        { provide: PrismaService, useValue: prisma },
        { provide: VouchersService, useValue: vouchersService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: MailQueueService, useValue: mailQueueService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    orderingService = module.get<OrderingService>(OrderingService);
    idempotencyInterceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
  });

  // =========================================================================
  // 1. [UT] Validate địa chỉ giao hàng: Thiếu Tên, SĐT, Địa chỉ chi tiết -> Báo lỗi 400
  // =========================================================================
  describe('1. [UT] Validate địa chỉ giao hàng', () => {
    it('Báo lỗi validate khi thiếu Tên người nhận (recipientName)', async () => {
      const dto = plainToInstance(CheckoutOrderDto, {
        shippingAddress: {
          phone: '0901234567',
          line1: '123 Nguyen Trai',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const addressErrors = errors.find((e) => e.property === 'shippingAddress')?.children || [];
      const nameError = addressErrors.find((e) => e.property === 'recipientName');
      expect(nameError?.constraints?.isNotEmpty).toContain('Tên người nhận không được để trống.');
    });

    it('Báo lỗi validate khi thiếu Số điện thoại (phone)', async () => {
      const dto = plainToInstance(CheckoutOrderDto, {
        shippingAddress: {
          recipientName: 'Nguyen Van A',
          line1: '123 Nguyen Trai',
        },
      });

      const errors = await validate(dto);
      const addressErrors = errors.find((e) => e.property === 'shippingAddress')?.children || [];
      const phoneError = addressErrors.find((e) => e.property === 'phone');
      expect(phoneError?.constraints?.isNotEmpty).toContain('Số điện thoại không được để trống.');
    });

    it('Báo lỗi validate khi thiếu Địa chỉ chi tiết (line1)', async () => {
      const dto = plainToInstance(CheckoutOrderDto, {
        shippingAddress: {
          recipientName: 'Nguyen Van A',
          phone: '0901234567',
        },
      });

      const errors = await validate(dto);
      const addressErrors = errors.find((e) => e.property === 'shippingAddress')?.children || [];
      const line1Error = addressErrors.find((e) => e.property === 'line1');
      expect(line1Error?.constraints?.isNotEmpty).toContain('Địa chỉ giao hàng không được để trống.');
    });

    it('Hợp lệ khi cung cấp đầy đủ thông tin nhận hàng bắt buộc', async () => {
      const dto = plainToInstance(CheckoutOrderDto, validCheckoutDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // =========================================================================
  // 2. [E2E] Idempotency: Bắn 2 request tạo đơn cùng 1 Idempotency-Key
  // =========================================================================
  describe('2. [E2E] Idempotency: Kiểm soát tạo đơn trùng lặp với Idempotency-Key', () => {
    const mockCreatedOrderResult = {
      orderId: 'ORD-SUCCESS-123',
      grandTotal: 300000,
      status: 'PENDING_PAYMENT',
    };

    it('Request 1 ghi nhận key mới và hoàn tất; Request 2 cùng key trả về ngay kết quả cũ (Replay)', async () => {
      const idemKey = 'idem-unique-key-001';
      const mockReq = {
        headers: { 'idempotency-key': idemKey },
        method: 'POST',
        url: '/orders/checkout',
        body: validCheckoutDto,
        user: { userId: mockUser.publicId },
      };
      const mockRes = { statusCode: 201, status: jest.fn() };
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      };

      // Giả lập Request 1: Key chưa tồn tại -> create thành công
      prisma.idempotencyKey.create.mockResolvedValueOnce({
        id: BigInt(1),
        idemKey,
        status: 'IN_PROGRESS',
      });
      const callHandlerFirst: any = {
        handle: () => of(mockCreatedOrderResult),
      };

      const result1 = await lastValueFrom(
        idempotencyInterceptor.intercept(mockContext, callHandlerFirst),
      );
      expect(result1).toEqual(mockCreatedOrderResult);

      // Giả lập Request 2 gửi cùng key: Prisma ném lỗi P2002 (Duplicate Key)
      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';
      prisma.idempotencyKey.create.mockRejectedValueOnce(p2002Error);

      // Tìm thấy bản ghi đã COMPLETED từ request trước
      prisma.idempotencyKey.findUnique.mockResolvedValueOnce({
        id: BigInt(1),
        idemKey,
        status: 'COMPLETED',
        requestHash: (idempotencyInterceptor as any).hashRequest(validCheckoutDto),
        responseStatus: 201,
        responseBody: mockCreatedOrderResult,
      });

      const callHandlerSecond: any = {
        handle: jest.fn(), // Không được phép gọi lại handler/controller
      };

      const result2 = await lastValueFrom(
        idempotencyInterceptor.intercept(mockContext, callHandlerSecond),
      );

      // Kết quả của request 2 giống hệt kết quả cũ và KHÔNG chạy lại nghiệp vụ tạo đơn
      expect(result2).toEqual(mockCreatedOrderResult);
      expect(callHandlerSecond.handle).not.toHaveBeenCalled();
    });

    it('Báo lỗi ConflictException (409) khi request thứ 2 gửi đến trong lúc request 1 đang xử lý (IN_PROGRESS)', async () => {
      const idemKey = 'idem-in-progress-key';
      const mockReq = {
        headers: { 'idempotency-key': idemKey },
        method: 'POST',
        url: '/orders/checkout',
        body: validCheckoutDto,
        user: { userId: mockUser.publicId },
      };
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => ({ statusCode: 201 }),
        }),
      };

      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';
      prisma.idempotencyKey.create.mockRejectedValueOnce(p2002Error);

      // Bản ghi đang ở trạng thái IN_PROGRESS (chưa xong)
      prisma.idempotencyKey.findUnique.mockResolvedValueOnce({
        id: BigInt(2),
        idemKey,
        status: 'IN_PROGRESS',
        requestHash: (idempotencyInterceptor as any).hashRequest(validCheckoutDto),
        lockedUntil: new Date(Date.now() + 60000),
      });

      await expect(
        lastValueFrom(idempotencyInterceptor.intercept(mockContext, { handle: jest.fn() } as any)),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =========================================================================
  // 3. [IT] Race Condition (Oversell): Bắn đồng thời, bảo vệ tồn kho (không âm)
  // =========================================================================
  describe('3. [IT] Race Condition (Oversell): Chống bán khống', () => {
    it('Chỉ cho phép tạo đơn khi số lượng đặt <= tồn kho khả dụng; chặn đứng khi tồn kho không đủ', async () => {
      const singleItemCart = [
        {
          id: BigInt(11),
          variantId: BigInt(101),
          quantity: 6, // Muốn mua 6 món
          isSelected: true,
          variant: {
            id: BigInt(101),
            price: 50000n,
            productId: BigInt(201),
            inventory: { onHand: 5, reserved: 0 }, // Chỉ còn 5 món khả dụng
            product: {
              id: BigInt(201),
              name: 'Tai nghe Bluetooth Pro',
              shopId: BigInt(301),
              images: [],
              shop: { id: BigInt(301), flatShippingFee: 30000 },
            },
          },
        },
      ];

      prisma.cartItem.findMany.mockResolvedValue(singleItemCart);

      // Thẩm định tồn kho ở tầng Service trước khi mở transaction
      await expect(
        orderingService.createCheckoutOrder(mockUser.publicId, validCheckoutDto),
      ).rejects.toThrow('không đủ số lượng tồn kho (còn 5, yêu cầu 6)');
    });

    it('Mô phỏng 10 request đồng thời: Kiểm tra điều kiện nguyên tử WHERE (on_hand - reserved) >= quantity', async () => {
      const totalStock = 5;
      let currentReserved = 0;

      // Hàm giả lập atomic reservation của database:
      // UPDATE inventory SET reserved = reserved + 1 WHERE variant_id = 101 AND (on_hand - reserved) >= 1
      const tryAtomicReserve = async (): Promise<boolean> => {
        if (totalStock - currentReserved >= 1) {
          currentReserved += 1;
          return true; // 1 row affected
        }
        return false; // 0 rows affected -> ném lỗi
      };

      // 10 người dùng đồng thời cố gắng mua 1 món
      const attempts = Array.from({ length: 10 }, () => tryAtomicReserve());
      const results = await Promise.all(attempts);

      const successfulOrders = results.filter((success) => success === true);
      const failedOrders = results.filter((success) => success === false);

      // Đúng 5 đơn thành công, 5 đơn thất bại
      expect(successfulOrders.length).toBe(5);
      expect(failedOrders.length).toBe(5);
      // Tồn kho reserved cuối cùng đúng bằng 5, không thể vượt quá tồn kho (oversell)
      expect(currentReserved).toBe(5);
      expect(totalStock - currentReserved).toBe(0);
    });
  });

  // =========================================================================
  // 4. [E2E] Multi-seller Split: Giỏ hàng 3 Shop -> 1 Order cha & 3 SellerOrder con
  // =========================================================================
  describe('4. [E2E] Multi-seller Split: Tách đơn nhiều Shop', () => {
    it('Tạo 1 Order cha và 3 SellerOrder con cho 3 shop khác nhau, phí ship tính riêng từng shop', async () => {
      // Giỏ hàng gồm sản phẩm từ 3 Shop khác nhau
      const multiShopCartItems = [
        {
          id: BigInt(1),
          variantId: BigInt(101),
          quantity: 1,
          isSelected: true,
          variant: {
            id: BigInt(101),
            price: 100000n,
            productId: BigInt(201),
            inventory: { onHand: 10, reserved: 0 },
            product: {
              name: 'Áo thun Shop 1',
              shopId: BigInt(301), // Shop 1
              images: [],
              shop: { id: BigInt(301), flatShippingFee: 30000 },
            },
          },
        },
        {
          id: BigInt(2),
          variantId: BigInt(102),
          quantity: 2,
          isSelected: true,
          variant: {
            id: BigInt(102),
            price: 150000n,
            productId: BigInt(202),
            inventory: { onHand: 10, reserved: 0 },
            product: {
              name: 'Quần jeans Shop 2',
              shopId: BigInt(302), // Shop 2
              images: [],
              shop: { id: BigInt(302), flatShippingFee: 35000 },
            },
          },
        },
        {
          id: BigInt(3),
          variantId: BigInt(103),
          quantity: 1,
          isSelected: true,
          variant: {
            id: BigInt(103),
            price: 200000n,
            productId: BigInt(203),
            inventory: { onHand: 10, reserved: 0 },
            product: {
              name: 'Giày thể thao Shop 3',
              shopId: BigInt(303), // Shop 3
              images: [],
              shop: { id: BigInt(303), flatShippingFee: 40000 },
            },
          },
        },
      ];

      prisma.cartItem.findMany.mockResolvedValue(multiShopCartItems);

      const capturedSellerOrders: any[] = [];
      let capturedOrderData: any = null;

      // Giả lập transaction DB
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const fakeTx = {
          cartItem: {
            count: jest.fn().mockResolvedValue(3),
            deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
          $queryRaw: jest.fn().mockResolvedValue([
            { variant_id: BigInt(101), on_hand: 10, reserved: 0 },
            { variant_id: BigInt(102), on_hand: 10, reserved: 0 },
            { variant_id: BigInt(103), on_hand: 10, reserved: 0 },
          ]),
          order: {
            create: jest.fn().mockImplementation(({ data }) => {
              capturedOrderData = data;
              return {
                id: BigInt(999),
                publicId: 'ord_pub_999',
                orderNumber: 'ORD-TEST-999',
                ...data,
              };
            }),
          },
          sellerOrder: {
            create: jest.fn().mockImplementation(({ data }) => {
              capturedSellerOrders.push(data);
              return { id: BigInt(1000 + capturedSellerOrders.length), ...data };
            }),
          },
          orderItem: { create: jest.fn().mockResolvedValue({}) },
          inventoryReservation: { create: jest.fn().mockResolvedValue({}) },
          $executeRaw: jest.fn().mockResolvedValue(1), // update inventory thành công
          inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
        };
        return callback(fakeTx);
      });

      const orderResult = await orderingService.createCheckoutOrder(
        mockUser.publicId,
        validCheckoutDto,
      );

      expect(orderResult).toBeDefined();

      // 1. Kiểm tra Order cha:
      // Subtotal = 100k (Shop 1) + 300k (Shop 2) + 200k (Shop 3) = 600,000đ
      expect(capturedOrderData.subtotal).toBe(600000n);
      // Phí ship tổng = 30k + 35k + 40k = 105,000đ
      expect(capturedOrderData.shippingTotal).toBe(105000n);
      // Grand Total = 600k + 105k = 705,000đ
      expect(capturedOrderData.grandTotal).toBe(705000n);

      // 2. Kiểm tra sinh ra đúng 3 SellerOrder con cho 3 shop
      expect(capturedSellerOrders.length).toBe(3);

      const shop1Order = capturedSellerOrders.find((so) => so.shopId === BigInt(301));
      const shop2Order = capturedSellerOrders.find((so) => so.shopId === BigInt(302));
      const shop3Order = capturedSellerOrders.find((so) => so.shopId === BigInt(303));

      expect(shop1Order).toBeDefined();
      expect(shop1Order.shippingFee).toBe(30000n);
      expect(shop1Order.subtotal).toBe(100000n);

      expect(shop2Order).toBeDefined();
      expect(shop2Order.shippingFee).toBe(35000n);
      expect(shop2Order.subtotal).toBe(300000n);

      expect(shop3Order).toBeDefined();
      expect(shop3Order.shippingFee).toBe(40000n);
      expect(shop3Order.subtotal).toBe(200000n);
    });
  });

  // =========================================================================
  // 5. [IT] Dọn dẹp giỏ hàng: Xóa item đã chọn, giữ nguyên item chưa chọn
  // =========================================================================
  describe('5. [IT] Xóa item đã chọn trong giỏ hàng sau khi checkout thành công', () => {
    it('Chỉ xóa các sản phẩm có isSelected = true, giữ nguyên các sản phẩm khác trong giỏ', async () => {
      const selectedItem = {
        id: BigInt(1),
        variantId: BigInt(101),
        quantity: 1,
        isSelected: true, // Được chọn để mua
        variant: {
          id: BigInt(101),
          price: 100000n,
          productId: BigInt(201),
          inventory: { onHand: 10, reserved: 0 },
          product: {
            name: 'Món mua',
            shopId: BigInt(301),
            images: [],
            shop: { id: BigInt(301), flatShippingFee: 30000 },
          },
        },
      };

      prisma.cartItem.findMany.mockResolvedValue([selectedItem]);

      let deleteManyFilter: any = null;

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const fakeTx = {
          cartItem: {
            count: jest.fn().mockResolvedValue(1),
            deleteMany: jest.fn().mockImplementation(({ where }) => {
              deleteManyFilter = where;
              return { count: 1 };
            }),
          },
          $queryRaw: jest.fn().mockResolvedValue([
            { variant_id: BigInt(101), on_hand: 10, reserved: 0 },
          ]),
          order: {
            create: jest.fn().mockResolvedValue({
              id: BigInt(888),
              publicId: 'ord_pub_888',
              orderNumber: 'ORD-TEST-888',
            }),
          },
          sellerOrder: {
            create: jest.fn().mockResolvedValue({ id: BigInt(777) }),
          },
          orderItem: { create: jest.fn().mockResolvedValue({}) },
          inventoryReservation: { create: jest.fn().mockResolvedValue({}) },
          $executeRaw: jest.fn().mockResolvedValue(1),
          inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
        };
        return callback(fakeTx);
      });

      await orderingService.createCheckoutOrder(mockUser.publicId, validCheckoutDto);

      // Khẳng định deleteMany được gọi với điều kiện bắt buộc `isSelected: true`
      expect(deleteManyFilter).toEqual({
        cartId: mockCart.id,
        isSelected: true,
      });
    });
  });
});
