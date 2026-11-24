import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { MailQueueService } from '../../platform/mail/mail.queue';
import { VouchersService, CalculatedVoucherDiscount } from '../vouchers/vouchers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { ORDER_STATUS_MAP } from './ordering.mappings';
import { Prisma, OrderStatus, SellerOrderStatus } from '@prisma/client';
import { ulid } from 'ulid';

export type OrderUiStatus =
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export const ORDER_STATUS_CONFIG: Record<
  OrderUiStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color: string;
    description: string;
  }
> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    variant: 'outline',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Đơn hàng đang chờ xử lý thanh toán COD / trực tuyến',
  },
  PROCESSING: {
    label: 'Đang chuẩn bị',
    variant: 'secondary',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Người bán đang chuẩn bị đóng gói hàng hóa',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    variant: 'secondary',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description: 'Đơn hàng đã được xác nhận',
  },
  SHIPPED: {
    label: 'Đang vận chuyển',
    variant: 'secondary',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    description: 'Hàng đã giao cho đơn vị vận chuyển',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    variant: 'default',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: 'Kiện hàng đã giao tới tay người nhận',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    variant: 'default',
    color: 'text-green-600 bg-green-50 border-green-200',
    description: 'Giao dịch hoàn tất thành công',
  },
  CANCELLED: {
    label: 'Đã hủy',
    variant: 'destructive',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    description: 'Đơn hàng đã bị hủy bỏ',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    variant: 'outline',
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    description: 'Số tiền đã được hoàn trả về tài khoản',
  },
};

@Injectable()
export class OrderingService {
  private readonly logger = new Logger(OrderingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
    private readonly notificationsService: NotificationsService,
    private readonly mailQueueService: MailQueueService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper định dạng nhãn biến thể (VD: "Titan Tự Nhiên · 256GB")
   */
  private formatVariantLabel(optionValues: any): string {
    if (!optionValues || typeof optionValues !== 'object') {
      return 'Mặc định';
    }
    const values = Object.values(optionValues).map(String).filter(Boolean);
    return values.length > 0 ? values.join(' · ') : 'Mặc định';
  }

  /**
   * Ánh xạ từ OrderStatus & SellerOrderStatus sang OrderUiStatus
   */
  mapToUiStatus(order: {
    status: OrderStatus;
    sellerOrders?: Array<{ status: SellerOrderStatus }>;
  }): OrderUiStatus {
    if (order.status === 'CANCELLED' || order.status === 'EXPIRED') {
      return 'CANCELLED';
    }
    if (order.status === 'COMPLETED') {
      return 'COMPLETED';
    }
    if (order.status === 'PENDING_PAYMENT') {
      return 'PENDING_PAYMENT';
    }

    const sellerStatuses = order.sellerOrders?.map((so) => so.status) || [];
    if (sellerStatuses.length > 0 && sellerStatuses.every((s) => s === 'DELIVERED')) {
      return 'DELIVERED';
    }
    if (sellerStatuses.some((s) => s === 'SHIPPED')) {
      return 'SHIPPED';
    }
    if (sellerStatuses.some((s) => s === 'PROCESSING')) {
      return 'PROCESSING';
    }
    return 'CONFIRMED';
  }

  /**
   * Lấy cấu hình trạng thái đơn hàng
   */
  getOrderStatuses() {
    return Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
      key,
      ...config,
    }));
  }

  /**
   * Lấy tóm tắt đơn hàng thanh toán (Checkout Summary)
   * - Đọc các sản phẩm isSelected = true trong giỏ hàng
   * - Đọc địa chỉ mặc định của người dùng
   * - Gom nhóm theo Shop và tính toán tổng tiền
   */
  async getCheckoutSummary(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    // 1. Lấy giỏ hàng của user
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
    });

    // 2. Lấy địa chỉ mặc định của user (nếu chưa có thì trả về null)
    const defaultAddress = await this.prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    const addressData = defaultAddress
      ? {
          recipientName: defaultAddress.recipientName,
          phone: defaultAddress.phone,
          province: defaultAddress.province,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
          line1: defaultAddress.line1,
        }
      : null;

    const userProfile = {
      fullName: user.fullName || '',
      phone: user.phone || '',
    };

    if (!cart) {
      return {
        defaultAddress: addressData,
        userProfile,
        shops: [],
        summary: {
          subtotal: 0,
          shippingFee: 0,
          discount: 0,
          grandTotal: 0,
          totalQuantity: 0,
        },
      };
    }

    // 3. Lấy các món được chọn trong giỏ hàng (isSelected = true)
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        cartId: cart.id,
        isSelected: true,
      },
      include: {
        variant: {
          include: {
            inventory: true,
            product: {
              include: {
                shop: true,
                images: { orderBy: { position: 'asc' } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gom nhóm theo Shop (chuẩn hóa hiển thị theo Cửa hàng)
    const shopMap = new Map<
      string,
      {
        publicId: string;
        name: string;
        slug: string;
        logoKey: string | null;
        items: Array<{
          variantPublicId: string;
          productName: string;
          productSlug: string;
          variantLabel: string;
          imageUrl: string;
          unitPrice: number;
          quantity: number;
          lineTotal: number;
        }>;
        subtotal: number;
        shippingFee: number;
        enableFreeShipping?: boolean;
        freeShippingThreshold?: number | null;
      }
    >();

    let grandSubtotal = 0;
    let totalQuantity = 0;
    const defaultShippingFeePerShop = 30000;

    for (const item of cartItems) {
      const v = item.variant;
      const p = v.product;
      const s = p.shop;
      const shopKey = s.publicId;

      const unitPrice = Number(v.price);
      const lineTotal = unitPrice * item.quantity;
      const label = this.formatVariantLabel(v.optionValues);
      const imageUrl =
        p.images?.find((img: any) => img.isPrimary)?.storageKey ||
        p.images?.[0]?.storageKey ||
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80';

      grandSubtotal += lineTotal;
      totalQuantity += item.quantity;

      const shopShipping =
        s.flatShippingFee && Number(s.flatShippingFee) > 0
          ? Number(s.flatShippingFee)
          : defaultShippingFeePerShop;

      if (!shopMap.has(shopKey)) {
        shopMap.set(shopKey, {
          publicId: s.publicId,
          name: s.name,
          slug: s.slug,
          logoKey: s.logoKey,
          items: [],
          subtotal: 0,
          shippingFee: shopShipping,
          enableFreeShipping: Boolean(s.enableFreeShipping),
          freeShippingThreshold: s.freeShippingThreshold ? Number(s.freeShippingThreshold) : null,
        });
      }

      const shopGroup = shopMap.get(shopKey)!;
      shopGroup.items.push({
        variantPublicId: v.publicId,
        productName: p.name,
        productSlug: p.slug,
        variantLabel: label,
        imageUrl,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
      shopGroup.subtotal += lineTotal;
    }

    const shops = Array.from(shopMap.values());
    for (const shopGroup of shops) {
      if (
        shopGroup.enableFreeShipping &&
        shopGroup.freeShippingThreshold !== null &&
        shopGroup.freeShippingThreshold !== undefined &&
        shopGroup.subtotal >= shopGroup.freeShippingThreshold
      ) {
        shopGroup.shippingFee = 0;
      }
    }
    const shippingTotal = shops.reduce((sum, s) => sum + s.shippingFee, 0);
    const discount = 0;
    const grandTotal =
      grandSubtotal > 0 ? grandSubtotal + shippingTotal - discount : 0;

    return {
      defaultAddress: addressData,
      userProfile,
      shops,
      summary: {
        subtotal: grandSubtotal,
        shippingFee: grandSubtotal > 0 ? shippingTotal : 0,
        discount,
        grandTotal,
        totalQuantity,
      },
    };
  }

  /**
   * Tạo đơn hàng mới từ giỏ hàng (Hỗ trợ COD trước tiên)
   */
  async createCheckoutOrder(publicId: string, dto: CheckoutOrderDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
    });
    if (!cart) {
      throw new BadRequestException('Giỏ hàng chưa có sản phẩm nào.');
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        cartId: cart.id,
        isSelected: true,
      },
      include: {
        variant: {
          include: {
            inventory: true,
            product: {
              include: {
                shop: true,
                images: { orderBy: { position: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất một sản phẩm trong giỏ hàng để thanh toán.',
      );
    }

    // Kiểm tra tồn kho trước khi tạo đơn
    for (const item of cartItems) {
      const inv = item.variant.inventory;
      const available = inv ? inv.onHand - inv.reserved : 0;
      if (available < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${item.variant.product.name}" không đủ số lượng tồn kho (còn ${available}, yêu cầu ${item.quantity}).`,
        );
      }
    }

    const flatShippingFeePerShop = 30000;
    // Nhóm theo shop
    const shopMap = new Map<bigint, typeof cartItems>();
    for (const item of cartItems) {
      const shopId = item.variant.product.shopId;
      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, []);
      }
      shopMap.get(shopId)!.push(item);
    }

    let overallSubtotal = 0n;
    const shopEntries = Array.from(shopMap.entries());
    const shopSubtotals = new Map<bigint, { shop: any; subtotal: bigint }>();

    for (const [shopId, items] of shopEntries) {
      let shopSub = 0n;
      for (const item of items) {
        const linePrice = item.variant.price * BigInt(item.quantity);
        overallSubtotal += linePrice;
        shopSub += linePrice;
      }
      shopSubtotals.set(shopId, {
        shop: items[0]?.variant?.product?.shop,
        subtotal: shopSub,
      });
    }

    let overallShippingTotal = 0n;
    const shopShippingFees = new Map<bigint, bigint>();

    for (const [shopId, { shop, subtotal }] of shopSubtotals.entries()) {
      let fee =
        shop?.flatShippingFee !== undefined &&
        shop?.flatShippingFee !== null &&
        Number(shop.flatShippingFee) > 0
          ? BigInt(shop.flatShippingFee)
          : BigInt(flatShippingFeePerShop);

      if (
        shop?.enableFreeShipping &&
        shop?.freeShippingThreshold !== null &&
        shop?.freeShippingThreshold !== undefined &&
        subtotal >= BigInt(shop.freeShippingThreshold)
      ) {
        fee = 0n;
      }

      shopShippingFees.set(shopId, fee);
      overallShippingTotal += fee;
    }

    // Thẩm định mã giảm giá / Voucher nếu có truyền lên
    let voucherEvaluation: CalculatedVoucherDiscount | null = null;
    if (dto.voucherCode && dto.voucherCode.trim()) {
      voucherEvaluation = await this.vouchersService.evaluateVoucher(
        user.id,
        dto.voucherCode,
        overallSubtotal,
        shopSubtotals,
        overallShippingTotal,
      );
    }

    const overallDiscountTotal = voucherEvaluation
      ? voucherEvaluation.discountAmount
      : 0n;
    const computedGrandTotal =
      overallSubtotal + overallShippingTotal - overallDiscountTotal;
    const overallGrandTotal = computedGrandTotal > 0n ? computedGrandTotal : 0n;

    const orderPublicId = ulid();
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Thực hiện transaction tạo đơn hàng với mức cô lập RepeatableRead và khóa hàng tồn kho
    const createdOrder = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 0. CHỐNG TẠO ĐƠN TRÙNG LẶP CẤP TRANSACTION:
        // Đảm bảo các sản phẩm giỏ hàng vẫn tồn tại và chưa bị checkout bởi một request song song khác
        const currentCartCount = await tx.cartItem.count({
          where: {
            cartId: cart.id,
            isSelected: true,
          },
        });
        if (currentCartCount === 0) {
          throw new BadRequestException(
            'Giỏ hàng trống hoặc các sản phẩm này đã được thanh toán trong phiên khác.',
          );
        }

        // 1. CHỐNG RACE CONDITION TỒN KHO & DEADLOCK:
        // Sắp xếp variantId tăng dần để mọi transaction song song đều lock theo cùng 1 thứ tự (chống Deadlock MySQL 1213)
        const uniqueVariantIds = Array.from(
          new Set(cartItems.map((item) => item.variantId)),
        ).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

        // Khóa các hàng tồn kho bằng SELECT ... FOR UPDATE trên InnoDB
        const lockedInventories = await tx.$queryRaw<
          Array<{ variant_id: bigint; on_hand: number; reserved: number }>
        >`
          SELECT \`variant_id\`, \`on_hand\`, \`reserved\`
          FROM \`inventory\`
          WHERE \`variant_id\` IN (${Prisma.join(uniqueVariantIds)})
          FOR UPDATE
        `;

        const inventoryMap = new Map<
          string,
          { onHand: number; reserved: number }
        >();
        for (const inv of lockedInventories) {
          inventoryMap.set(String(inv.variant_id), {
            onHand: Number(inv.on_hand),
            reserved: Number(inv.reserved),
          });
        }

        // Thẩm định chính xác số lượng tồn kho khả dụng dưới quyền bảo vệ của khóa độc quyền
        for (const item of cartItems) {
          const inv = inventoryMap.get(String(item.variantId));
          if (!inv) {
            throw new BadRequestException(
              `Sản phẩm "${item.variant.product.name}" hiện không có thông tin tồn kho hợp lệ.`,
            );
          }
          const available = inv.onHand - inv.reserved;
          if (available < item.quantity) {
            throw new BadRequestException(
              `Sản phẩm "${item.variant.product.name}" không đủ số lượng tồn kho (chỉ còn ${Math.max(0, available)}, bạn đang đặt ${item.quantity}). Vui lòng cập nhật lại giỏ hàng.`,
            );
          }
          inv.reserved += item.quantity;
        }

        // 2. Tạo Order chính
        const order = await tx.order.create({
          data: {
            publicId: orderPublicId,
            orderNumber,
            userId: user.id,
            status: 'PENDING_PAYMENT',
            subtotal: overallSubtotal,
            discountTotal: overallDiscountTotal,
            voucherCode: voucherEvaluation?.code || null,
            shippingTotal: overallShippingTotal,
            grandTotal: overallGrandTotal,
            currency: 'VND',
            shippingAddress: dto.shippingAddress as any,
            contactEmail: dto.contactEmail || user.email || '',
            contactPhone: dto.contactPhone || dto.shippingAddress.phone,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          },
        });

        // 3. Tạo SellerOrder, OrderItem, InventoryReservation và Trừ Tồn Kho Nguyên Tử
        for (const [shopId, items] of shopEntries) {
          let shopSubtotal = 0n;
          for (const item of items) {
            shopSubtotal += item.variant.price * BigInt(item.quantity);
          }
          const shopShippingFee =
            shopShippingFees.get(shopId) ?? BigInt(flatShippingFeePerShop);
          let shopDiscount = 0n;
          let shopVoucherCode: string | null = null;

          if (
            voucherEvaluation &&
            voucherEvaluation.scope === 'SHOP' &&
            voucherEvaluation.shopId === shopId
          ) {
            shopDiscount = voucherEvaluation.discountAmount;
            shopVoucherCode = voucherEvaluation.code;
          }

          const calculatedShopTotal = shopSubtotal + shopShippingFee - shopDiscount;
          const shopTotal = calculatedShopTotal > 0n ? calculatedShopTotal : 0n;

          const sellerOrder = await tx.sellerOrder.create({
            data: {
              publicId: ulid(),
              orderId: order.id,
              shopId,
              status: 'PENDING',
              subtotal: shopSubtotal,
              discountTotal: shopDiscount,
              voucherCode: shopVoucherCode,
              shippingFee: shopShippingFee,
              total: shopTotal,
            },
          });

          for (const item of items) {
            const unitPrice = item.variant.price;
            const lineTotal = unitPrice * BigInt(item.quantity);
            const label = this.formatVariantLabel(item.variant.optionValues);

            await tx.orderItem.create({
              data: {
                orderId: order.id,
                sellerOrderId: sellerOrder.id,
                shopId,
                productId: item.variant.productId,
                variantId: item.variantId,
                productName: item.variant.product.name,
                variantLabel: label,
                sku: item.variant.sku,
                imageKey: item.variant.product.images[0]?.storageKey || null,
                unitPrice,
                quantity: item.quantity,
                lineTotal,
              },
            });

            // Tạo InventoryReservation
            await tx.inventoryReservation.create({
              data: {
                orderId: order.id,
                variantId: item.variantId,
                quantity: item.quantity,
                status: 'ACTIVE',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            });

            // Cập nhật reserved trong Inventory với chốt chặn nguyên tử (Atomic Conditional Update)
            const affected = await tx.$executeRaw`
              UPDATE \`inventory\`
              SET \`reserved\` = \`reserved\` + ${item.quantity},
                  \`version\` = \`version\` + 1
              WHERE \`variant_id\` = ${item.variantId}
                AND (\`on_hand\` - \`reserved\`) >= ${item.quantity}
            `;

            if (affected === 0) {
              throw new BadRequestException(
                `Sản phẩm "${item.variant.product.name}" đã hết hàng do có người vừa mua trước đó. Vui lòng thử lại.`,
              );
            }

            // Ghi sổ cái biến động kho (InventoryMovement - Audit Trail)
            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                shopId,
                type: 'RESERVE',
                onHandDelta: 0,
                reservedDelta: item.quantity,
                reason: `Tạm giữ hàng cho đơn #${orderNumber}`,
                refType: 'ORDER',
                refId: orderNumber,
                actorUserId: user.id,
              },
            });
          }
        }

        // 4. Ghi nhận sử dụng Voucher & tăng lượt dùng nếu có (với kiểm tra nguyên tử)
        if (voucherEvaluation) {
          const userUsedCount = await tx.voucherUsage.count({
            where: {
              voucherId: voucherEvaluation.voucherId,
              userId: user.id,
            },
          });

          const voucherRecord = await tx.voucher.findUnique({
            where: { id: voucherEvaluation.voucherId },
          });

          if (!voucherRecord || !voucherRecord.isActive) {
            throw new BadRequestException('Mã giảm giá không còn hiệu lực.');
          }

          if (userUsedCount >= voucherRecord.usagePerUser) {
            throw new BadRequestException(
              `Bạn đã sử dụng hết số lượt cho phép (${voucherRecord.usagePerUser} lần) của mã "${voucherRecord.code}".`,
            );
          }

          const voucherUpdated = await tx.$executeRaw`
            UPDATE \`vouchers\`
            SET \`used_count\` = \`used_count\` + 1
            WHERE \`id\` = ${voucherEvaluation.voucherId}
              AND \`used_count\` < \`usage_limit\`
          `;

          if (voucherUpdated === 0) {
            throw new BadRequestException(
              `Mã giảm giá "${voucherEvaluation.code}" vừa hết lượt sử dụng toàn hệ thống.`,
            );
          }

          await tx.voucherUsage.create({
            data: {
              voucherId: voucherEvaluation.voucherId,
              userId: user.id,
              orderId: order.id,
              discountAmount: voucherEvaluation.discountAmount,
            },
          });
        }

        // 5. Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            isSelected: true,
          },
        });

        return order;
      },
      {
        maxWait: 5000,
        timeout: 15000,
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      },
    );

    // Gửi thông báo in-app cho người mua
    this.notificationsService
      .createNotification({
        userId: user.id,
        type: 'ORDER',
        title: 'Đặt hàng thành công!',
        message: `Đơn hàng #${createdOrder.orderNumber} của bạn đã được ghi nhận thành công.`,
        link: `/orders/${createdOrder.publicId}`,
        metadata: {
          orderId: createdOrder.publicId,
          orderNumber: createdOrder.orderNumber,
        },
      })
      .catch((err) => {
        this.logger.error('Failed to notify buyer for order creation', err);
      });

    // Gửi email xác nhận đặt hàng (Order Confirmation Email) tới khách hàng
    const targetEmail = dto.contactEmail || user.email;
    if (targetEmail) {
      const formattedItems = cartItems.map((item) => ({
        name: item.variant.product.name,
        variant: this.formatVariantLabel(item.variant.optionValues),
        quantity: item.quantity,
        price: Number(item.variant.price),
        subtotal: Number(item.variant.price) * item.quantity,
        image: item.variant.product.images?.[0]?.storageKey || undefined,
      }));

      const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
      const trackingUrl = `${clientUrl}/orders/${createdOrder.publicId}`;

      const fullAddress = [
        dto.shippingAddress.line1,
        dto.shippingAddress.ward,
        dto.shippingAddress.district,
        dto.shippingAddress.province,
      ]
        .filter(Boolean)
        .join(', ');

      this.mailQueueService
        .enqueueSendOrderConfirmation({
          email: targetEmail,
          recipientName: dto.shippingAddress.recipientName,
          orderNumber: createdOrder.orderNumber,
          orderDate: new Date().toLocaleString('vi-VN'),
          shippingAddress: fullAddress,
          recipientPhone: dto.shippingAddress.phone,
          paymentMethod:
            dto.paymentMethod === 'COD'
              ? 'Thanh toán khi nhận hàng (COD)'
              : dto.paymentMethod || 'COD',
          items: formattedItems,
          subtotal: Number(overallSubtotal),
          shippingFee: Number(overallShippingTotal),
          discountAmount: Number(overallDiscountTotal),
          grandTotal: Number(overallGrandTotal),
          trackingUrl,
        })
        .catch((err) => {
          this.logger.error(
            `Failed to enqueue order confirmation email for #${createdOrder.orderNumber}`,
            err,
          );
        });
    }

    // Gửi thông báo cho các Shop có đơn hàng mới
    for (const [shopId] of shopEntries) {
      this.prisma.shopMember
        .findFirst({
          where: { shopId },
          select: { userId: true },
        })
        .then((member) => {
          if (member?.userId) {
            return this.notificationsService.createNotification({
              userId: member.userId,
              type: 'ORDER',
              title: 'Đơn hàng mới!',
              message: `Shop có đơn hàng mới #${createdOrder.orderNumber} cần xử lý.`,
              link: '/seller?tab=orders',
              metadata: {
                orderId: createdOrder.publicId,
                orderNumber: createdOrder.orderNumber,
              },
            });
          }
        })
        .catch((err) => {
          this.logger.error('Failed to notify seller for order creation', err);
        });
    }

    return {
      success: true,
      orderId: createdOrder.publicId,
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      grandTotal: Number(createdOrder.grandTotal),
      paymentMethod: dto.paymentMethod || 'COD',
      itemsCount: cartItems.length,
      recipient: dto.shippingAddress,
      message:
        'Đặt hàng thành công theo hình thức COD (Thanh toán khi nhận hàng)!',
    };
  }

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getMyOrders(userPublicId: string, query: OrderQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId: user.id,
    };

    if (query.status && ORDER_STATUS_MAP[query.status]) {
      Object.assign(where, ORDER_STATUS_MAP[query.status]);
    }

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        {
          orderItems: {
            some: {
              productName: { contains: query.search },
            },
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { placedAt: 'desc' },
        include: {
          sellerOrders: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoKey: true,
                },
              },
            },
          },
          orderItems: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order: any) => {
      const uiStatus = this.mapToUiStatus(order);
      return {
        id: order.publicId,
        orderNumber: order.orderNumber,
        status: order.status,
        uiStatus,
        statusMeta: ORDER_STATUS_CONFIG[uiStatus],
        subtotal: Number(order.subtotal),
        discountTotal: Number(order.discountTotal),
        shippingTotal: Number(order.shippingTotal),
        grandTotal: Number(order.grandTotal),
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        placedAt: order.placedAt,
        expiresAt: order.expiresAt,
        sellerOrders: order.sellerOrders.map((so: any) => ({
          id: so.publicId,
          status: so.status,
          subtotal: Number(so.subtotal),
          shippingFee: Number(so.shippingFee),
          total: Number(so.total),
          carrier: so.carrier,
          trackingCode: so.trackingCode,
          shop: so.shop,
        })),
        items: order.orderItems.map((item: any) => ({
          id: item.id.toString(),
          sellerOrderId: item.sellerOrderId.toString(),
          productName: item.productName,
          variantLabel: item.variantLabel,
          sku: item.sku,
          imageKey: item.imageKey,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          lineTotal: Number(item.lineTotal),
        })),
      };
    });

    return {
      data: formattedOrders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết một đơn hàng của người dùng
   */
  async getMyOrderById(userPublicId: string, orderPublicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        publicId: orderPublicId,
        userId: user.id,
      },
      include: {
        sellerOrders: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoKey: true,
              },
            },
          },
        },
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng yêu cầu.');
    }

    const uiStatus = this.mapToUiStatus(order);
    return {
      id: order.publicId,
      orderNumber: order.orderNumber,
      status: order.status,
      uiStatus,
      statusMeta: ORDER_STATUS_CONFIG[uiStatus],
      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      shippingTotal: Number(order.shippingTotal),
      grandTotal: Number(order.grandTotal),
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      placedAt: order.placedAt,
      expiresAt: order.expiresAt,
      sellerOrders: order.sellerOrders.map((so: any) => ({
        id: so.publicId,
        status: so.status,
        subtotal: Number(so.subtotal),
        shippingFee: Number(so.shippingFee),
        total: Number(so.total),
        carrier: so.carrier,
        trackingCode: so.trackingCode,
        shop: so.shop,
      })),
      items: order.orderItems.map((item: any) => ({
        id: item.id.toString(),
        sellerOrderId: item.sellerOrderId.toString(),
        productId: item.productId?.toString(),
        variantId: item.variantId?.toString(),
        productName: item.productName,
        variantLabel: item.variantLabel,
        sku: item.sku,
        imageKey: item.imageKey,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
    };
  }

  /**
   * Hủy đơn hàng của người dùng
   */
  async cancelMyOrder(
    userPublicId: string,
    orderPublicId: string,
    reason?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        publicId: orderPublicId,
        userId: user.id,
      },
      include: {
        reservations: true,
        voucherUsages: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng yêu cầu.');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý.',
      );
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Giải phóng tồn kho đã đặt trước và ghi sổ cái
      for (const res of order.reservations) {
        if (res.status === 'ACTIVE') {
          await tx.inventoryReservation.update({
            where: { id: res.id },
            data: { status: 'RELEASED' },
          });

          await tx.$executeRaw`
            UPDATE \`inventory\`
            SET \`reserved\` = GREATEST(0, \`reserved\` - ${res.quantity}),
                \`version\` = \`version\` + 1
            WHERE \`variant_id\` = ${res.variantId}
          `;

          // Ghi sổ cái biến động kho khi giải phóng hàng (InventoryMovement - RELEASE)
          const matchedItem = order.orderItems.find(
            (i: any) => i.variantId === res.variantId,
          );
          if (matchedItem) {
            await tx.inventoryMovement.create({
              data: {
                variantId: res.variantId,
                shopId: matchedItem.shopId,
                type: 'RELEASE',
                onHandDelta: 0,
                reservedDelta: -res.quantity,
                reason: `Giải phóng hàng khi hủy đơn #${order.orderNumber}`,
                refType: 'ORDER',
                refId: order.orderNumber,
                actorUserId: user.id,
              },
            });
          }
        }
      }

      // 2. Hoàn lại lượt sử dụng voucher nếu đơn hàng có áp dụng
      for (const usage of order.voucherUsages) {
        await tx.voucher.update({
          where: { id: usage.voucherId },
          data: {
            usedCount: { decrement: 1 },
          },
        });
        await tx.voucherUsage.delete({
          where: { id: usage.id },
        });
      }

      // 3. Cập nhật Order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });

      // 4. Cập nhật SellerOrders status
      await tx.sellerOrder.updateMany({
        where: { orderId: order.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    });

    // Thông báo cho người mua khi hủy đơn thành công
    this.notificationsService
      .createNotification({
        userId: user.id,
        type: 'ORDER',
        title: 'Đơn hàng đã hủy',
        message: `Đơn hàng #${order.orderNumber} của bạn đã được hủy thành công.`,
        link: `/orders/${order.publicId}`,
        metadata: {
          orderId: order.publicId,
          orderNumber: order.orderNumber,
        },
      })
      .catch((err) => {
        this.logger.error('Failed to notify cancellation', err);
      });

    return {
      message: 'Hủy đơn hàng thành công.',
      orderId: order.publicId,
      status: 'CANCELLED',
    };
  }
}
