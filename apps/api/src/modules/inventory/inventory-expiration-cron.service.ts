import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryExpirationCronService {
  private readonly logger = new Logger(InventoryExpirationCronService.name);
  private isRunning = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tác vụ nền chạy định kỳ mỗi 2 phút:
   * 1. Quét các phiếu giữ hàng InventoryReservation (status = ACTIVE) đã quá hạn (expiresAt <= NOW)
   * 2. Giải phóng số lượng tạm giữ trong bảng Inventory (giảm reserved để tăng Available)
   * 3. Đổi status InventoryReservation sang EXPIRED
   * 4. Ghi sổ cái InventoryMovement (loại RELEASE, lý do hết hạn giữ chỗ)
   * 5. Hủy đơn hàng Order (status = EXPIRED) & SellerOrder (status = CANCELLED)
   * 6. Hoàn lại lượt Voucher nếu đơn hàng có áp dụng
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredReservations() {
    if (this.isRunning) {
      this.logger.debug(
        'Lượt quét quá hạn trước đó vẫn đang chạy, bỏ qua lượt này...',
      );
      return;
    }

    this.isRunning = true;
    try {
      await this.processExpiredReservations();
    } catch (err: any) {
      this.logger.error(
        'Lỗi khi thực thi quét phiếu giữ hàng quá hạn:',
        err.message,
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Core logic xử lý giải phóng tồn kho quá hạn (dùng chung cho cả Cron và Trigger thủ công)
   */
  async processExpiredReservations() {
    const now = new Date();

    // 1. Quét các phiếu giữ hàng ACTIVE đã quá hạn
    const expiredReservations = await this.prisma.inventoryReservation.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lte: now },
      },
      take: 100, // Batch 100 mục mỗi lần để không khóa bảng lâu
      include: {
        order: {
          include: {
            sellerOrders: true,
            voucherUsages: true,
            orderItems: true,
          },
        },
      },
    });

    if (expiredReservations.length === 0) {
      return {
        success: true,
        expiredCount: 0,
        releasedQuantity: 0,
        message: 'Không có phiếu giữ hàng nào quá hạn.',
      };
    }

    this.logger.log(
      `Phát hiện ${expiredReservations.length} phiếu giữ hàng đã quá hạn. Bắt đầu thu hồi tồn kho...`,
    );

    let releasedCount = 0;
    let releasedQuantity = 0;

    // Nhóm theo từng OrderId để xử lý trọn vẹn trong transaction
    const orderGroups = new Map<bigint, typeof expiredReservations>();
    for (const res of expiredReservations) {
      if (!orderGroups.has(res.orderId)) {
        orderGroups.set(res.orderId, []);
      }
      orderGroups.get(res.orderId)!.push(res);
    }

    for (const [orderId, reservations] of orderGroups.entries()) {
      try {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const sampleOrder = reservations[0]?.order;

          for (const res of reservations) {
            // A. Đổi status InventoryReservation sang EXPIRED
            await tx.inventoryReservation.update({
              where: { id: res.id },
              data: { status: 'EXPIRED' },
            });

            // B. Giảm reserved trong Inventory
            await tx.$executeRaw`
              UPDATE \`inventory\`
              SET \`reserved\` = GREATEST(0, \`reserved\` - ${res.quantity}),
                  \`version\` = \`version\` + 1
              WHERE \`variant_id\` = ${res.variantId}
            `;

            // C. Tìm shopId từ orderItems để ghi nhận movement
            const matchedItem = sampleOrder?.orderItems?.find(
              (i) => i.variantId === res.variantId,
            );
            const shopId = matchedItem ? matchedItem.shopId : BigInt(1);

            // D. Ghi sổ cái InventoryMovement (RELEASE)
            await tx.inventoryMovement.create({
              data: {
                variantId: res.variantId,
                shopId,
                type: 'RELEASE',
                onHandDelta: 0,
                reservedDelta: -res.quantity,
                reason: `Hết hạn giữ chỗ 24h - Hệ thống tự động thu hồi (Đơn #${sampleOrder?.orderNumber || orderId})`,
                refType: 'ORDER',
                refId: sampleOrder?.orderNumber || String(orderId),
                actorUserId: null, // Do hệ thống tự động chạy
              },
            });

            releasedCount++;
            releasedQuantity += res.quantity;
          }

          // E. Cập nhật Order và SellerOrder sang EXPIRED / CANCELLED nếu order chưa hoàn tất
          if (sampleOrder && sampleOrder.status === 'PENDING_PAYMENT') {
            await tx.order.update({
              where: { id: orderId },
              data: { status: 'EXPIRED' },
            });

            await tx.sellerOrder.updateMany({
              where: { orderId: orderId, status: 'PENDING' },
              data: {
                status: 'CANCELLED',
                cancelledAt: now,
              },
            });

            // F. Hoàn lại lượt Voucher nếu có dùng
            for (const usage of sampleOrder.voucherUsages) {
              await tx.voucher.update({
                where: { id: usage.voucherId },
                data: { usedCount: { decrement: 1 } },
              });
              await tx.voucherUsage.delete({
                where: { id: usage.id },
              });
            }
          }
        });
      } catch (orderErr: any) {
        this.logger.error(
          `Lỗi khi giải phóng kho cho đơn hàng ID ${orderId}: ${orderErr.message}`,
        );
      }
    }

    const message = `Đã thu hồi thành công ${releasedCount} phiếu giữ chỗ (tổng ${releasedQuantity} sản phẩm) về kho khả dụng.`;
    this.logger.log(message);

    return {
      success: true,
      expiredCount: releasedCount,
      releasedQuantity,
      message,
    };
  }
}
