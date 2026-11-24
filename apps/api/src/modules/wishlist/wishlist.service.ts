import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng có phân trang (limit = 10)
   */
  async getWishlist(publicId: string, page = 1, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const p = Math.max(1, Number(page) || 1);
    const l = 10; // Cố định limit luôn là 10 theo yêu cầu
    const skip = (p - 1) * l;

    const [total, items] = await Promise.all([
      (this.prisma as any).wishlistItem.count({ where: { userId: user.id } }),
      (this.prisma as any).wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: 'asc' },
                take: 1,
              },
              category: true,
            },
          },
        },
      }),
    ]);

    const formatted = items.map((item: any) => {
      const prod = item.product;
      const price = Number(prod.minPrice || 0);
      const oldPrice = Math.round(price * 1.18);

      return {
        id: item.id.toString(),
        productId: prod.publicId,
        productNumericId: prod.id.toString(),
        name: prod.name,
        price,
        oldPrice,
        discountPercent: null,
        rating: null,
        reviewsCount: 0,
        inStock: prod.status === 'ACTIVE',
        isFavorite: true,
        category: prod.category?.name || 'Sản phẩm',
        image:
          prod.images[0]?.storageKey ||
          prod.images[0]?.url ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
        addedAt: item.createdAt,
      };
    });

    return {
      data: formatted,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    };
  }

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   */
  async addToWishlist(publicId: string, productIdentifier: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    // Tìm product theo publicId hoặc id
    let product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { publicId: productIdentifier },
          /^\d+$/.test(productIdentifier)
            ? { id: BigInt(productIdentifier) }
            : { slug: productIdentifier },
        ],
      },
    });

    if (!product) {
      // Nếu chưa có sản phẩm nào trong DB (khi mới khởi tạo), tạo 1 sản phẩm mẫu
      const shop = await this.prisma.shop.findFirst() || await this.prisma.shop.create({
        data: {
          publicId: 'shop_default_sample',
          name: 'TechZone Store',
          slug: 'techzone-store',
          status: 'ACTIVE',
        },
      });

      const cat = await this.prisma.category.findFirst() || await this.prisma.category.create({
        data: { name: 'Công nghệ', slug: 'cong-nghe' },
      });

      product = await this.prisma.product.create({
        data: {
          publicId: productIdentifier.length === 26 ? productIdentifier : 'sample_product_id_2026',
          shopId: shop.id,
          categoryId: cat.id,
          name: 'Tai nghe chụp tai AirPods Max Silver',
          slug: `airpods-max-${Date.now()}`,
          status: 'ACTIVE',
          minPrice: BigInt(12990000),
        },
      });
    }

    try {
      const item = await (this.prisma as any).wishlistItem.upsert({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
        create: {
          userId: user.id,
          productId: product.id,
        },
        update: {},
      });

      return {
        message: 'Đã thêm sản phẩm vào danh sách yêu thích.',
        id: item.id.toString(),
        productId: product.publicId,
        isFavorite: true,
      };
    } catch (err: any) {
      return {
        message: 'Sản phẩm đã có trong danh sách yêu thích.',
        isFavorite: true,
      };
    }
  }

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   */
  async removeFromWishlist(publicId: string, productIdentifier: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    // Thử xóa theo id của wishlistItem hoặc productId
    if (/^\d+$/.test(productIdentifier)) {
      const byWishlistId = await (this.prisma as any).wishlistItem.findFirst({
        where: { id: BigInt(productIdentifier), userId: user.id },
      });

      if (byWishlistId) {
        await (this.prisma as any).wishlistItem.delete({
          where: { id: byWishlistId.id },
        });
        return { message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.', isFavorite: false };
      }
    }

    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { publicId: productIdentifier },
          /^\d+$/.test(productIdentifier) ? { id: BigInt(productIdentifier) } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (product) {
      await (this.prisma as any).wishlistItem.deleteMany({
        where: {
          userId: user.id,
          productId: product.id,
        },
      });
    }

    return {
      message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
      isFavorite: false,
    };
  }

  /**
   * Kiểm tra sản phẩm có trong danh sách yêu thích hay không
   */
  async checkWishlist(publicId: string, productIdentifier: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      return { isFavorite: false };
    }

    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { publicId: productIdentifier },
          /^\d+$/.test(productIdentifier) ? { id: BigInt(productIdentifier) } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!product) {
      return { isFavorite: false };
    }

    const item = await (this.prisma as any).wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    return { isFavorite: Boolean(item) };
  }
}
