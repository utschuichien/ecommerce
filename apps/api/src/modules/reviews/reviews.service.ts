import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ulid } from 'ulid';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 1. Tạo đánh giá từ khách hàng
  async createReview(userIdStr: string, dto: CreateReviewDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { publicId: userIdStr },
          { id: !isNaN(Number(userIdStr)) ? BigInt(userIdStr) : undefined },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }

    // Tìm sản phẩm theo publicId hoặc slug hoặc id
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { publicId: dto.productId },
          { slug: dto.productId },
          { id: !isNaN(Number(dto.productId)) ? BigInt(dto.productId) : undefined },
        ],
      },
      include: {
        shop: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm cần đánh giá.');
    }

    // Tìm đơn hàng của user
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { publicId: dto.orderId },
          { orderNumber: dto.orderId },
          { id: !isNaN(Number(dto.orderId)) ? BigInt(dto.orderId) : undefined },
        ],
        userId: user.id,
      },
      include: {
        orderItems: true,
        sellerOrders: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng của bạn.');
    }

    // Kiểm tra đơn hàng có chứa sản phẩm này không
    const hasProductInOrder = order.orderItems.some((item) => item.productId === product.id);
    if (!hasProductInOrder) {
      throw new BadRequestException('Sản phẩm này không nằm trong đơn hàng được chọn.');
    }

    // Kiểm tra đơn hàng đã giao thành công chưa (DELIVERED hoặc COMPLETED)
    const isCompleted =
      order.status === 'COMPLETED' ||
      order.sellerOrders.some((so) => so.status === 'DELIVERED');
    if (!isCompleted) {
      throw new BadRequestException('Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công.');
    }

    // Kiểm tra xem đã từng đánh giá sản phẩm này trong đơn hàng chưa
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_productId_orderId: {
          userId: user.id,
          productId: product.id,
          orderId: order.id,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã gửi đánh giá cho sản phẩm này trong đơn hàng rồi.');
    }

    // Tìm variantId nếu có
    let variantId: bigint | null = null;
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          OR: [
            { publicId: dto.variantId },
            { id: !isNaN(Number(dto.variantId)) ? BigInt(dto.variantId) : undefined },
          ],
        },
      });
      if (variant) variantId = variant.id;
    }

    // Tạo review
    const review = await this.prisma.review.create({
      data: {
        publicId: ulid(),
        userId: user.id,
        productId: product.id,
        orderId: order.id,
        variantId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        images: dto.images && dto.images.length > 0 ? dto.images : undefined,
        isVerified: true,
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
      },
    });

    // Gửi thông báo cho chủ Shop khi có đánh giá mới
    this.prisma.shopMember
      .findFirst({
        where: { shopId: product.shopId },
        select: { userId: true },
      })
      .then((member) => {
        if (member?.userId) {
          return this.notificationsService.createNotification({
            userId: member.userId,
            type: 'REVIEW',
            title: 'Đánh giá sản phẩm mới',
            message: `Khách hàng vừa để lại đánh giá ${dto.rating} sao cho sản phẩm "${product.name}".`,
            link: '/seller/reviews',
            metadata: {
              reviewId: review.publicId,
              productId: product.publicId,
              rating: dto.rating,
            },
          });
        }
      })
      .catch(() => {});

    return {
      message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
      reviewId: review.publicId,
    };
  }

  // 2. Lấy danh sách đánh giá của sản phẩm kèm tổng hợp thống kê
  async getProductReviews(
    productSlugOrId: string,
    page = 1,
    limit = 10,
    ratingFilter?: number,
    hasImages?: boolean,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { slug: productSlugOrId },
          { publicId: productSlugOrId },
          { id: !isNaN(Number(productSlugOrId)) ? BigInt(productSlugOrId) : undefined },
        ],
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }

    // Thống kê sao
    const allReviews = await this.prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true, images: true },
    });

    const totalReviews = allReviews.length;
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;
    let countWithImages = 0;

    for (const r of allReviews) {
      totalScore += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
      if (r.images && Array.isArray(r.images) && r.images.length > 0) {
        countWithImages++;
      }
    }

    const averageRating =
      totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

    // Điều kiện lọc danh sách
    const whereCondition: any = {
      productId: product.id,
    };

    if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
      whereCondition.rating = ratingFilter;
    }

    if (hasImages) {
      whereCondition.images = { not: null };
    }

    const skip = (page - 1) * limit;

    const [reviews, filteredTotal] = await Promise.all([
      this.prisma.review.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
          variant: {
            select: {
              sku: true,
              optionValues: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: whereCondition }),
    ]);

    return {
      summary: {
        averageRating,
        totalReviews,
        countWithImages,
        distribution,
      },
      items: reviews.map((r) => {
        let variantText = '';
        if (r.variant?.optionValues) {
          const opts = r.variant.optionValues as Record<string, any>;
          variantText = Object.values(opts).join(' - ');
        }

        return {
          id: r.publicId,
          author: r.user?.fullName || 'Khách hàng',
          avatar: r.user?.avatarUrl || null,
          rating: r.rating,
          comment: r.comment,
          images: Array.isArray(r.images) ? r.images : [],
          sellerReply: r.sellerReply,
          repliedAt: r.repliedAt,
          variant: variantText || null,
          isVerified: r.isVerified,
          createdAt: r.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        totalItems: filteredTotal,
        totalPages: Math.max(1, Math.ceil(filteredTotal / limit)),
      },
    };
  }

  // 3. Người bán phản hồi đánh giá
  async replyToReview(userIdStr: string, reviewPublicId: string, dto: ReplyReviewDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { publicId: userIdStr },
          { id: !isNaN(Number(userIdStr)) ? BigInt(userIdStr) : undefined },
        ],
      },
      include: {
        shopMembers: {
          include: { shop: true },
        },
      },
    });

    if (!user || user.shopMembers.length === 0) {
      throw new ForbiddenException('Bạn không có quyền quản lý cửa hàng.');
    }

    const review = await this.prisma.review.findUnique({
      where: { publicId: reviewPublicId },
      include: { product: true },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá.');
    }

    const userShopIds = user.shopMembers.map((sm) => sm.shopId);
    if (!userShopIds.includes(review.product.shopId)) {
      throw new ForbiddenException('Đánh giá này không thuộc về sản phẩm của gian hàng bạn.');
    }

    const updated = await this.prisma.review.update({
      where: { id: review.id },
      data: {
        sellerReply: dto.reply.trim(),
        repliedAt: new Date(),
      },
    });

    // Thông báo cho khách hàng đã viết đánh giá
    this.notificationsService
      .createNotification({
        userId: review.userId,
        type: 'REVIEW',
        title: 'Người bán đã phản hồi đánh giá',
        message: `Người bán đã phản hồi đánh giá của bạn về sản phẩm "${review.product.name}".`,
        link: `/products/${review.product.slug}`,
        metadata: {
          reviewId: review.publicId,
          productId: review.product.publicId,
        },
      })
      .catch(() => {});

    return {
      message: 'Đã gửi phản hồi đánh giá thành công.',
      reviewId: updated.publicId,
      sellerReply: updated.sellerReply,
      repliedAt: updated.repliedAt,
    };
  }
}

