import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import {
  ShopProductsQueryDto,
  ShopProductSortOption,
  ShopProductTabFilter,
} from './dto';

interface ShopMetadata {
  bio?: string;
  category?: string;
  email?: string;
  phone?: string;
  address?: string;
  bannerUrl?: string;
  slogan?: string;
  allowOrders?: boolean;
  showOutOfStock?: boolean;
  openTime?: string;
  closeTime?: string;
}

function parseShopMetadata(description: string | null): ShopMetadata {
  if (!description) return {};
  try {
    if (description.trim().startsWith('{')) {
      return JSON.parse(description);
    }
  } catch {
    // ignore json error
  }
  return { bio: description };
}

function formatRelativeJoinDate(createdAt: Date): string {
  const now = new Date();
  const diffDays = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
  if (diffDays < 30) return 'Mới tham gia';
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} năm trước`;
}

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80';
const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80';
const DEFAULT_PRODUCT_IMAGE = '/images/defaults/default-product.svg';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy thông tin công khai của Shop theo Slug hoặc PublicId
   */
  async getPublicShopProfile(slugOrId: string) {
    const shop = await this.prisma.shop.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { publicId: slugOrId }],
        status: { not: 'SUSPENDED' },
      },
    });

    if (!shop) {
      throw new NotFoundException(`Gian hàng "${slugOrId}" không tồn tại hoặc đã tạm dừng.`);
    }

    const meta = parseShopMetadata(shop.description);

    // Đếm số sản phẩm đang được bày bán của Shop
    const productsCount = await this.prisma.product.count({
      where: {
        shopId: shop.id,
        status: 'ACTIVE',
      },
    });

    // Đếm tổng số đơn hàng đã hoàn tất giao dịch
    const completedOrdersCount = await this.prisma.sellerOrder.count({
      where: {
        shopId: shop.id,
        status: 'DELIVERED',
      },
    });

    return {
      id: shop.publicId,
      name: shop.name,
      slug: shop.slug,
      logo: shop.logoKey || DEFAULT_LOGO,
      banner: meta.bannerUrl || DEFAULT_BANNER,
      slogan: meta.slogan || null,
      isOfficial: true,
      badgeText: 'Chính Hãng CommerceMall',
      followersCount: null,
      ratingScore: null,
      reviewsCount: completedOrdersCount > 0 ? `${completedOrdersCount}` : null,
      responseRate: null,
      responseTime: null,
      productsCount,
      joinDate: formatRelativeJoinDate(shop.createdAt),
      address: meta.address || null,
      phone: meta.phone || null,
      email: meta.email || null,
      description: meta.bio || shop.description || null,
      openTime: meta.openTime || null,
      closeTime: meta.closeTime || null,
      enableFreeShipping: Boolean(shop.enableFreeShipping),
      freeShippingThreshold: shop.freeShippingThreshold ? Number(shop.freeShippingThreshold) : null,
      holidayMode: Boolean(shop.holidayMode),
      holidayMessage: shop.holidayMessage || null,
      enableReturn: shop.enableReturn !== false,
      returnPeriodDays: shop.returnPeriodDays ?? 7,
      requireUnboxVideo: Boolean(shop.requireUnboxVideo),
      returnPolicyNote: shop.returnPolicyNote || null,
      warrantyType: shop.warrantyType || null,
      warrantyPeriodMonths: shop.warrantyPeriodMonths ?? null,
      warrantyPolicyNote: shop.warrantyPolicyNote || null,
    };
  }

  /**
   * Lấy danh sách sản phẩm của Shop kèm bộ lọc type-safe, tìm kiếm và phân trang
   */
  async getPublicShopProducts(slugOrId: string, query: ShopProductsQueryDto) {
    const shop = await this.prisma.shop.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { publicId: slugOrId }],
        status: { not: 'SUSPENDED' },
      },
    });

    if (!shop) {
      throw new NotFoundException(`Gian hàng "${slugOrId}" không tồn tại.`);
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ProductWhereInput = {
      shopId: shop.id,
      status: 'ACTIVE',
    };

    // 1. Tìm kiếm theo từ khóa
    if (query.search?.trim()) {
      baseWhere.name = { contains: query.search.trim() };
    }

    // 2. Lọc theo danh mục
    if (query.category?.trim() && query.category !== 'all') {
      baseWhere.category = {
        OR: [
          { slug: query.category.trim() },
          { name: { contains: query.category.trim() } },
        ],
      };
    }

    // 3. Lọc theo tab hiển thị
    if (query.tab === ShopProductTabFilter.PROMOTIONS) {
      // Chỉ lấy sản phẩm có biến thể có giá khuyến mãi (compareAtPrice > 0)
      baseWhere.variants = {
        some: {
          compareAtPrice: { gt: 0 },
        },
      };
    }

    // 4. Sắp xếp kết quả (Sort By)
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === ShopProductSortOption.PRICE_ASC) {
      orderBy = { minPrice: 'asc' };
    } else if (query.sortBy === ShopProductSortOption.PRICE_DESC) {
      orderBy = { minPrice: 'desc' };
    } else if (
      query.sortBy === ShopProductSortOption.BESTSELLER ||
      query.sortBy === ShopProductSortOption.POPULAR ||
      query.tab === ShopProductTabFilter.BESTSELLER
    ) {
      orderBy = { createdAt: 'desc' };
    }

    const [totalItems, products, rawCategories] = await Promise.all([
      this.prisma.product.count({ where: baseWhere }),
      this.prisma.product.findMany({
        where: baseWhere,
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: { position: 'asc' },
          },
          variants: {
            include: {
              inventory: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      // Lấy danh sách các danh mục có sản phẩm trong shop này
      this.prisma.category.findMany({
        where: {
          products: {
            some: {
              shopId: shop.id,
              status: 'ACTIVE',
            },
          },
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),
    ]);

    const items = products.map((prod) => {
      const primaryImage =
        prod.images.find((img) => img.isPrimary)?.storageKey ||
        prod.images[0]?.storageKey ||
        DEFAULT_PRODUCT_IMAGE;

      const price = Number(prod.minPrice);
      const firstVariant = prod.variants[0];
      const comparePrice = firstVariant?.compareAtPrice
        ? Number(firstVariant.compareAtPrice)
        : undefined;

      let discountPercent: number | undefined;
      if (comparePrice && comparePrice > price) {
        discountPercent = Math.round(((comparePrice - price) / comparePrice) * 100);
      }

      const inStock = prod.variants.some((v) => {
        const onHand = v.inventory?.onHand ?? 0;
        const reserved = v.inventory?.reserved ?? 0;
        return onHand - reserved > 0;
      });

      return {
        id: prod.publicId,
        slug: prod.slug,
        name: prod.name,
        category: prod.category?.name || 'Sản phẩm',
        categorySlug: prod.category?.slug || '',
        brand: prod.brand?.name || shop.name,
        price,
        oldPrice: comparePrice,
        discountPercent,
        rating: null,
        reviewsCount: 0,
        soldCount: null,
        image: primaryImage,
        inStock,
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      categories: rawCategories.map((c) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
      })),
    };
  }

  /**
   * Lấy danh sách các gian hàng công khai đang hoạt động (kèm tìm kiếm, phân trang)
   */
  async getPublicShops(query: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ShopWhereInput = {
      status: 'ACTIVE',
    };

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term } },
        { slug: { contains: term } },
      ];
    }

    const [total, shops] = await Promise.all([
      this.prisma.shop.count({ where }),
      this.prisma.shop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      }),
    ]);

    const items = shops.map((shop) => {
      const meta = parseShopMetadata(shop.description);
      return {
        id: shop.publicId,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logoKey || DEFAULT_LOGO,
        banner: shop.bannerKey || meta.bannerUrl || DEFAULT_BANNER,
        slogan: shop.slogan || meta.slogan || null,
        description: meta.bio || shop.description || null,
        productsCount: shop._count.products,
        joinDate: formatRelativeJoinDate(shop.createdAt),
        isOfficial: true,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
