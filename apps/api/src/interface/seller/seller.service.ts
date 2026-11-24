import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ulid } from 'ulid';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { CloudinaryService } from '../../platform/cloudinary/cloudinary.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { MailQueueService } from '../../platform/mail/mail.queue';
import { generateSearchText } from '../../platform/utils/search-helper';
import {
  SellerProductQueryDto,
  CreateSellerProductDto,
  UpdateSellerProductDto,
  UpdateProductStatusDto,
  UpdateSellerShopDto,
  UpdateShopStatusDto,
  SellerOrderQueryDto,
  UpdateSellerOrderStatusDto,
  SellerInventoryQueryDto,
  AdjustSellerInventoryDto,
  SellerAnalyticsQueryDto,
  CreateSellerVoucherDto,
  UpdateSellerVoucherDto,
  SellerVoucherQueryDto,
  SellerProductStatusFilter,
  SellerProductSortOption,
  SellerOrderStatusFilter,
  SellerOrderTimeRange,
  SellerOrderAmountRange,
  SellerOrderSortBy,
  SellerStockLevelFilter,
  SellerInventorySortBy,
} from './dto';
import {
  SELLER_PRODUCT_STATUS_MAP,
  SELLER_PRODUCT_SORT_MAP,
  SELLER_ORDER_STATUS_MAP,
  SELLER_ORDER_AMOUNT_MAP,
  SELLER_ORDER_SORT_MAP,
  getSellerOrderTimeRangeWhere,
  SELLER_STOCK_LEVEL_MAP,
  SELLER_INVENTORY_SORT_MAP,
} from './seller.mappings';
import * as crypto from 'crypto';

export function computeOptionHash(options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) {
    return 'default';
  }
  const sortedPairs = Object.entries(options)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .map(([k, v]) => `${k.trim().toLowerCase()}:${v.trim().toLowerCase()}`);
  const raw = sortedPairs.join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function formatVariantLabel(optionValues?: any): string {
  if (!optionValues) return 'Mặc định';
  if (typeof optionValues === 'string') {
    try {
      const parsed = JSON.parse(optionValues);
      if (typeof parsed === 'object' && parsed !== null) {
        const values = Object.values(parsed).filter(Boolean);
        if (values.length > 0) return values.join(' / ');
      }
      return optionValues;
    } catch {
      return optionValues;
    }
  }
  if (typeof optionValues === 'object' && optionValues !== null) {
    const values = Object.values(optionValues).filter(Boolean);
    if (values.length > 0) return values.join(' / ');
  }
  return 'Mặc định';
}

const CATEGORY_COLORS: Record<string, string> = {
  'tai-nghe': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  'dong-ho': 'bg-blue-50 text-blue-700 border-blue-200/60',
  'dien-thoai': 'bg-sky-50 text-sky-700 border-sky-200/60',
  'giay-dep': 'bg-teal-50 text-teal-700 border-teal-200/60',
  'balo': 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  'laptop': 'bg-purple-50 text-purple-700 border-purple-200/60',
  'phu-kien': 'bg-amber-50 text-amber-700 border-amber-200/60',
};

interface ShopMetadata {
  bio?: string;
  category?: string;
  email?: string;
  phone?: string;
  address?: string;
  bannerUrl?: string;
  slogan?: string;
  brandStory?: string;
  allowOrders?: boolean;
  showOutOfStock?: boolean;
  requireAuthCheckout?: boolean;
  operatingType?: 'always' | 'custom';
  openTime?: string;
  closeTime?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
}

function parseShopMetadata(description: string | null): ShopMetadata {
  if (!description) return {};
  try {
    if (description.trim().startsWith('{')) {
      return JSON.parse(description);
    }
  } catch {
    // ignore
  }
  return { bio: description };
}

function formatShopResponse(shop: any, ownerUser?: any) {
  const meta = parseShopMetadata(shop.description);
  return {
    id: shop.publicId,
    name: shop.name,
    slug: shop.slug,
    description: meta.bio ?? (shop.description && !shop.description.trim().startsWith('{') ? shop.description : ''),
    category: meta.category ?? 'Điện tử - Công nghệ',
    email: meta.email ?? ownerUser?.email ?? '',
    phone: meta.phone ?? ownerUser?.phone ?? '',
    address: meta.address ?? '',
    logoUrl: shop.logoKey ?? '',
    bannerUrl: shop.bannerKey || meta.bannerUrl || '',
    slogan: shop.slogan || meta.slogan || '',
    brandStory: meta.brandStory ?? '',
    status: shop.status,
    flatShippingFee: Number(shop.flatShippingFee || 0),
    enableFreeShipping: Boolean(shop.enableFreeShipping),
    freeShippingThreshold: shop.freeShippingThreshold ? Number(shop.freeShippingThreshold) : 0,
    pickupContactName: shop.pickupContactName || '',
    pickupPhone: shop.pickupPhone || '',
    pickupAddress: shop.pickupAddress || '',
    pickupNote: shop.pickupNote || '',
    supportedCarriers: shop.supportedCarriers || '',
    allowInspection: shop.allowInspection ?? true,
    dispatchTime: shop.dispatchTime || '24h',
    holidayMode: Boolean(shop.holidayMode),
    holidayMessage: shop.holidayMessage || '',
    enableReturn: shop.enableReturn ?? true,
    returnPeriodDays: shop.returnPeriodDays !== undefined ? Number(shop.returnPeriodDays) : 7,
    requireUnboxVideo: shop.requireUnboxVideo ?? true,
    returnPolicyNote: shop.returnPolicyNote || '',
    warrantyType: shop.warrantyType || 'shop',
    warrantyPeriodMonths:
      shop.warrantyPeriodMonths !== undefined ? Number(shop.warrantyPeriodMonths) : 12,
    warrantyPolicyNote: shop.warrantyPolicyNote || '',
    allowOrders: meta.allowOrders ?? true,
    showOutOfStock: meta.showOutOfStock ?? false,
    requireAuthCheckout: meta.requireAuthCheckout ?? true,
    operatingType: meta.operatingType ?? 'always',
    openTime: meta.openTime ?? '08:00',
    closeTime: meta.closeTime ?? '22:00',
    facebookUrl: meta.facebookUrl ?? '',
    youtubeUrl: meta.youtubeUrl ?? '',
    tiktokUrl: meta.tiktokUrl ?? '',
    xUrl: meta.xUrl ?? '',
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt,
  };
}

function formatVoucherResponse(v: any) {
  const now = new Date();
  let status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED' = 'ACTIVE';
  if (!v.isActive) {
    status = 'DISABLED';
  } else if (new Date(v.endDate) < now) {
    status = 'EXPIRED';
  } else if (new Date(v.startDate) > now) {
    status = 'UPCOMING';
  }

  return {
    id: v.publicId,
    code: v.code,
    name: v.name,
    description: v.description || '',
    type: v.type,
    discountValue: Number(v.discountValue),
    maxDiscountAmount: v.maxDiscountAmount ? Number(v.maxDiscountAmount) : null,
    minOrderValue: Number(v.minOrderValue),
    usageLimit: v.usageLimit,
    usedCount: v.usedCount,
    usagePerUser: v.usagePerUser,
    startDate: v.startDate instanceof Date ? v.startDate.toISOString() : new Date(v.startDate).toISOString(),
    endDate: v.endDate instanceof Date ? v.endDate.toISOString() : new Date(v.endDate).toISOString(),
    isActive: v.isActive,
    status,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : new Date(v.createdAt).toISOString(),
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : new Date(v.updatedAt).toISOString(),
  };
}

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly notificationsService: NotificationsService,
    private readonly mailQueueService: MailQueueService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload ảnh sản phẩm lên Cloudinary
   */
  async uploadProductImage(file: Express.Multer.File, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const imageUrl = await this.cloudinary.uploadProductImage(file, shop.slug);
    return {
      url: imageUrl,
      secureUrl: imageUrl,
    };
  }

  /**
   * Đăng ký trở thành Seller (Cấp role SELLER và tạo Shop nếu chưa có)
   */
  async registerAsSeller(userPublicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    // 1. Gán role SELLER nếu chưa có
    const hasSeller = user.roles.some((r) => r.role === 'SELLER');
    if (!hasSeller) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'SELLER',
        },
      });
    }

    // 2. Tạo hoặc lấy shop của chính user
    const shop = await this.getOrCreateUserShop(userPublicId);

    const updatedRoles = [...new Set([...user.roles.map((r) => r.role), 'SELLER'])];

    return {
      success: true,
      message: 'Kích hoạt kênh người bán thành công!',
      shop: {
        id: shop.publicId,
        name: shop.name,
        slug: shop.slug,
      },
      roles: updatedRoles,
    };
  }

  /**
   * Lấy hoặc tự động tạo cửa hàng cho Seller
   */
  async getOrCreateUserShop(userPublicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      include: {
        shopMembers: {
          include: { shop: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    // Nếu đã có cửa hàng
    const existingMember = user.shopMembers.find(
      (m) => m.shop.status !== 'SUSPENDED',
    ) || user.shopMembers[0];

    if (existingMember) {
      return existingMember.shop;
    }

    // Nếu chưa có, tạo mới 1 shop mặc định để seller có thể bắt đầu ngay
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const shopSlug = `shop-${toSlug(user.fullName || 'store')}-${randomSuffix}`;

    const newShop = await this.prisma.shop.create({
      data: {
        publicId: ulid(),
        name: `${user.fullName || 'Người bán'} Official Store`,
        slug: shopSlug,
        description: 'Cửa hàng chính hãng trên Commerce Platform',
        status: 'ACTIVE',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return newShop;
  }

  /**
   * Lấy thông tin profile & cấu hình cửa hàng của Seller
   */
  async getShopProfile(userPublicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    const shop = await this.getOrCreateUserShop(userPublicId);
    return formatShopResponse(shop, user);
  }

  /**
   * Cập nhật thông tin profile & cấu hình cửa hàng
   */
  async updateShopProfile(dto: UpdateSellerShopDto, userPublicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    const currentShop = await this.getOrCreateUserShop(userPublicId);

    // Kiểm tra slug trùng lặp nếu có thay đổi slug
    let finalSlug = currentShop.slug;
    if (dto.slug && dto.slug.trim() && dto.slug.trim() !== currentShop.slug) {
      const normalizedSlug = toSlug(dto.slug.trim());
      const duplicate = await this.prisma.shop.findFirst({
        where: {
          slug: normalizedSlug,
          id: { not: currentShop.id },
        },
      });
      if (duplicate) {
        throw new BadRequestException(`Đường dẫn slug "${normalizedSlug}" đã được cửa hàng khác sử dụng.`);
      }
      finalSlug = normalizedSlug;
    }

    // Merge metadata
    const existingMeta = parseShopMetadata(currentShop.description);
    const updatedMeta: ShopMetadata = {
      ...existingMeta,
      bio: dto.description !== undefined ? dto.description : (existingMeta.bio ?? currentShop.description ?? ''),
      category: dto.category !== undefined ? dto.category : existingMeta.category,
      email: dto.email !== undefined ? dto.email : existingMeta.email,
      phone: dto.phone !== undefined ? dto.phone : existingMeta.phone,
      address: dto.address !== undefined ? dto.address : existingMeta.address,
      bannerUrl: dto.bannerUrl !== undefined ? dto.bannerUrl : existingMeta.bannerUrl,
      slogan: dto.slogan !== undefined ? dto.slogan : existingMeta.slogan,
      brandStory: dto.brandStory !== undefined ? dto.brandStory : existingMeta.brandStory,
      allowOrders: dto.allowOrders !== undefined ? dto.allowOrders : existingMeta.allowOrders,
      showOutOfStock: dto.showOutOfStock !== undefined ? dto.showOutOfStock : existingMeta.showOutOfStock,
      requireAuthCheckout: dto.requireAuthCheckout !== undefined ? dto.requireAuthCheckout : existingMeta.requireAuthCheckout,
      operatingType: dto.operatingType !== undefined ? dto.operatingType : existingMeta.operatingType,
      openTime: dto.openTime !== undefined ? dto.openTime : existingMeta.openTime,
      closeTime: dto.closeTime !== undefined ? dto.closeTime : existingMeta.closeTime,
      facebookUrl: dto.facebookUrl !== undefined ? dto.facebookUrl : existingMeta.facebookUrl,
      youtubeUrl: dto.youtubeUrl !== undefined ? dto.youtubeUrl : existingMeta.youtubeUrl,
      tiktokUrl: dto.tiktokUrl !== undefined ? dto.tiktokUrl : existingMeta.tiktokUrl,
      xUrl: dto.xUrl !== undefined ? dto.xUrl : existingMeta.xUrl,
    };

    const updatedShop = await this.prisma.shop.update({
      where: { id: currentShop.id },
      data: {
        name: dto.name?.trim() || currentShop.name,
        slug: finalSlug,
        description: JSON.stringify(updatedMeta),
        logoKey: dto.logoKey !== undefined ? dto.logoKey.trim() : currentShop.logoKey,
        bannerKey: dto.bannerUrl !== undefined ? dto.bannerUrl.trim() : currentShop.bannerKey,
        slogan: dto.slogan !== undefined ? dto.slogan.trim() : currentShop.slogan,
        flatShippingFee:
          dto.flatShippingFee !== undefined
            ? BigInt(Math.max(0, Math.floor(dto.flatShippingFee)))
            : currentShop.flatShippingFee,
        enableFreeShipping:
          dto.enableFreeShipping !== undefined
            ? dto.enableFreeShipping
            : currentShop.enableFreeShipping,
        freeShippingThreshold:
          dto.freeShippingThreshold !== undefined
            ? BigInt(Math.max(0, Math.floor(dto.freeShippingThreshold)))
            : currentShop.freeShippingThreshold,
        pickupContactName:
          dto.pickupContactName !== undefined
            ? dto.pickupContactName.trim()
            : currentShop.pickupContactName,
        pickupPhone:
          dto.pickupPhone !== undefined
            ? dto.pickupPhone.trim()
            : currentShop.pickupPhone,
        pickupAddress:
          dto.pickupAddress !== undefined
            ? dto.pickupAddress.trim()
            : currentShop.pickupAddress,
        pickupNote:
          dto.pickupNote !== undefined
            ? dto.pickupNote.trim()
            : currentShop.pickupNote,
        supportedCarriers:
          dto.supportedCarriers !== undefined
            ? dto.supportedCarriers.trim()
            : currentShop.supportedCarriers,
        allowInspection:
          dto.allowInspection !== undefined
            ? dto.allowInspection
            : currentShop.allowInspection,
        dispatchTime:
          dto.dispatchTime !== undefined
            ? dto.dispatchTime.trim()
            : currentShop.dispatchTime,
        holidayMode:
          dto.holidayMode !== undefined ? dto.holidayMode : currentShop.holidayMode,
        holidayMessage:
          dto.holidayMessage !== undefined ? dto.holidayMessage.trim() : currentShop.holidayMessage,
        enableReturn:
          dto.enableReturn !== undefined ? dto.enableReturn : currentShop.enableReturn,
        returnPeriodDays:
          dto.returnPeriodDays !== undefined
            ? Math.max(0, Math.floor(dto.returnPeriodDays))
            : currentShop.returnPeriodDays,
        requireUnboxVideo:
          dto.requireUnboxVideo !== undefined
            ? dto.requireUnboxVideo
            : currentShop.requireUnboxVideo,
        returnPolicyNote:
          dto.returnPolicyNote !== undefined
            ? dto.returnPolicyNote.trim()
            : currentShop.returnPolicyNote,
        warrantyType:
          dto.warrantyType !== undefined ? dto.warrantyType.trim() : currentShop.warrantyType,
        warrantyPeriodMonths:
          dto.warrantyPeriodMonths !== undefined
            ? Math.max(0, Math.floor(dto.warrantyPeriodMonths))
            : currentShop.warrantyPeriodMonths,
        warrantyPolicyNote:
          dto.warrantyPolicyNote !== undefined
            ? dto.warrantyPolicyNote.trim()
            : currentShop.warrantyPolicyNote,
      },
    });

    return formatShopResponse(updatedShop, user);
  }

  /**
   * Cập nhật trạng thái mở cửa / tạm đóng cửa hàng
   */
  async updateShopStatus(status: 'ACTIVE' | 'CLOSED' | 'PENDING', userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const updated = await this.prisma.shop.update({
      where: { id: shop.id },
      data: { status },
    });

    return {
      success: true,
      status: updated.status,
      message:
        status === 'ACTIVE'
          ? 'Đã mở cửa hoạt động cửa hàng thành công'
          : 'Đã tạm đóng cửa hàng',
    };
  }

  /**
   * Tải ảnh logo cửa hàng lên Cloudinary
   */
  async uploadShopLogo(file: Express.Multer.File, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const imageUrl = await this.cloudinary.uploadProductImage(file, `shop-logos/${shop.slug}`);

    await this.prisma.shop.update({
      where: { id: shop.id },
      data: { logoKey: imageUrl },
    });

    return {
      url: imageUrl,
      secureUrl: imageUrl,
    };
  }

  /**
   * Tải ảnh banner / cover cửa hàng lên Cloudinary
   */
  async uploadShopBanner(file: Express.Multer.File, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const imageUrl = await this.cloudinary.uploadProductImage(file, `shop-banners/${shop.slug}`);

    const existingMeta = parseShopMetadata(shop.description);
    const updatedMeta: ShopMetadata = {
      ...existingMeta,
      bannerUrl: imageUrl,
    };

    await this.prisma.shop.update({
      where: { id: shop.id },
      data: {
        bannerKey: imageUrl,
        description: JSON.stringify(updatedMeta),
      },
    });

    return {
      url: imageUrl,
      secureUrl: imageUrl,
    };
  }

  /**
   * Tìm hoặc tạo mới Category nếu chưa có
   */
  private async resolveCategory(categoryInput: string) {
    const trimmed = categoryInput.trim();
    const slug = toSlug(trimmed);

    let category = await this.prisma.category.findFirst({
      where: {
        OR: [{ slug }, { name: trimmed }],
      },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: trimmed,
          slug: slug || `cat-${Date.now()}`,
          isActive: true,
        },
      });
    }

    return category;
  }

  /**
   * Lấy danh sách tất cả các danh mục đang hoạt động từ Database
   */
  async getCategories() {
    let categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
      },
    });

    if (categories.length === 0) {
      const initialCategories = [
        { name: 'Điện thoại & Phụ kiện', slug: 'dien-thoai', position: 1 },
        { name: 'Laptop & Máy tính', slug: 'laptop', position: 2 },
        { name: 'Tai nghe & Âm thanh', slug: 'tai-nghe', position: 3 },
        { name: 'Đồng hồ thông minh', slug: 'dong-ho', position: 4 },
        { name: 'Thời trang & Phụ kiện', slug: 'thoi-trang', position: 5 },
        { name: 'Giày dép & Balo', slug: 'giay-dep', position: 6 },
        { name: 'Đồ gia dụng & Đời sống', slug: 'gia-dung', position: 7 },
      ];

      for (const cat of initialCategories) {
        await this.prisma.category.upsert({
          where: { slug: cat.slug },
          create: { name: cat.name, slug: cat.slug, position: cat.position, isActive: true },
          update: {},
        });
      }

      categories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, slug: true, position: true },
      });
    }

    const colorPalette = [
      'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      'bg-blue-50 text-blue-700 border-blue-200/60',
      'bg-sky-50 text-sky-700 border-sky-200/60',
      'bg-teal-50 text-teal-700 border-teal-200/60',
      'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      'bg-purple-50 text-purple-700 border-purple-200/60',
      'bg-amber-50 text-amber-700 border-amber-200/60',
      'bg-rose-50 text-rose-700 border-rose-200/60',
    ];

    return categories.map((c, idx) => ({
      name: c.name,
      slug: c.slug,
      color:
        CATEGORY_COLORS[c.slug] ||
        colorPalette[idx % colorPalette.length],
    }));
  }

  /**
   * 1. Thống kê nhanh 4 chỉ số KPI trên cùng trang quản lý sản phẩm
   */
  async getStats(userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const products = await this.prisma.product.findMany({
      where: {
        shopId: shop.id,
        deletedAt: null,
        status: { not: 'ARCHIVED' },
      },
      include: {
        variants: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
      },
    });

    let total = products.length;
    let active = 0;
    let outOfStock = 0;
    let hidden = 0;

    for (const prod of products) {
      const stock = prod.variants.reduce((acc, v) => {
        const onHand = v.inventory?.onHand ?? 0;
        const reserved = v.inventory?.reserved ?? 0;
        return acc + Math.max(0, onHand - reserved);
      }, 0);

      if (prod.status === 'HIDDEN') {
        hidden++;
      } else if (stock <= 0) {
        outOfStock++;
      } else if (prod.status === 'ACTIVE') {
        active++;
      }
    }

    return {
      total,
      active,
      outOfStock,
      hidden,
    };
  }

  /**
   * 2. Lấy danh sách sản phẩm phân trang & bộ lọc
   */
  async getProducts(query: SellerProductQueryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 6));
    const skip = (page - 1) * limit;

    const where: any = {
      shopId: shop.id,
      deletedAt: null,
      status: { not: 'ARCHIVED' },
    };

    // Tìm kiếm theo tên hoặc SKU
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term } },
        { variants: { some: { sku: { contains: term }, deletedAt: null } } },
      ];
    }

    // Lọc theo danh mục
    if (query.category && query.category !== 'all') {
      where.category = {
        OR: [
          { slug: query.category },
          { name: { contains: query.category } },
        ],
      };
    }

    // Lọc theo trạng thái (Record mapping)
    if (query.status && SELLER_PRODUCT_STATUS_MAP[query.status]) {
      Object.assign(where, SELLER_PRODUCT_STATUS_MAP[query.status]);
    }

    // Sắp xếp (Record mapping)
    const sortKey = query.sort ?? SellerProductSortOption.NEWEST;
    const orderBy = SELLER_PRODUCT_SORT_MAP[sortKey] ?? SELLER_PRODUCT_SORT_MAP[SellerProductSortOption.NEWEST];

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          images: { orderBy: { position: 'asc' } },
          variants: {
            where: { deletedAt: null },
            include: {
              inventory: true,
              orderItems: { select: { quantity: true } },
            },
          },
        },
      }),
    ]);

    const formattedProducts = products.map((prod) => {
      const primaryVariant = prod.variants[0];
      const stock = prod.variants.reduce((acc, v) => {
        const onHand = v.inventory?.onHand ?? 0;
        const reserved = v.inventory?.reserved ?? 0;
        return acc + Math.max(0, onHand - reserved);
      }, 0);

      const soldCount = prod.variants.reduce((totalSold, v) => {
        return (
          totalSold +
          (v.orderItems?.reduce((sub, item) => sub + item.quantity, 0) || 0)
        );
      }, 0);

      const image =
        prod.images.find((img) => img.isPrimary)?.storageKey ||
        prod.images[0]?.storageKey ||
        '';

      const catSlug = prod.category?.slug || '';
      const categoryColor =
        CATEGORY_COLORS[catSlug] || 'bg-gray-50 text-gray-700 border-gray-200/60';

      // Tính trạng thái hiển thị
      let displayStatus: 'ACTIVE' | 'OUT_OF_STOCK' | 'HIDDEN' = 'ACTIVE';
      let statusLabel = 'Đang bán';

      if (prod.status === 'HIDDEN') {
        displayStatus = 'HIDDEN';
        statusLabel = 'Tạm ẩn';
      } else if (stock <= 0) {
        displayStatus = 'OUT_OF_STOCK';
        statusLabel = 'Hết hàng';
      }

      const createdAtFormatted = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(prod.createdAt));

      const allImages = prod.images.map((img) => img.storageKey);

      const formattedVariants = prod.variants.map((v) => ({
        id: v.publicId,
        sku: v.sku,
        price: Number(v.price),
        stock: v.inventory ? Math.max(0, v.inventory.onHand - v.inventory.reserved) : 0,
        optionValues: (v.optionValues as Record<string, string>) || undefined,
      }));

      const hasVariants =
        prod.variants.length > 1 ||
        (prod.variants.length === 1 &&
          prod.variants[0].optionValues &&
          Object.keys(prod.variants[0].optionValues as object).length > 0);

      return {
        id: prod.publicId,
        sku: primaryVariant?.sku || `SKU-${prod.publicId.slice(-6).toUpperCase()}`,
        name: prod.name,
        subtitle: prod.description || '',
        image,
        images: allImages.length > 0 ? allImages : [image],
        category: prod.category?.name || 'Khác',
        categoryColor,
        price: Number(primaryVariant?.price ?? prod.minPrice),
        minPrice: Number(prod.minPrice),
        hasVariants,
        variants: formattedVariants,
        stock,
        soldCount,
        status: displayStatus,
        statusLabel,
        createdAt: createdAtFormatted,
      };
    });

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * 3. Lấy chi tiết 1 sản phẩm
   */
  async getProductDetail(publicId: string, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const prod = await this.prisma.product.findFirst({
      where: {
        publicId,
        shopId: shop.id,
        deletedAt: null,
      },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: {
          where: { deletedAt: null },
          include: {
            inventory: true,
            orderItems: { select: { quantity: true } },
          },
        },
      },
    });

    if (!prod) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong cửa hàng của bạn.');
    }

    const primaryVariant = prod.variants[0];
    const totalStock = prod.variants.reduce((acc, v) => {
      const onHand = v.inventory?.onHand ?? 0;
      const reserved = v.inventory?.reserved ?? 0;
      return acc + Math.max(0, onHand - reserved);
    }, 0);

    const formattedVariants = prod.variants.map((v) => ({
      id: v.publicId,
      sku: v.sku,
      price: Number(v.price),
      stock: v.inventory ? Math.max(0, v.inventory.onHand - v.inventory.reserved) : 0,
      optionValues: (v.optionValues as Record<string, string>) || undefined,
    }));

    const hasVariants =
      prod.variants.length > 1 ||
      (prod.variants.length === 1 &&
        prod.variants[0].optionValues &&
        Object.keys(prod.variants[0].optionValues as object).length > 0);

    const soldCount = prod.variants.reduce((totalSold, v) => {
      return (
        totalSold +
        (v.orderItems?.reduce((sub, item) => sub + item.quantity, 0) || 0)
      );
    }, 0);

    const image =
      prod.images.find((img) => img.isPrimary)?.storageKey ||
      prod.images[0]?.storageKey ||
      '';

    const catSlug = prod.category?.slug || '';
    const categoryColor =
      CATEGORY_COLORS[catSlug] || 'bg-gray-50 text-gray-700 border-gray-200/60';

    const allImages = prod.images.map((img) => img.storageKey);

    return {
      id: prod.publicId,
      sku: primaryVariant?.sku || '',
      name: prod.name,
      subtitle: prod.description || '',
      image,
      images: allImages.length > 0 ? allImages : (image ? [image] : []),
      category: prod.category?.name || 'Khác',
      categoryColor,
      price: Number(primaryVariant?.price ?? prod.minPrice),
      minPrice: Number(prod.minPrice),
      stock: totalStock,
      hasVariants,
      variants: formattedVariants,
      soldCount,
      status: prod.status === 'HIDDEN' ? 'HIDDEN' : totalStock <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
      statusLabel: prod.status === 'HIDDEN' ? 'Tạm ẩn' : totalStock <= 0 ? 'Hết hàng' : 'Đang bán',
      createdAt: prod.createdAt.toISOString(),
    };
  }

  /**
   * 4. Tạo mới sản phẩm (Transaction Product + Variant + Inventory + Image)
   */
  async createProduct(dto: CreateSellerProductDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const hasVariants = Array.isArray(dto.variants) && dto.variants.length > 0;

    // 1. Kiểm tra SKU trùng lặp
    if (hasVariants) {
      const skus = dto.variants!.map((v) => v.sku.trim());
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        throw new BadRequestException('Mã SKU giữa các biến thể không được trùng nhau.');
      }

      const duplicateSku = await this.prisma.productVariant.findFirst({
        where: {
          shopId: shop.id,
          sku: { in: skus },
          deletedAt: null,
        },
      });
      if (duplicateSku) {
        throw new BadRequestException(`Mã SKU "${duplicateSku.sku}" đã tồn tại trong cửa hàng.`);
      }
    } else {
      const existingSku = await this.prisma.productVariant.findFirst({
        where: {
          shopId: shop.id,
          sku: dto.sku.trim(),
          deletedAt: null,
        },
      });
      if (existingSku) {
        throw new BadRequestException(`Mã SKU "${dto.sku}" đã tồn tại trong cửa hàng.`);
      }
    }

    const category = await this.resolveCategory(dto.category);
    const productPublicId = ulid();
    const baseSlug = toSlug(dto.name);
    const uniqueSlug = `${baseSlug}-${productPublicId.slice(-6).toLowerCase()}`;

    const calculatedMinPrice = hasVariants
      ? Math.min(...dto.variants!.map((v) => Number(v.price)))
      : Number(dto.price);

    const created = await this.prisma.$transaction(async (tx) => {
      // 1. Tạo Product
      const product = await tx.product.create({
        data: {
          publicId: productPublicId,
          shopId: shop.id,
          categoryId: category.id,
          name: dto.name.trim(),
          slug: uniqueSlug,
          description: dto.subtitle?.trim() || null,
          searchText: generateSearchText({
            name: dto.name.trim(),
            slug: uniqueSlug,
            categoryName: category.name,
            shopName: shop.name,
            description: dto.subtitle?.trim() || undefined,
          }),
          status: dto.status || 'ACTIVE',
          minPrice: BigInt(calculatedMinPrice),
        },
      });

      // 2. Tạo các biến thể (hoặc 1 biến thể mặc định)
      if (hasVariants) {
        for (const vDto of dto.variants!) {
          const vPublicId = ulid();
          const optHash = computeOptionHash(vDto.optionValues);

          const variant = await tx.productVariant.create({
            data: {
              publicId: vPublicId,
              productId: product.id,
              shopId: shop.id,
              sku: vDto.sku.trim(),
              price: BigInt(vDto.price),
              optionValues: vDto.optionValues || undefined,
              optionHash: optHash,
              status: 'ACTIVE',
            },
          });

          await tx.inventory.create({
            data: {
              variantId: variant.id,
              shopId: shop.id,
              onHand: Math.max(0, vDto.stock),
              reserved: 0,
            },
          });

          if (vDto.image && vDto.image.trim()) {
            await tx.productImage.create({
              data: {
                productId: product.id,
                variantId: variant.id,
                storageKey: vDto.image.trim(),
                isPrimary: false,
                position: 99,
              },
            });
          }
        }
      } else {
        const variantPublicId = ulid();
        const variant = await tx.productVariant.create({
          data: {
            publicId: variantPublicId,
            productId: product.id,
            shopId: shop.id,
            sku: dto.sku.trim(),
            price: BigInt(dto.price),
            optionHash: 'default',
            status: 'ACTIVE',
          },
        });

        await tx.inventory.create({
          data: {
            variantId: variant.id,
            shopId: shop.id,
            onHand: Math.max(0, dto.stock),
            reserved: 0,
          },
        });
      }

      // 3. Tạo ProductImage chung (ảnh sản phẩm)
      const imageUrls = Array.isArray(dto.images) && dto.images.length > 0
        ? dto.images.filter((img) => typeof img === 'string' && img.trim())
        : dto.image && dto.image.trim()
          ? [dto.image.trim()]
          : [];

      if (imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: imageUrls.map((url, idx) => ({
            productId: product.id,
            storageKey: url.trim(),
            isPrimary: idx === 0,
            position: idx,
          })),
        });
      }

      return { product };
    });

    return this.getProductDetail(created.product.publicId, userPublicId);
  }

  /**
   * 5. Cập nhật sản phẩm
   */
  async updateProduct(
    publicId: string,
    dto: UpdateSellerProductDto,
    userPublicId: string,
  ) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const existingProduct = await this.prisma.product.findFirst({
      where: {
        publicId,
        shopId: shop.id,
        deletedAt: null,
      },
      include: {
        variants: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
        images: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong cửa hàng của bạn.');
    }

    const primaryVariant = existingProduct.variants[0];
    const hasVariants = Array.isArray(dto.variants) && dto.variants.length > 0;

    // Kiểm tra SKU nếu thay đổi
    if (hasVariants) {
      const skus = dto.variants!.map((v) => v.sku.trim());
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        throw new BadRequestException('Mã SKU giữa các biến thể không được trùng lặp.');
      }

      const duplicateSku = await this.prisma.productVariant.findFirst({
        where: {
          shopId: shop.id,
          sku: { in: skus },
          productId: { not: existingProduct.id },
          deletedAt: null,
        },
      });
      if (duplicateSku) {
        throw new BadRequestException(`Mã SKU "${duplicateSku.sku}" đã được sử dụng ở sản phẩm khác.`);
      }
    } else if (dto.sku && primaryVariant && dto.sku.trim() !== primaryVariant.sku) {
      const duplicateSku = await this.prisma.productVariant.findFirst({
        where: {
          shopId: shop.id,
          sku: dto.sku.trim(),
          id: { not: primaryVariant.id },
          deletedAt: null,
        },
      });
      if (duplicateSku) {
        throw new BadRequestException(`Mã SKU "${dto.sku}" đã được sử dụng.`);
      }
    }

    // Resolve category nếu có
    let categoryId = existingProduct.categoryId;
    if (dto.category) {
      const cat = await this.resolveCategory(dto.category);
      categoryId = cat.id;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật Product
      const productUpdateData: any = {};
      if (dto.name) {
        productUpdateData.name = dto.name.trim();
        productUpdateData.slug = `${toSlug(dto.name)}-${existingProduct.publicId.slice(-6).toLowerCase()}`;
      }
      if (dto.subtitle !== undefined) {
        productUpdateData.description = dto.subtitle ? dto.subtitle.trim() : null;
      }
      if (dto.category) {
        productUpdateData.categoryId = categoryId;
      }
      if (dto.status) {
        productUpdateData.status = dto.status;
      }
      if (dto.name || dto.category || dto.subtitle !== undefined) {
        productUpdateData.searchText = generateSearchText({
          name: dto.name ? dto.name.trim() : existingProduct.name,
          slug: productUpdateData.slug || existingProduct.slug,
          categoryName: dto.category ? (await this.resolveCategory(dto.category)).name : undefined,
          shopName: shop.name,
          description: dto.subtitle !== undefined ? dto.subtitle?.trim() : existingProduct.description || undefined,
        });
      }
      if (hasVariants) {
        productUpdateData.minPrice = BigInt(Math.min(...dto.variants!.map((v) => Number(v.price))));
      } else if (dto.price !== undefined) {
        productUpdateData.minPrice = BigInt(dto.price);
      }

      if (Object.keys(productUpdateData).length > 0) {
        await tx.product.update({
          where: { id: existingProduct.id },
          data: productUpdateData,
        });
      }

      // 2. Cập nhật Variants
      if (hasVariants) {
        const existingMap = new Map(existingProduct.variants.map((v) => [v.optionHash.trim(), v]));
        const processedIds = new Set<string>();

        for (const vDto of dto.variants!) {
          const optHash = computeOptionHash(vDto.optionValues);
          const matched = existingMap.get(optHash);

          if (matched) {
            processedIds.add(matched.id.toString());
            await tx.productVariant.update({
              where: { id: matched.id },
              data: {
                sku: vDto.sku.trim(),
                price: BigInt(vDto.price),
                optionValues: vDto.optionValues || undefined,
                status: 'ACTIVE',
                deletedAt: null,
              },
            });

            await tx.inventory.upsert({
              where: { variantId: matched.id },
              create: {
                variantId: matched.id,
                shopId: shop.id,
                onHand: Math.max(0, vDto.stock),
                reserved: 0,
              },
              update: {
                onHand: Math.max(0, vDto.stock),
              },
            });
          } else {
            const vPublicId = ulid();
            const createdV = await tx.productVariant.create({
              data: {
                publicId: vPublicId,
                productId: existingProduct.id,
                shopId: shop.id,
                sku: vDto.sku.trim(),
                price: BigInt(vDto.price),
                optionValues: vDto.optionValues || undefined,
                optionHash: optHash,
                status: 'ACTIVE',
              },
            });

            await tx.inventory.create({
              data: {
                variantId: createdV.id,
                shopId: shop.id,
                onHand: Math.max(0, vDto.stock),
                reserved: 0,
              },
            });
          }
        }

        // Ẩn hoặc dọn dẹp các biến thể cũ không còn dùng
        for (const oldV of existingProduct.variants) {
          if (!processedIds.has(oldV.id.toString())) {
            await tx.productVariant.update({
              where: { id: oldV.id },
              data: {
                deletedAt: new Date(),
                sku: `${oldV.sku}_del_${Date.now()}`,
                status: 'INACTIVE',
              },
            });
          }
        }
      } else if (primaryVariant) {
        // Cập nhật biến thể đơn
        const variantUpdateData: any = {};
        if (dto.sku) variantUpdateData.sku = dto.sku.trim();
        if (dto.price !== undefined) variantUpdateData.price = BigInt(dto.price);

        if (Object.keys(variantUpdateData).length > 0) {
          await tx.productVariant.update({
            where: { id: primaryVariant.id },
            data: variantUpdateData,
          });
        }

        // Cập nhật Inventory
        if (dto.stock !== undefined) {
          await tx.inventory.upsert({
            where: { variantId: primaryVariant.id },
            create: {
              variantId: primaryVariant.id,
              shopId: shop.id,
              onHand: Math.max(0, dto.stock),
              reserved: 0,
            },
            update: {
              onHand: Math.max(0, dto.stock),
            },
          });
        }
      }

      // 4. Cập nhật Images
      if (dto.images !== undefined) {
        const imageUrls = Array.isArray(dto.images)
          ? dto.images.filter((img) => typeof img === 'string' && img.trim())
          : [];

        // Xoá danh sách ảnh cũ
        await tx.productImage.deleteMany({
          where: { productId: existingProduct.id },
        });

        // Tạo danh sách ảnh mới theo thứ tự position (ảnh đầu tiên là isPrimary)
        if (imageUrls.length > 0) {
          await tx.productImage.createMany({
            data: imageUrls.map((url, idx) => ({
              productId: existingProduct.id,
              variantId: primaryVariant?.id,
              storageKey: url.trim(),
              isPrimary: idx === 0,
              position: idx,
            })),
          });
        }
      } else if (dto.image && dto.image.trim()) {
        const primaryImage = existingProduct.images.find((img) => img.isPrimary) || existingProduct.images[0];
        if (primaryImage) {
          await tx.productImage.update({
            where: { id: primaryImage.id },
            data: { storageKey: dto.image.trim() },
          });
        } else {
          await tx.productImage.create({
            data: {
              productId: existingProduct.id,
              variantId: primaryVariant?.id,
              storageKey: dto.image.trim(),
              isPrimary: true,
              position: 0,
            },
          });
        }
      }
    });

    return this.getProductDetail(existingProduct.publicId, userPublicId);
  }

  /**
   * 6. Thay đổi nhanh trạng thái Bán / Ẩn
   */
  async toggleProductStatus(
    publicId: string,
    dto: UpdateProductStatusDto,
    userPublicId: string,
  ) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const product = await this.prisma.product.findFirst({
      where: {
        publicId,
        shopId: shop.id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }

    await this.prisma.product.update({
      where: { id: product.id },
      data: { status: dto.status },
    });

    return {
      success: true,
      publicId,
      status: dto.status,
      message:
        dto.status === 'ACTIVE'
          ? 'Đã bật bán sản phẩm thành công'
          : 'Đã tạm ẩn sản phẩm thành công',
    };
  }

  /**
   * 7. Xóa mềm sản phẩm (Soft Delete an toàn)
   */
  async deleteProduct(publicId: string, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const product = await this.prisma.product.findFirst({
      where: {
        publicId,
        shopId: shop.id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm để xóa.');
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // Đánh dấu deletedAt và trạng thái ARCHIVED
      await tx.product.update({
        where: { id: product.id },
        data: {
          deletedAt: now,
          status: 'ARCHIVED',
        },
      });

      await tx.productVariant.updateMany({
        where: { productId: product.id },
        data: {
          deletedAt: now,
          status: 'INACTIVE',
        },
      });
    });

    return {
      success: true,
      message: 'Sản phẩm đã được xóa thành công.',
    };
  }

  // =========================================================================
  // GIAI ĐOẠN 2: QUẢN LÝ ĐƠN HÀNG (ORDERS) & KHO HÀNG (INVENTORY)
  // =========================================================================

  /**
   * Thống kê 4 thẻ chỉ số đơn hàng của cửa hàng
   */
  async getOrderStats(userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const [total, pending, processing, shipping, delivered, cancelled] = await Promise.all([
      this.prisma.sellerOrder.count({ where: { shopId: shop.id } }),
      this.prisma.sellerOrder.count({ where: { shopId: shop.id, status: 'PENDING' } }),
      this.prisma.sellerOrder.count({ where: { shopId: shop.id, status: 'PROCESSING' } }),
      this.prisma.sellerOrder.count({ where: { shopId: shop.id, status: 'SHIPPED' } }),
      this.prisma.sellerOrder.count({ where: { shopId: shop.id, status: 'DELIVERED' } }),
      this.prisma.sellerOrder.count({ where: { shopId: shop.id, status: 'CANCELLED' } }),
    ]);

    return {
      total,
      pending: pending + processing,
      shipping,
      delivered,
      cancelled,
    };
  }

  /**
   * Định dạng dữ liệu SellerOrder sang SellerOrderRecord
   */
  private formatSellerOrder(so: any) {
    const parentOrder = so.order;
    const addr = parentOrder?.shippingAddress;
    let formattedAddress = '';
    let customerName = parentOrder?.user?.fullName || 'Khách hàng';
    let customerPhone = parentOrder?.contactPhone || '';
    let customerEmail = parentOrder?.contactEmail || parentOrder?.user?.email || '';

    if (addr) {
      if (typeof addr === 'string') {
        formattedAddress = addr;
      } else if (typeof addr === 'object') {
        const parts = [addr.line1, addr.ward, addr.district, addr.province].filter(Boolean);
        formattedAddress = parts.join(', ');
        if (addr.recipientName) customerName = addr.recipientName;
        if (addr.phone) customerPhone = addr.phone;
      }
    }

    let statusLabel = 'Đang xử lý';
    let statusColor: 'amber' | 'blue' | 'green' | 'gray' = 'amber';
    let frontendStatus: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' = 'PENDING';

    if (so.status === 'SHIPPED') {
      frontendStatus = 'SHIPPING';
      statusLabel = 'Đang giao';
      statusColor = 'blue';
    } else if (so.status === 'DELIVERED') {
      frontendStatus = 'DELIVERED';
      statusLabel = 'Hoàn thành';
      statusColor = 'green';
    } else if (so.status === 'CANCELLED') {
      frontendStatus = 'CANCELLED';
      statusLabel = 'Đã hủy';
      statusColor = 'gray';
    }

    const createdAtStr = new Date(parentOrder?.placedAt || so.id).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const items = (so.orderItems || []).map((it: any) => ({
      id: it.id ? it.id.toString() : it.sku,
      name: it.productName,
      sku: it.sku,
      price: Number(it.unitPrice),
      quantity: it.quantity,
      variantLabel: it.variantLabel || 'Mặc định',
      image:
        it.imageKey ||
        it.variant?.images?.[0]?.storageKey ||
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=150&auto=format&fit=crop&q=80',
    }));

    return {
      id: so.publicId,
      orderNumber: parentOrder?.orderNumber || `#ORD-${so.publicId.slice(0, 8)}`,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: formattedAddress || 'Địa chỉ giao hàng',
      totalAmount: Number(so.total),
      shippingFee: Number(so.shippingFee || 0),
      status: frontendStatus,
      statusLabel,
      statusColor,
      createdAt: createdAtStr,
      carrier: so.carrier || 'Giao Hàng Nhanh',
      trackingCode: so.trackingCode || '',
      items,
    };
  }

  /**
   * Lấy danh sách đơn hàng của cửa hàng kèm tìm kiếm, lọc & phân trang
   */
  async getOrders(query: SellerOrderQueryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const {
      status = SellerOrderStatusFilter.ALL,
      search,
      page = 1,
      limit = 10,
      timeRange = SellerOrderTimeRange.ALL,
      amountRange = SellerOrderAmountRange.ALL,
      sortBy = SellerOrderSortBy.NEWEST,
    } = query;

    const where: any = { shopId: shop.id };

    // Lọc theo trạng thái (Record mapping)
    if (status && SELLER_ORDER_STATUS_MAP[status]) {
      Object.assign(where, SELLER_ORDER_STATUS_MAP[status]);
    }

    // Lọc theo khoảng thời gian đặt đơn (timeRange helper)
    const timeRangeWhere = getSellerOrderTimeRangeWhere(timeRange);
    if (timeRangeWhere) {
      where.order = { ...(where.order || {}), ...timeRangeWhere.order };
    }

    // Lọc theo khoảng giá trị đơn hàng (Record mapping)
    if (amountRange && SELLER_ORDER_AMOUNT_MAP[amountRange]) {
      Object.assign(where, SELLER_ORDER_AMOUNT_MAP[amountRange]);
    }

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { order: { orderNumber: { contains: s } } },
        { order: { contactEmail: { contains: s } } },
        { order: { contactPhone: { contains: s } } },
        { order: { user: { fullName: { contains: s } } } },
      ];
    }

    // Sắp xếp đơn hàng (Record mapping)
    const orderBy = SELLER_ORDER_SORT_MAP[sortBy] ?? SELLER_ORDER_SORT_MAP[SellerOrderSortBy.NEWEST];

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [totalItems, sellerOrders, countsGroup] = await Promise.all([
      this.prisma.sellerOrder.count({ where }),
      this.prisma.sellerOrder.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          order: {
            include: {
              user: true,
            },
          },
          orderItems: {
            include: {
              variant: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.sellerOrder.groupBy({
        by: ['status'],
        where: { shopId: shop.id },
        _count: { status: true },
      }),
    ]);

    const counts: Record<string, number> = {
      ALL: 0,
      PENDING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    countsGroup.forEach((g) => {
      counts.ALL += g._count.status;
      if (g.status === 'PENDING' || g.status === 'PROCESSING') {
        counts.PENDING += g._count.status;
      } else if (g.status === 'SHIPPED') {
        counts.SHIPPING += g._count.status;
      } else if (g.status === 'DELIVERED') {
        counts.DELIVERED += g._count.status;
      } else if (g.status === 'CANCELLED') {
        counts.CANCELLED += g._count.status;
      }
    });

    const items = sellerOrders.map((so) => this.formatSellerOrder(so));

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)) || 1,
      },
      counts,
    };
  }

  /**
   * Lấy chi tiết đơn hàng theo PublicId
   */
  async getOrderDetail(orderPublicId: string, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const sellerOrder = await this.prisma.sellerOrder.findFirst({
      where: {
        publicId: orderPublicId,
        shopId: shop.id,
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!sellerOrder) {
      throw new NotFoundException('Không tìm thấy đơn hàng của cửa hàng.');
    }

    return this.formatSellerOrder(sellerOrder);
  }

  /**
   * Cập nhật trạng thái đơn hàng từ phía người bán (Shop)
   * Liên kết kho tự động:
   * - DELIVERED: Xuất kho vật lý (COMMIT: trừ on_hand & reserved), chốt reservation COMMITTED
   * - CANCELLED: Giải phóng giữ hàng (RELEASE: nhả reserved), đổi reservation RELEASED
   * - SHIPPING: Cập nhật carrier, trackingCode, shippedAt
   * - PROCESSING: Bắt đầu chuẩn bị hàng
   */
  async updateOrderStatus(
    orderPublicId: string,
    dto: UpdateSellerOrderStatusDto,
    userPublicId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      select: { id: true },
    });
    const actorUserId = user?.id || null;

    const shop = await this.getOrCreateUserShop(userPublicId);
    const sellerOrder = await this.prisma.sellerOrder.findFirst({
      where: {
        publicId: orderPublicId,
        shopId: shop.id,
      },
      include: {
        order: {
          include: {
            sellerOrders: true,
            voucherUsages: true,
          },
        },
        orderItems: true,
      },
    });

    if (!sellerOrder) {
      throw new NotFoundException('Không tìm thấy đơn hàng của cửa hàng.');
    }

    // 1. Kiểm tra máy trạng thái (State Machine Validation)
    const currentStatus = sellerOrder.status;

    if (currentStatus === 'DELIVERED') {
      throw new BadRequestException('Đơn hàng đã giao thành công, không thể thay đổi trạng thái.');
    }
    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException('Đơn hàng đã bị hủy, không thể thay đổi trạng thái.');
    }

    let targetStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' = 'PENDING';
    if (dto.status === 'PENDING') targetStatus = 'PENDING';
    else if (dto.status === 'PROCESSING') targetStatus = 'PROCESSING';
    else if (dto.status === 'SHIPPING') targetStatus = 'SHIPPED';
    else if (dto.status === 'DELIVERED') targetStatus = 'DELIVERED';
    else if (dto.status === 'CANCELLED') targetStatus = 'CANCELLED';

    if (currentStatus === targetStatus) {
      return {
        success: true,
        status: targetStatus,
        message: 'Đơn hàng đã ở trạng thái này.',
      };
    }

    const now = new Date();

    // 2. Thực hiện trong Database Transaction để đảm bảo tính toàn vẹn với Kho
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // ------------------------------------------------------------------
      // TRƯỜNG HỢP 1: SHOP HỦY ĐƠN HÀNG (CANCELLED)
      // ------------------------------------------------------------------
      if (targetStatus === 'CANCELLED') {
        if (currentStatus === 'SHIPPED') {
          throw new BadRequestException(
            'Đơn hàng đã được bàn giao cho đơn vị vận chuyển, không thể hủy trực tiếp. Vui lòng liên hệ hỗ trợ.',
          );
        }

        // A. Giải phóng các phiếu giữ hàng InventoryReservation sang RELEASED
        for (const item of sellerOrder.orderItems) {
          await tx.inventoryReservation.updateMany({
            where: {
              orderId: sellerOrder.orderId,
              variantId: item.variantId,
              status: 'ACTIVE',
            },
            data: {
              status: 'RELEASED',
            },
          });

          // B. Giảm reserved trong Inventory
          await tx.$executeRaw`
            UPDATE \`inventory\`
            SET \`reserved\` = GREATEST(0, \`reserved\` - ${item.quantity}),
                \`version\` = \`version\` + 1
            WHERE \`variant_id\` = ${item.variantId}
          `;

          // C. Ghi sổ cái kế toán kho InventoryMovement (loại RELEASE)
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              shopId: shop.id,
              type: 'RELEASE',
              onHandDelta: 0,
              reservedDelta: -item.quantity,
              reason: dto.reason?.trim() || `Shop hủy đơn hàng #${sellerOrder.order.orderNumber}`,
              refType: 'ORDER',
              refId: sellerOrder.order.orderNumber,
              actorUserId,
            },
          });
        }

        // D. Cập nhật SellerOrder
        const updatedSellerOrder = await tx.sellerOrder.update({
          where: { id: sellerOrder.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
          },
        });

        // E. Kiểm tra nếu tất cả các SellerOrder của đơn tổng đều đã bị hủy -> Hủy luôn Order tổng
        const otherSellerOrders = sellerOrder.order.sellerOrders.filter(
          (so) => so.id !== sellerOrder.id,
        );
        const allCancelled = otherSellerOrders.every((so) => so.status === 'CANCELLED');

        if (allCancelled) {
          await tx.order.update({
            where: { id: sellerOrder.orderId },
            data: { status: 'CANCELLED' },
          });

          // Hoàn trả voucher nếu đơn tổng bị hủy hoàn toàn
          for (const usage of sellerOrder.order.voucherUsages) {
            await tx.voucher.update({
              where: { id: usage.voucherId },
              data: { usedCount: { decrement: 1 } },
            });
            await tx.voucherUsage.delete({
              where: { id: usage.id },
            });
          }
        }

        return {
          status: updatedSellerOrder.status,
          message: 'Hủy đơn hàng thành công và đã giải phóng tồn kho cho người mua khác.',
        };
      }

      // ------------------------------------------------------------------
      // TRƯỜNG HỢP 2: GIAO HÀNG THÀNH CÔNG (DELIVERED)
      // ------------------------------------------------------------------
      if (targetStatus === 'DELIVERED') {
        // A. Chốt phiếu giữ hàng sang COMMITTED và trừ kho vật lý (on_hand & reserved)
        for (const item of sellerOrder.orderItems) {
          await tx.inventoryReservation.updateMany({
            where: {
              orderId: sellerOrder.orderId,
              variantId: item.variantId,
              status: 'ACTIVE',
            },
            data: {
              status: 'COMMITTED',
            },
          });

          // Trừ on_hand và trừ reserved
          await tx.$executeRaw`
            UPDATE \`inventory\`
            SET \`on_hand\` = GREATEST(0, \`on_hand\` - ${item.quantity}),
                \`reserved\` = GREATEST(0, \`reserved\` - ${item.quantity}),
                \`version\` = \`version\` + 1
            WHERE \`variant_id\` = ${item.variantId}
          `;

          // Ghi sổ cái xuất kho (COMMIT)
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              shopId: shop.id,
              type: 'COMMIT',
              onHandDelta: -item.quantity,
              reservedDelta: -item.quantity,
              reason: `Giao hàng thành công đơn #${sellerOrder.order.orderNumber}`,
              refType: 'ORDER',
              refId: sellerOrder.order.orderNumber,
              actorUserId,
            },
          });
        }

        // B. Cập nhật SellerOrder
        const updatedSellerOrder = await tx.sellerOrder.update({
          where: { id: sellerOrder.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: now,
          },
        });

        // C. Kiểm tra nếu tất cả SellerOrder đều đã DELIVERED -> Cập nhật Order tổng sang COMPLETED
        const otherSellerOrders = sellerOrder.order.sellerOrders.filter(
          (so) => so.id !== sellerOrder.id,
        );
        const allDelivered = otherSellerOrders.every((so) => so.status === 'DELIVERED');

        if (allDelivered) {
          await tx.order.update({
            where: { id: sellerOrder.orderId },
            data: { status: 'COMPLETED' },
          });
        }

        return {
          status: updatedSellerOrder.status,
          message: 'Xác nhận giao hàng thành công, đã xuất kho vật lý.',
        };
      }

      // ------------------------------------------------------------------
      // TRƯỜNG HỢP 3: CHUẨN BỊ ĐƠN (PROCESSING) HOẶC BÀN GIAO VẬN CHUYỂN (SHIPPED)
      // ------------------------------------------------------------------
      const updateData: any = { status: targetStatus };

      if (targetStatus === 'SHIPPED') {
        updateData.shippedAt = now;
        if (dto.carrier?.trim()) updateData.carrier = dto.carrier.trim();
        if (dto.trackingCode?.trim()) updateData.trackingCode = dto.trackingCode.trim();
      }

      const updatedSellerOrder = await tx.sellerOrder.update({
        where: { id: sellerOrder.id },
        data: updateData,
      });

      return {
        status: updatedSellerOrder.status,
        message: targetStatus === 'SHIPPED'
          ? 'Đã cập nhật giao cho đơn vị vận chuyển.'
          : 'Đã xác nhận đơn hàng và đang chuẩn bị đóng gói.',
      };
    });

    // Gửi thông báo In-App cho người mua về cập nhật trạng thái đơn hàng
    try {
      const buyerId = sellerOrder.order.userId;
      let notifTitle = 'Cập nhật đơn hàng';
      let notifMsg = `Đơn hàng #${sellerOrder.order.orderNumber} của bạn vừa được cập nhật trạng thái.`;

      if (result.status === 'PROCESSING') {
        notifTitle = 'Người bán đang chuẩn bị hàng';
        notifMsg = `Cửa hàng ${shop.name} đang chuẩn bị đơn hàng #${sellerOrder.order.orderNumber} của bạn.`;
      } else if (result.status === 'SHIPPED') {
        notifTitle = 'Đơn hàng đang trên đường giao';
        notifMsg = `Đơn hàng #${sellerOrder.order.orderNumber} đã được giao cho đơn vị vận chuyển${dto.carrier ? ` (${dto.carrier})` : ''}.`;
      } else if (result.status === 'DELIVERED') {
        notifTitle = 'Đơn hàng đã giao thành công';
        notifMsg = `Đơn hàng #${sellerOrder.order.orderNumber} đã được giao thành công đến bạn.`;
      } else if (result.status === 'CANCELLED') {
        notifTitle = 'Đơn hàng bị hủy';
        notifMsg = `Đơn hàng #${sellerOrder.order.orderNumber} đã bị hủy bởi người bán.`;
      }

      this.notificationsService
        .createNotification({
          userId: buyerId,
          type: 'ORDER',
          title: notifTitle,
          message: notifMsg,
          link: `/orders/${sellerOrder.order.publicId}`,
          metadata: {
            orderId: sellerOrder.order.publicId,
            orderNumber: sellerOrder.order.orderNumber,
            status: result.status,
          },
        })
        .catch(() => {});

      // Gửi email cập nhật trạng thái đơn hàng (Order Status Email) tới người mua
      const customerEmail = sellerOrder.order.contactEmail;
      if (customerEmail && ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(result.status)) {
        const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
        const trackingUrl = `${clientUrl}/orders/${sellerOrder.order.publicId}`;
        const recipientName =
          (sellerOrder.order.shippingAddress as any)?.recipientName || 'Quý khách';

        this.mailQueueService
          .enqueueSendOrderStatus({
            email: customerEmail,
            recipientName,
            orderNumber: sellerOrder.order.orderNumber,
            status: result.status,
            statusLabel: notifTitle,
            statusDescription: notifMsg,
            trackingUrl,
          })
          .catch(() => {});
      }
    } catch {
      // Ignore notification failures to avoid blocking status update
    }

    return {
      success: true,
      status: result.status,
      message: result.message,
    };
  }

  /**
   * Thống kê 4 thẻ chỉ số kho hàng (Tổng mặt hàng, Sắp hết, Hết hàng, Tổng tồn kho)
   */
  async getInventoryStats(userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const variants = await this.prisma.productVariant.findMany({
      where: {
        shopId: shop.id,
        deletedAt: null,
      },
      include: {
        inventory: true,
      },
    });

    const totalProducts = variants.length;
    let lowStock = 0;
    let outOfStock = 0;
    let totalStockQty = 0;

    for (const v of variants) {
      const onHand = v.inventory?.onHand ?? 0;
      const threshold = v.inventory?.lowStockThreshold ?? 10;
      totalStockQty += onHand;

      if (onHand <= 0) {
        outOfStock++;
      } else if (onHand <= threshold) {
        lowStock++;
      }
    }

    return {
      totalProducts,
      lowStock,
      outOfStock,
      totalStockQuantity: totalStockQty.toLocaleString('vi-VN'),
    };
  }

  /**
   * Lấy danh sách tồn kho phân trang, tìm kiếm & bộ lọc
   */
  async getInventory(query: SellerInventoryQueryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const {
      search,
      category,
      status = SellerStockLevelFilter.ALL,
      sortBy = SellerInventorySortBy.NEWEST,
      stockLevel = SellerStockLevelFilter.ALL,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {
      shopId: shop.id,
      deletedAt: null,
    };

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { sku: { contains: s } },
        { product: { name: { contains: s } } },
        { product: { brand: { name: { contains: s } } } },
      ];
    }

    if (category && category !== 'ALL') {
      where.product = {
        ...(where.product || {}),
        category: {
          OR: [{ slug: category }, { name: category }],
        },
      };
    }

    // Lọc theo trạng thái hoặc mức tồn kho chi tiết (Record mapping)
    const targetStatus = stockLevel !== SellerStockLevelFilter.ALL ? stockLevel : status;
    if (targetStatus && SELLER_STOCK_LEVEL_MAP[targetStatus]) {
      Object.assign(where, SELLER_STOCK_LEVEL_MAP[targetStatus]);
    }

    // Sắp xếp kho hàng (Record mapping)
    const orderBy = SELLER_INVENTORY_SORT_MAP[sortBy] ?? SELLER_INVENTORY_SORT_MAP[SellerInventorySortBy.NEWEST];

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [totalItems, variants] = await Promise.all([
      this.prisma.productVariant.count({ where }),
      this.prisma.productVariant.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          inventory: true,
          images: true,
          product: {
            include: {
              category: true,
              brand: true,
              images: true,
            },
          },
        },
      }),
    ]);

    const items = variants.map((v) => {
      const stock = v.inventory?.onHand ?? 0;
      const threshold = v.inventory?.lowStockThreshold ?? 10;

      let itemStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      let statusLabel = 'Còn hàng';
      let statusColor: 'green' | 'amber' | 'rose' = 'green';

      if (stock <= 0) {
        itemStatus = 'OUT_OF_STOCK';
        statusLabel = 'Hết hàng';
        statusColor = 'rose';
      } else if (stock <= threshold) {
        itemStatus = 'LOW_STOCK';
        statusLabel = 'Sắp hết';
        statusColor = 'amber';
      }

      const imageUrl =
        v.images?.[0]?.storageKey ||
        v.product?.images?.[0]?.storageKey ||
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=150&auto=format&fit=crop&q=80';

      const updatedAtStr = new Date(v.inventory?.updatedAt || v.updatedAt).toLocaleDateString('vi-VN');

      return {
        id: v.publicId,
        variantId: v.id.toString(),
        name: v.product?.name || 'Sản phẩm',
        brand: v.product?.brand?.name || 'Thương hiệu',
        variant: formatVariantLabel(v.optionValues),
        sku: v.sku,
        stock,
        category: v.product?.category?.name || 'Chung',
        image: imageUrl,
        status: itemStatus,
        statusLabel,
        statusColor,
        updatedAt: updatedAtStr,
      };
    });

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)) || 1,
      },
    };
  }

  /**
   * Điều chỉnh tồn kho sản phẩm (Cập nhật số lượng & ghi log kiểm kê)
   */
  async adjustInventory(dto: AdjustSellerInventoryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const variant = await this.prisma.productVariant.findFirst({
      where: {
        OR: [
          { publicId: dto.itemId },
          { sku: dto.itemId },
        ],
        shopId: shop.id,
      },
      include: {
        inventory: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Không tìm thấy mặt hàng tồn kho.');
    }

    const currentOnHand = variant.inventory?.onHand ?? 0;
    const newStock = Math.max(0, Number(dto.newStock));
    const delta = newStock - currentOnHand;

    await this.prisma.$transaction(async (tx) => {
      await tx.inventory.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          shopId: shop.id,
          onHand: newStock,
          reserved: 0,
        },
        update: {
          onHand: newStock,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId: variant.id,
          shopId: shop.id,
          type: 'ADJUST',
          onHandDelta: delta,
          reservedDelta: 0,
          reason: dto.reason || 'Kiểm kê định kỳ từ Kênh người bán',
        },
      });
    });

    return {
      success: true,
      itemId: variant.publicId,
      newStock,
      message: 'Điều chỉnh tồn kho thành công.',
    };
  }

  // =========================================================================
  // GIAI ĐOẠN 3: TỔNG QUAN (OVERVIEW) & THỐNG KÊ DOANH THU (ANALYTICS)
  // =========================================================================

  /**
   * Lấy dữ liệu tổng hợp cho trang Tổng quan (Dashboard Overview)
   */
  async getOverview(range: string = '7', userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const [totalProducts, totalOrders, rawRevenue, recentOrdersData, topOrderItems] =
      await Promise.all([
        this.prisma.product.count({
          where: { shopId: shop.id, deletedAt: null },
        }),
        this.prisma.sellerOrder.count({
          where: { shopId: shop.id },
        }),
        this.prisma.sellerOrder.aggregate({
          where: { shopId: shop.id, status: { not: 'CANCELLED' } },
          _sum: { total: true },
        }),
        this.prisma.sellerOrder.findMany({
          where: { shopId: shop.id },
          take: 4,
          orderBy: { id: 'desc' },
          include: {
            order: {
              include: { user: true },
            },
          },
        }),
        this.prisma.orderItem.groupBy({
          by: ['productId', 'productName'],
          where: { shopId: shop.id },
          _sum: { quantity: true, lineTotal: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 3,
        }),
      ]);

    const revenueNum = Number(rawRevenue._sum.total || 0);
    const ordersNum = totalOrders;
    const productsNum = totalProducts;

    // 3 thẻ chỉ số KPI chính (Bỏ thẻ đánh giá theo yêu cầu)
    const metrics = [
      {
        id: 'revenue',
        title: 'Doanh thu',
        value: `${revenueNum.toLocaleString('vi-VN')}đ`,
        changePercent: '0%',
        isPositive: true,
        type: 'revenue',
        sparklineData: [],
      },
      {
        id: 'orders',
        title: 'Đơn hàng',
        value: ordersNum.toString(),
        changePercent: '0%',
        isPositive: true,
        type: 'orders',
        sparklineData: [],
      },
      {
        id: 'products',
        title: 'Sản phẩm',
        value: productsNum.toString(),
        changePercent: '0%',
        isPositive: true,
        type: 'products',
        sparklineData: [],
      },
    ];

    // Format top products (Cách B: nếu chưa có đơn, lấy tối đa 3 sản phẩm của shop với số lượng bán = 0)
    let topProducts: any[] = [];
    if (topOrderItems.length > 0) {
      topProducts = await Promise.all(
        topOrderItems.map(async (item, idx) => {
          const prod = await this.prisma.product.findUnique({
            where: { id: item.productId },
            include: { images: { take: 1 } },
          });
          const soldCount = item._sum.quantity || 0;
          const rev = Number(item._sum.lineTotal || 0);
          const revText =
            rev >= 1000000
              ? `+${(rev / 1000000).toFixed(1)}tr đ`
              : `+${rev.toLocaleString('vi-VN')}đ`;
          return {
            id: prod?.publicId || `prod-${idx}`,
            rank: idx + 1,
            name: item.productName || prod?.name || 'Sản phẩm',
            image:
              prod?.images?.[0]?.storageKey ||
              'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80',
            soldCount,
            revenueText: revText,
          };
        }),
      );
    } else {
      const shopProds = await this.prisma.product.findMany({
        where: { shopId: shop.id, deletedAt: null },
        take: 3,
        orderBy: { id: 'desc' },
        include: { images: { take: 1 } },
      });
      topProducts = shopProds.map((p, idx) => ({
        id: p.publicId,
        rank: idx + 1,
        name: p.name,
        image:
          p.images?.[0]?.storageKey ||
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80',
        soldCount: 0,
        revenueText: '0đ',
      }));
    }

    // Format recent orders (Chỉ lấy đơn thật từ DB, không mock)
    const recentOrders = recentOrdersData.map((so) => {
      let statusLabel = 'Đang xử lý';
      let statusColor: 'amber' | 'blue' | 'green' | 'teal' = 'amber';
      if (so.status === 'SHIPPED') {
        statusLabel = 'Đang giao';
        statusColor = 'blue';
      } else if (so.status === 'DELIVERED') {
        statusLabel = 'Đã giao';
        statusColor = 'green';
      }

      const parent = so.order;
      const addr = parent?.shippingAddress as any;
      const customerName =
        parent?.user?.fullName || addr?.recipientName || 'Khách hàng';

      return {
        id: so.publicId,
        orderNumber: parent?.orderNumber || `#ORD-${so.publicId.slice(0, 8)}`,
        customerName,
        totalAmount: Number(so.total),
        status: so.status as any,
        statusLabel,
        statusColor,
        createdAt: new Date(parent?.placedAt || so.id).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    // Biểu đồ doanh thu thực tế theo khoảng thời gian
    const numDays = range === '90' ? 90 : range === '30' ? 30 : 7;
    const step = numDays === 7 ? 1 : Math.max(1, Math.floor(numDays / 6));
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - numDays);

    const periodOrders = await this.prisma.sellerOrder.findMany({
      where: {
        shopId: shop.id,
        status: { not: 'CANCELLED' },
        order: { placedAt: { gte: startDate } },
      },
      select: {
        total: true,
        order: {
          select: {
            placedAt: true,
          },
        },
      },
    });

    const revenuePoints: Array<{ date: string; value: number; formattedValue: string }> = [];
    for (let i = numDays; i >= 0; i -= step) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

      const dayTotal = periodOrders
        .filter((o) => {
          const od = new Date(o.order.placedAt);
          return (
            od.getDate() === d.getDate() &&
            od.getMonth() === d.getMonth() &&
            od.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, o) => sum + Number(o.total), 0);

      revenuePoints.push({
        date: dateKey,
        value: Number((dayTotal / 1000000).toFixed(2)),
        formattedValue: `${dayTotal.toLocaleString('vi-VN')}đ`,
      });
      if (revenuePoints.length >= 7) break;
    }

    return {
      metrics,
      revenuePoints,
      topProducts,
      recentOrders,
    };
  }

  /**
   * Lấy dữ liệu chi tiết cho trang Thống kê & Phân tích Doanh thu (Seller Analytics)
   */
  async getAnalytics(query: SellerAnalyticsQueryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const range = query.range || '30';

    const [totalOrders, rawRevenue, itemsSoldAgg] = await Promise.all([
      this.prisma.sellerOrder.count({
        where: { shopId: shop.id },
      }),
      this.prisma.sellerOrder.aggregate({
        where: { shopId: shop.id, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.orderItem.aggregate({
        where: { shopId: shop.id },
        _sum: { quantity: true },
      }),
    ]);

    const totalRevNum = Number(rawRevenue._sum.total || 0);
    const totalOrdersNum = totalOrders;
    const itemsSoldNum = itemsSoldAgg._sum.quantity || 0;

    // 3 chỉ số KPI chính (Bỏ thẻ đánh giá theo yêu cầu)
    const kpi = {
      totalRevenue: totalRevNum,
      totalRevenueFormatted: `${totalRevNum.toLocaleString('vi-VN')}đ`,
      totalOrders: totalOrdersNum,
      itemsSold: itemsSoldNum,
    };

    // Tạo các mốc thời gian thực tế
    const numDays = range === '90' || range === 'year' ? 90 : range === '7' ? 7 : 30;
    const step = numDays === 7 ? 1 : Math.max(1, Math.floor(numDays / 6));
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - numDays);

    const periodOrders = await this.prisma.sellerOrder.findMany({
      where: {
        shopId: shop.id,
        status: { not: 'CANCELLED' },
        order: { placedAt: { gte: startDate } },
      },
      select: {
        total: true,
        order: {
          select: {
            placedAt: true,
          },
        },
      },
    });

    const rawPoints: Array<{ date: string; amount: number; label: string }> = [];
    for (let i = numDays; i >= 0; i -= step) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

      const dayTotal = periodOrders
        .filter((o) => {
          const od = new Date(o.order.placedAt);
          return (
            od.getDate() === d.getDate() &&
            od.getMonth() === d.getMonth() &&
            od.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, o) => sum + Number(o.total), 0);

      rawPoints.push({
        date: dateKey,
        amount: Number((dayTotal / 1000000).toFixed(2)),
        label: `${dayTotal.toLocaleString('vi-VN')}đ`,
      });
      if (rawPoints.length >= 8) break;
    }

    const maxAmount = Math.max(...rawPoints.map((p) => p.amount), 1);
    const revenueChart = rawPoints.map((p, idx) => {
      const x = Math.round((idx / Math.max(1, rawPoints.length - 1)) * 96) + 2;
      const y = p.amount === 0 ? 180 : Math.round(180 - (p.amount / maxAmount) * 140);
      return {
        date: p.date,
        amount: p.amount,
        label: p.label,
        x,
        y,
      };
    });

    // Top sản phẩm (Cách B: thực tế hoặc top 3 sản phẩm của shop)
    const topOrderItems = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { shopId: shop.id },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    });

    let topProducts: any[] = [];
    if (topOrderItems.length > 0) {
      topProducts = await Promise.all(
        topOrderItems.map(async (item, idx) => {
          const prod = await this.prisma.product.findUnique({
            where: { id: item.productId },
            include: { images: { take: 1 } },
          });
          const soldCount = item._sum.quantity || 0;
          const rev = Number(item._sum.lineTotal || 0);
          const revText =
            rev >= 1000000
              ? `+${(rev / 1000000).toFixed(1)}tr đ`
              : `+${rev.toLocaleString('vi-VN')}đ`;
          const rankBgs = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700', 'bg-orange-100 text-orange-700'];
          return {
            rank: idx + 1,
            name: item.productName || prod?.name || 'Sản phẩm',
            soldCount,
            revenue: revText,
            image:
              prod?.images?.[0]?.storageKey ||
              'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=150&auto=format&fit=crop&q=80',
            rankBg: rankBgs[idx] || 'bg-gray-100 text-gray-700',
          };
        }),
      );
    } else {
      const shopProds = await this.prisma.product.findMany({
        where: { shopId: shop.id, deletedAt: null },
        take: 3,
        orderBy: { id: 'desc' },
        include: { images: { take: 1 } },
      });
      const rankBgs = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-700', 'bg-orange-100 text-orange-700'];
      topProducts = shopProds.map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        soldCount: 0,
        revenue: '0đ',
        image:
          p.images?.[0]?.storageKey ||
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=150&auto=format&fit=crop&q=80',
        rankBg: rankBgs[idx] || 'bg-gray-100 text-gray-700',
      }));
    }

    // Tỷ lệ phương thức thanh toán thực tế
    const ordersWithPayment = await this.prisma.sellerOrder.findMany({
      where: { shopId: shop.id, status: { not: 'CANCELLED' } },
      include: {
        order: {
          include: { payments: true },
        },
      },
    });

    let paymentBreakdown: Array<{ method: string; label: string; percent: number; amount: string }> = [];
    if (ordersWithPayment.length > 0 && totalRevNum > 0) {
      let stripeTotal = 0;
      let codTotal = 0;
      for (const so of ordersWithPayment) {
        const hasStripe = so.order?.payments?.some((p) => p.provider === 'STRIPE');
        if (hasStripe) {
          stripeTotal += Number(so.total);
        } else {
          codTotal += Number(so.total);
        }
      }
      const stripePct = Math.round((stripeTotal / totalRevNum) * 100);
      const codPct = 100 - stripePct;
      paymentBreakdown = [
        { method: 'STRIPE', label: 'Thanh toán trực tuyến (Stripe)', percent: stripePct, amount: `${stripeTotal.toLocaleString('vi-VN')}đ` },
        { method: 'COD', label: 'Thanh toán khi nhận hàng (COD)', percent: codPct, amount: `${codTotal.toLocaleString('vi-VN')}đ` },
      ];
    } else {
      paymentBreakdown = [];
    }

    return {
      kpi,
      revenueChart,
      topProducts,
      paymentBreakdown,
    };
  }

  // =========================================================================
  // GIAI ĐOẠN 4: QUẢN LÝ VOUCHER & MÃ GIẢM GIÁ CỦA SHOP
  // =========================================================================

  /**
   * Lấy danh sách voucher của Shop (phân trang, tìm kiếm, lọc trạng thái và thống kê)
   */
  async getVouchers(query: SellerVoucherQueryDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const now = new Date();

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const baseWhere: Prisma.VoucherWhereInput = {
      shopId: shop.id,
      scope: 'SHOP',
    };

    if (query.search?.trim()) {
      const s = query.search.trim();
      baseWhere.OR = [
        { code: { contains: s } },
        { name: { contains: s } },
      ];
    }

    const where: Prisma.VoucherWhereInput = { ...baseWhere };

    if (query.status === 'ACTIVE') {
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (query.status === 'UPCOMING') {
      where.isActive = true;
      where.startDate = { gt: now };
    } else if (query.status === 'EXPIRED') {
      where.endDate = { lt: now };
    } else if (query.status === 'DISABLED') {
      where.isActive = false;
    }

    const [allVouchers, totalItems, items] = await Promise.all([
      this.prisma.voucher.findMany({
        where: { shopId: shop.id, scope: 'SHOP' },
        select: { id: true, isActive: true, startDate: true, endDate: true, usedCount: true },
      }),
      this.prisma.voucher.count({ where }),
      this.prisma.voucher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    let activeCount = 0;
    let upcomingCount = 0;
    let expiredCount = 0;
    let disabledCount = 0;
    let totalUsages = 0;

    for (const v of allVouchers) {
      totalUsages += v.usedCount;
      if (!v.isActive) {
        disabledCount++;
      } else if (v.endDate < now) {
        expiredCount++;
      } else if (v.startDate > now) {
        upcomingCount++;
      } else {
        activeCount++;
      }
    }

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: items.map(formatVoucherResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
      stats: {
        total: allVouchers.length,
        active: activeCount,
        upcoming: upcomingCount,
        expired: expiredCount,
        disabled: disabledCount,
        totalUsages,
      },
    };
  }

  /**
   * Tạo mã voucher mới cho Shop
   */
  async createVoucher(dto: CreateSellerVoucherDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);
    const cleanCode = dto.code.trim().toUpperCase();

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ.');
    }

    if (start >= end) {
      throw new BadRequestException('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
    }

    if (dto.type === 'PERCENTAGE') {
      if (dto.discountValue < 1 || dto.discountValue > 100) {
        throw new BadRequestException('Tỷ lệ phần trăm giảm giá phải từ 1% đến 100%.');
      }
    } else if (dto.type === 'FIXED_AMOUNT') {
      if (dto.discountValue < 1000) {
        throw new BadRequestException('Số tiền giảm cố định tối thiểu là 1.000 VNĐ.');
      }
    }

    // Kiểm tra trùng mã code trên toàn hệ thống
    const existing = await this.prisma.voucher.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      throw new ConflictException(`Mã voucher "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác.`);
    }

    const voucher = await this.prisma.voucher.create({
      data: {
        publicId: ulid(),
        code: cleanCode,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        scope: 'SHOP',
        shopId: shop.id,
        type: dto.type,
        discountValue: BigInt(dto.discountValue),
        maxDiscountAmount: dto.maxDiscountAmount ? BigInt(dto.maxDiscountAmount) : null,
        minOrderValue: BigInt(dto.minOrderValue || 0),
        usageLimit: dto.usageLimit || 100,
        usagePerUser: dto.usagePerUser || 1,
        startDate: start,
        endDate: end,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    return {
      success: true,
      message: 'Tạo mã voucher cho Shop thành công!',
      voucher: formatVoucherResponse(voucher),
    };
  }

  /**
   * Cập nhật thông tin voucher của Shop
   */
  async updateVoucher(publicId: string, dto: UpdateSellerVoucherDto, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const voucher = await this.prisma.voucher.findFirst({
      where: { publicId, shopId: shop.id },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher này trong cửa hàng của bạn.');
    }

    const updateData: Prisma.VoucherUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.description !== undefined) updateData.description = dto.description?.trim() || null;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.discountValue !== undefined) updateData.discountValue = BigInt(dto.discountValue);
    if (dto.maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = dto.maxDiscountAmount ? BigInt(dto.maxDiscountAmount) : null;
    }
    if (dto.minOrderValue !== undefined) updateData.minOrderValue = BigInt(dto.minOrderValue);
    if (dto.usageLimit !== undefined) updateData.usageLimit = dto.usageLimit;
    if (dto.usagePerUser !== undefined) updateData.usagePerUser = dto.usagePerUser;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    if (dto.code !== undefined) {
      const cleanCode = dto.code.trim().toUpperCase();
      if (cleanCode !== voucher.code) {
        const existing = await this.prisma.voucher.findUnique({
          where: { code: cleanCode },
        });
        if (existing) {
          throw new ConflictException(`Mã voucher "${cleanCode}" đã được sử dụng.`);
        }
        updateData.code = cleanCode;
      }
    }

    const updated = await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Cập nhật voucher thành công!',
      voucher: formatVoucherResponse(updated),
    };
  }

  /**
   * Bật / Tắt trạng thái hoạt động của voucher
   */
  async toggleVoucherStatus(publicId: string, isActive: boolean, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const voucher = await this.prisma.voucher.findFirst({
      where: { publicId, shopId: shop.id },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher trong cửa hàng của bạn.');
    }

    const updated = await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: { isActive },
    });

    return {
      success: true,
      message: isActive ? 'Đã kích hoạt voucher.' : 'Đã tạm dừng voucher.',
      voucher: formatVoucherResponse(updated),
    };
  }

  /**
   * Xóa voucher của Shop
   */
  async deleteVoucher(publicId: string, userPublicId: string) {
    const shop = await this.getOrCreateUserShop(userPublicId);

    const voucher = await this.prisma.voucher.findFirst({
      where: { publicId, shopId: shop.id },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher trong cửa hàng của bạn.');
    }

    // Nếu voucher đã có khách hàng sử dụng -> không được xóa vật lý để bảo toàn lịch sử đơn hàng
    if (voucher.usedCount > 0) {
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: { isActive: false },
      });
      return {
        success: true,
        message: 'Voucher này đã phát sinh đơn hàng nên được chuyển sang trạng thái Tạm dừng thay vì xóa.',
        isDeactivated: true,
      };
    }

    await this.prisma.voucher.delete({
      where: { id: voucher.id },
    });

    return {
      success: true,
      message: 'Xóa voucher thành công!',
    };
  }
}
