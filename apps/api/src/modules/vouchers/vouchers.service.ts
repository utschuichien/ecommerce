import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { ulid } from 'ulid';

export interface CalculatedVoucherDiscount {
  voucherId: bigint;
  code: string;
  name: string;
  scope: 'GLOBAL' | 'SHOP';
  shopId: bigint | null;
  shopName: string | null;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  discountAmount: bigint;
  minOrderValue: bigint;
  message: string;
}

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách Voucher khả dụng (toàn sàn hoặc của shop chỉ định)
   */
  async getAvailableVouchers(userPublicId?: string, shopSlugOrId?: string) {
    const now = new Date();

    let targetShopId: bigint | null = null;
    let shopInfo: { id: bigint; name: string } | null = null;

    if (shopSlugOrId) {
      const shop = await this.prisma.shop.findFirst({
        where: {
          OR: [{ slug: shopSlugOrId }, { publicId: shopSlugOrId }],
        },
        select: { id: true, name: true },
      });
      if (shop) {
        targetShopId = shop.id;
        shopInfo = shop;
      }
    }

    // Lấy user id nếu có đăng nhập
    let userId: bigint | null = null;
    if (userPublicId) {
      const user = await this.prisma.user.findUnique({
        where: { publicId: userPublicId },
        select: { id: true },
      });
      if (user) userId = user.id;
    }

    // Điều kiện lọc voucher còn hiệu lực
    const whereCondition: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      OR: targetShopId
        ? [{ scope: 'GLOBAL' }, { scope: 'SHOP', shopId: targetShopId }]
        : [{ scope: 'GLOBAL' }],
    };

    const vouchers = await this.prisma.voucher.findMany({
      where: whereCondition,
      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            publicId: true,
          },
        },
      },
      orderBy: [{ minOrderValue: 'asc' }, { discountValue: 'desc' }],
    });

    // Lấy số lượt user đã dùng từng voucher
    const userUsagesMap = new Map<string, number>();
    if (userId && vouchers.length > 0) {
      const voucherIds = vouchers.map((v) => v.id);
      const usages = await this.prisma.voucherUsage.groupBy({
        by: ['voucherId'],
        where: {
          userId,
          voucherId: { in: voucherIds },
        },
        _count: { id: true },
      });
      for (const u of usages) {
        userUsagesMap.set(String(u.voucherId), u._count.id);
      }
    }

    return vouchers.map((v) => {
      const usedByThisUser = userUsagesMap.get(String(v.id)) || 0;
      const isExhaustedTotal = v.usedCount >= v.usageLimit;
      const isExhaustedUser = usedByThisUser >= v.usagePerUser;

      return {
        id: v.publicId,
        code: v.code,
        name: v.name,
        description: v.description,
        scope: v.scope,
        shop: v.shop
          ? {
              id: v.shop.publicId,
              name: v.shop.name,
              slug: v.shop.slug,
            }
          : null,
        type: v.type,
        discountValue: Number(v.discountValue),
        maxDiscountAmount: v.maxDiscountAmount
          ? Number(v.maxDiscountAmount)
          : null,
        minOrderValue: Number(v.minOrderValue),
        usageLimit: v.usageLimit,
        usedCount: v.usedCount,
        usagePerUser: v.usagePerUser,
        usedByCurrentUser: usedByThisUser,
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
        isAvailable: !isExhaustedTotal && !isExhaustedUser,
        unavailableReason: isExhaustedTotal
          ? 'Đã hết lượt sử dụng trên hệ thống'
          : isExhaustedUser
          ? 'Bạn đã dùng hết số lượt của mã này'
          : null,
      };
    });
  }

  /**
   * Thẩm định & Tính toán giảm giá thực tế cho Giỏ hàng / Checkout
   */
  async validateVoucher(userPublicId: string, dto: ValidateVoucherDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      include: {
        cart: {
          include: {
            items: {
              where: { isSelected: true },
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        shop: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    const selectedItems = user.cart?.items || [];
    if (selectedItems.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất 1 sản phẩm trong giỏ hàng để áp dụng mã giảm giá.',
      );
    }

    // Tính toán tiền hàng toàn giỏ và gom tiền theo từng Shop
    let totalSubtotal = BigInt(0);
    const shopSubtotals = new Map<bigint, { shop: any; subtotal: bigint }>();

    for (const item of selectedItems) {
      const lineTotal = item.variant.price * BigInt(item.quantity);
      totalSubtotal += lineTotal;

      const shop = item.variant.product.shop;
      const current = shopSubtotals.get(shop.id) || {
        shop,
        subtotal: BigInt(0),
      };
      current.subtotal += lineTotal;
      shopSubtotals.set(shop.id, current);
    }

    const defaultShippingFee = BigInt(30000); // Mặc định standard fee

    // Kiểm tra & thẩm định voucher
    const result = await this.evaluateVoucher(
      user.id,
      dto.code,
      totalSubtotal,
      shopSubtotals,
      defaultShippingFee,
    );

    return {
      valid: true,
      voucher: {
        code: result.code,
        name: result.name,
        scope: result.scope,
        shopName: result.shopName,
        type: result.type,
      },
      discountAmount: Number(result.discountAmount),
      subtotal: Number(totalSubtotal),
      finalTotal: Math.max(0, Number(totalSubtotal - result.discountAmount)),
      message: result.message,
    };
  }

  /**
   * Core Thẩm định 7 bước dùng chung cho cả Validate API và Checkout Order
   */
  async evaluateVoucher(
    userId: bigint,
    rawCode: string,
    totalSubtotal: bigint,
    shopSubtotals: Map<bigint, { shop: any; subtotal: bigint }>,
    shippingFee: bigint,
  ): Promise<CalculatedVoucherDiscount> {
    const code = rawCode.trim().toUpperCase();

    // 1. Tìm voucher trong DB
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!voucher) {
      throw new BadRequestException(
        `Mã giảm giá "${code}" không tồn tại trên hệ thống.`,
      );
    }

    // 2. Trạng thái kích hoạt
    if (!voucher.isActive) {
      throw new BadRequestException(
        `Mã giảm giá "${code}" hiện đang tạm ngừng áp dụng.`,
      );
    }

    // 3. Thời hạn sử dụng
    const now = new Date();
    if (now < voucher.startDate) {
      throw new BadRequestException(
        `Mã giảm giá "${code}" chưa đến thời gian áp dụng (bắt đầu từ ${voucher.startDate.toLocaleDateString('vi-VN')}).`,
      );
    }
    if (now > voucher.endDate) {
      throw new BadRequestException(
        `Mã giảm giá "${code}" đã hết hạn sử dụng.`,
      );
    }

    // 4. Giới hạn lượt toàn sàn
    if (voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException(
        `Mã giảm giá "${code}" đã hết lượt sử dụng.`,
      );
    }

    // 5. Giới hạn lượt của cá nhân User
    const userUsedCount = await this.prisma.voucherUsage.count({
      where: {
        voucherId: voucher.id,
        userId,
      },
    });

    if (userUsedCount >= voucher.usagePerUser) {
      throw new BadRequestException(
        `Bạn đã sử dụng hết số lượt cho phép (${voucher.usagePerUser} lần) của mã "${code}".`,
      );
    }

    // 6. Thẩm định phạm vi Shop vs Sàn và Giá trị đơn hàng tối thiểu
    let applicableAmount = totalSubtotal;
    let shopName: string | null = null;

    if (voucher.scope === 'SHOP') {
      if (!voucher.shopId) {
        throw new BadRequestException(
          'Mã giảm giá của shop bị cấu hình lỗi (thiếu shopId).',
        );
      }

      const shopEntry = shopSubtotals.get(voucher.shopId);
      shopName = voucher.shop?.name || 'Shop';

      if (!shopEntry || shopEntry.subtotal <= BigInt(0)) {
        throw new BadRequestException(
          `Mã giảm giá "${code}" chỉ áp dụng cho sản phẩm thuộc gian hàng "${shopName}". Giỏ hàng của bạn chưa chọn sản phẩm nào từ shop này.`,
        );
      }

      applicableAmount = shopEntry.subtotal;

      if (applicableAmount < voucher.minOrderValue) {
        const diff = Number(voucher.minOrderValue - applicableAmount);
        throw new BadRequestException(
          `Đơn hàng từ "${shopName}" chưa đạt giá trị tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}₫ (còn thiếu ${diff.toLocaleString('vi-VN')}₫).`,
        );
      }
    } else {
      // GLOBAL: Tính trên toàn bộ giỏ hàng
      if (applicableAmount < voucher.minOrderValue) {
        const diff = Number(voucher.minOrderValue - applicableAmount);
        throw new BadRequestException(
          `Đơn hàng chưa đạt giá trị tối thiểu ${Number(voucher.minOrderValue).toLocaleString('vi-VN')}₫ (còn thiếu ${diff.toLocaleString('vi-VN')}₫).`,
        );
      }
    }

    // 7. Tính toán số tiền được giảm
    let discountAmount = BigInt(0);

    if (voucher.type === 'FIXED_AMOUNT') {
      discountAmount =
        voucher.discountValue > applicableAmount
          ? applicableAmount
          : voucher.discountValue;
    } else if (voucher.type === 'PERCENTAGE') {
      // discount = (applicableAmount * discountValue) / 100
      const rawDiscount =
        (applicableAmount * voucher.discountValue) / BigInt(100);
      if (
        voucher.maxDiscountAmount &&
        rawDiscount > voucher.maxDiscountAmount
      ) {
        discountAmount = voucher.maxDiscountAmount;
      } else {
        discountAmount = rawDiscount;
      }
    } else if (voucher.type === 'FREE_SHIPPING') {
      discountAmount =
        voucher.discountValue > shippingFee ? shippingFee : voucher.discountValue;
    }

    const discountFormatted = `${Number(discountAmount).toLocaleString('vi-VN')}₫`;

    return {
      voucherId: voucher.id,
      code: voucher.code,
      name: voucher.name,
      scope: voucher.scope,
      shopId: voucher.shopId,
      shopName,
      type: voucher.type,
      discountAmount,
      minOrderValue: voucher.minOrderValue,
      message: `Áp dụng mã "${code}" thành công! Giảm ${discountFormatted}.`,
    };
  }
}

