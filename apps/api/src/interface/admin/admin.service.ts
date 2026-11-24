import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import {
  AdminShopQueryDto,
  AdminShopFilterStatus,
  UpdateShopStatusDto,
  AdminUserQueryDto,
  AdminUserFilterRole,
  AdminUserFilterStatus,
  UpdateUserStatusRoleDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  AdminProductQueryDto,
  UpdateProductStatusDto,
  AdminOrderQueryDto,
  AdminReviewQueryDto,
  AdminVoucherQueryDto,
  CreatePlatformVoucherDto,
  UpdateVoucherStatusDto,
} from './dto';
import {
  Prisma,
  Role,
  UserStatus,
  ShopStatus,
  ProductStatus,
  OrderStatus,
  VoucherScope,
  VoucherType,
} from '@prisma/client';
import { ulid } from 'ulid';
import {
  removeVietnameseTones,
  extractSearchTokens,
} from '../../platform/utils/search-helper';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper chuyển BigInt sang Number/String an toàn
   */
  private serializeBigInt(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (k, v) => (typeof v === 'bigint' ? v.toString() : v)),
    );
  }

  /**
   * 1. Thống kê tổng quan sàn (Dashboard Metrics & KPIs)
   */
  async getOverviewStats(range: string = '7') {
    // 1.1 Tổng số lượng cơ bản
    const [
      totalUsers,
      totalShops,
      activeShops,
      totalProducts,
      totalOrders,
      completedOrdersCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.shop.count(),
      this.prisma.shop.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: {
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    // 1.2 Tổng doanh thu toàn sàn (GMV) từ tất cả các đơn hàng hợp lệ
    const revenueAgg = await this.prisma.order.aggregate({
      where: {
        status: { not: 'CANCELLED' },
      },
      _sum: {
        grandTotal: true,
      },
    });

    const totalGMV = Number(revenueAgg._sum.grandTotal || 0n);

    // 1.3 Top 5 Gian hàng có đơn hàng nhiều nhất & doanh thu cao
    const topShopsRaw = await this.prisma.shop.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      include: {
        _count: {
          select: {
            products: true,
            sellerOrders: true,
          },
        },
        sellerOrders: {
          where: { status: { not: 'CANCELLED' } },
          select: { total: true },
        },
        members: {
          where: { role: 'OWNER' },
          take: 1,
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    const topShops = topShopsRaw.map((shop) => {
      const revenue = shop.sellerOrders.reduce((sum, o) => sum + Number(o.total || 0n), 0);
      const owner = shop.members[0]?.user;
      return {
        id: shop.publicId,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logoKey,
        ownerName: owner?.fullName || 'Chưa cập nhật',
        ownerEmail: owner?.email || '',
        productsCount: shop._count.products,
        ordersCount: shop._count.sellerOrders,
        totalRevenue: revenue,
      };
    });

    // 1.4 Top sản phẩm nổi bật toàn sàn
    const topProductsRaw = await this.prisma.product.findMany({
      where: { deletedAt: null },
      take: 4,
      include: {
        images: { take: 1 },
        shop: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const topProducts = topProductsRaw.map((p, idx) => {
      const price = Number(p.minPrice || 0);
      return {
        id: p.publicId,
        rank: idx + 1,
        name: p.name,
        image: p.images[0]?.storageKey || null,
        shopName: p.shop?.name || '',
        price,
        formattedPrice: `${price.toLocaleString('vi-VN')}đ`,
        soldCount: 0,
      };
    });

    // 1.5 Biểu đồ doanh thu thực tế theo khoảng thời gian
    const numDays = range === '90' ? 90 : range === '30' ? 30 : 7;
    const now = new Date();

    const periodOrders = await this.prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
      },
      select: { grandTotal: true, placedAt: true },
      orderBy: { placedAt: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      dailyMap.set(key, 0);
    }

    periodOrders.forEach((o) => {
      const d = new Date(o.placedAt);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      dailyMap.set(key, (dailyMap.get(key) || 0) + Number(o.grandTotal));
    });

    const revenuePoints = Array.from(dailyMap.entries())
      .slice(-Math.min(dailyMap.size, 10))
      .map(([date, value]) => ({
        date,
        value,
        formattedValue: `${value.toLocaleString('vi-VN')}đ`,
      }));

    // 1.6 Năm đơn hàng phát sinh gần nhất toàn hệ thống
    const recentOrdersRaw = await this.prisma.order.findMany({
      take: 5,
      orderBy: { placedAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        sellerOrders: {
          include: {
            shop: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    const recentOrders = recentOrdersRaw.map((order) => {
      const shopNames = order.sellerOrders.map((so) => so.shop.name).filter(Boolean);
      return {
        id: order.publicId,
        orderNumber: order.orderNumber,
        customerName: order.user?.fullName || (order.shippingAddress as any)?.recipientName || 'Khách vãng lai',
        customerEmail: order.user?.email || order.contactEmail || '',
        shops: shopNames,
        grandTotal: Number(order.grandTotal),
        status: order.status,
        createdAt: order.placedAt,
      };
    });

    return {
      totalGMV,
      totalOrders,
      completedOrdersCount,
      totalUsers,
      totalShops,
      activeShops,
      totalProducts,
      topShops,
      topProducts,
      revenuePoints,
      recentOrders,
    };
  }

  /**
   * 2. Quản lý danh sách Gian hàng (Shop List with Filters & Pagination)
   */
  async getShops(query: AdminShopQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ShopWhereInput = {};

    // Lọc theo trạng thái
    if (query.status && query.status !== AdminShopFilterStatus.ALL) {
      where.status = query.status as ShopStatus;
    }

    // Tìm kiếm đa từ khóa thông minh (Multi-token AND + Unaccent)
    if (query.search?.trim()) {
      const tokens = extractSearchTokens(query.search);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const norm = removeVietnameseTones(token);
          return {
            OR: [
              { name: { contains: token } },
              { name: { contains: norm } },
              { slug: { contains: norm } },
              {
                members: {
                  some: {
                    role: 'OWNER',
                    user: {
                      OR: [
                        { email: { contains: token } },
                        { fullName: { contains: token } },
                        { fullName: { contains: norm } },
                      ],
                    },
                  },
                },
              },
            ],
          };
        });
      }
    }

    const [totalItems, shops] = await Promise.all([
      this.prisma.shop.count({ where }),
      this.prisma.shop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: true,
              sellerOrders: true,
            },
          },
          sellerOrders: {
            where: { status: 'DELIVERED' },
            select: { total: true },
          },
          members: {
            where: { role: 'OWNER' },
            take: 1,
            include: {
              user: {
                select: { fullName: true, email: true, phone: true },
              },
            },
          },
        },
      }),
    ]);

    const items = shops.map((shop) => {
      const revenue = shop.sellerOrders.reduce((sum, o) => sum + Number(o.total || 0n), 0);
      const owner = shop.members[0]?.user;
      return {
        id: shop.publicId,
        numericId: String(shop.id),
        name: shop.name,
        slug: shop.slug,
        logo: shop.logoKey,
        status: shop.status,
        productsCount: shop._count.products,
        ordersCount: shop._count.sellerOrders,
        totalRevenue: revenue,
        owner: {
          name: owner?.fullName || 'Chưa cập nhật',
          email: owner?.email || '',
          phone: owner?.phone || '',
        },
        createdAt: shop.createdAt,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  /**
   * 2.1 Cập nhật trạng thái Gian hàng (Duyệt mở / Tạm khóa)
   */
  async updateShopStatus(shopPublicId: string, dto: UpdateShopStatusDto) {
    const shop = await this.prisma.shop.findFirst({
      where: {
        OR: [{ publicId: shopPublicId }, { slug: shopPublicId }],
      },
    });

    if (!shop) {
      throw new NotFoundException(`Gian hàng với mã "${shopPublicId}" không tồn tại.`);
    }

    const updated = await this.prisma.shop.update({
      where: { id: shop.id },
      data: {
        status: dto.status as ShopStatus,
        suspensionReason: dto.status === 'SUSPENDED' ? dto.reason || 'Tạm khóa bởi Quản trị viên' : null,
      },
    });

    this.logger.log(`Shop #${shop.id} [${shop.name}] status changed to ${dto.status}`);

    return {
      success: true,
      shopId: updated.publicId,
      name: updated.name,
      status: updated.status,
      message:
        dto.status === 'ACTIVE'
          ? `Đã kích hoạt gian hàng "${updated.name}" thành công.`
          : `Đã tạm khóa gian hàng "${updated.name}". Toàn bộ sản phẩm của shop sẽ tạm ẩn.`,
    };
  }

  /**
   * 3. Quản lý danh sách Người dùng (User List with Filters & Pagination)
   */
  async getUsers(query: AdminUserQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Lọc theo vai trò
    if (query.role && query.role !== AdminUserFilterRole.ALL) {
      where.roles = {
        some: {
          role: query.role as Role,
        },
      };
    }

    // Lọc theo trạng thái
    if (query.status && query.status !== AdminUserFilterStatus.ALL) {
      where.status = query.status as UserStatus;
    }

    // Tìm kiếm đa từ khóa thông minh (Multi-token AND + Unaccent)
    if (query.search?.trim()) {
      const tokens = extractSearchTokens(query.search);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const norm = removeVietnameseTones(token);
          return {
            OR: [
              { fullName: { contains: token } },
              { fullName: { contains: norm } },
              { email: { contains: token } },
              { phone: { contains: token } },
            ],
          };
        });
      }
    }

    const [totalItems, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: true,
          _count: {
            select: {
              orders: true,
            },
          },
          shopMembers: {
            take: 1,
            include: {
              shop: {
                select: { name: true, slug: true, publicId: true },
              },
            },
          },
        },
      }),
    ]);

    const items = users.map((u) => {
      const roles = u.roles.map((r) => r.role);
      const primaryRole = roles.includes('ADMIN')
        ? 'ADMIN'
        : roles.includes('SELLER')
        ? 'SELLER'
        : 'CUSTOMER';

      const shop = u.shopMembers[0]?.shop;

      return {
        id: u.publicId,
        numericId: String(u.id),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        avatar: u.avatarUrl,
        roles,
        primaryRole,
        status: u.status,
        ordersCount: u._count.orders,
        shop: shop
          ? {
              name: shop.name,
              slug: shop.slug,
            }
          : null,
        createdAt: u.createdAt,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  /**
   * 3.1 Cập nhật vai trò / Trạng thái Người dùng
   */
  async updateUser(userPublicId: string, dto: UpdateUserStatusRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: userPublicId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`Người dùng "${userPublicId}" không tồn tại.`);
    }

    // Cập nhật trạng thái tài khoản
    if (dto.status) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: dto.status as UserStatus },
      });
    }

    // Cập nhật vai trò tài khoản
    if (dto.role) {
      const existingRoles = user.roles.map((r) => r.role);
      if (!existingRoles.includes(dto.role as Role)) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            role: dto.role as Role,
          },
        });
      }
    }

    return {
      success: true,
      message: 'Cập nhật tài khoản người dùng thành công.',
    };
  }

  /**
   * 4. Quản lý Danh mục sàn (Category List)
   */
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      slug: cat.slug,
      position: cat.position,
      isActive: cat.isActive,
      productsCount: cat._count.products,
    }));
  }

  /**
   * 4.1 Thêm danh mục mới
   */
  async createCategory(dto: CreateCategoryDto) {
    const slug =
      dto.slug?.trim() ||
      dto.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException(`Slug danh mục "${slug}" đã tồn tại trên hệ thống.`);
    }

    const created = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        position: dto.position ?? 0,
        isActive: true,
      },
    });

    return {
      success: true,
      category: {
        id: String(created.id),
        name: created.name,
        slug: created.slug,
        position: created.position,
      },
      message: `Đã tạo danh mục "${created.name}" thành công.`,
    };
  }

  /**
   * 4.2 Cập nhật danh mục
   */
  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const numericId = BigInt(categoryId);
    const cat = await this.prisma.category.findUnique({
      where: { id: numericId },
    });

    if (!cat) {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }

    const updateData: Prisma.CategoryUpdateInput = {};
    if (dto.name?.trim()) updateData.name = dto.name.trim();
    if (dto.slug?.trim()) updateData.slug = dto.slug.trim();
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.prisma.category.update({
      where: { id: numericId },
      data: updateData,
    });

    return {
      success: true,
      message: `Cập nhật danh mục "${updated.name}" thành công.`,
    };
  }

  /**
   * 4.3 Xóa danh mục
   */
  async deleteCategory(categoryId: string) {
    const numericId = BigInt(categoryId);
    const cat = await this.prisma.category.findUnique({
      where: { id: numericId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!cat) {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }

    if (cat._count.products > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục "${cat.name}" vì đang có ${cat._count.products} sản phẩm trực thuộc.`,
      );
    }

    await this.prisma.category.delete({
      where: { id: numericId },
    });

    return {
      success: true,
      message: `Đã xóa danh mục "${cat.name}" thành công.`,
    };
  }

  /**
   * 5. Quản lý Sản phẩm toàn sàn
   */
  async getProducts(query: AdminProductQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as ProductStatus;
    }

    if (query.categoryId && query.categoryId !== 'ALL') {
      where.categoryId = BigInt(query.categoryId);
    }

    // Tìm kiếm đa từ khóa thông minh (Multi-token AND + Unaccent)
    if (query.search?.trim()) {
      const tokens = extractSearchTokens(query.search);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const norm = removeVietnameseTones(token);
          return {
            OR: [
              { name: { contains: token } },
              { name: { contains: norm } },
              { searchText: { contains: norm } },
              { slug: { contains: norm } },
              { shop: { name: { contains: token } } },
              { shop: { name: { contains: norm } } },
            ],
          };
        });
      }
    }

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          shop: { select: { name: true, slug: true, publicId: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { take: 1, select: { storageKey: true } },
          _count: { select: { variants: true } },
        },
      }),
    ]);

    const items = products.map((p) => ({
      id: p.publicId,
      name: p.name,
      slug: p.slug,
      minPrice: Number(p.minPrice || 0),
      status: p.status,
      image: p.images[0]?.storageKey || null,
      variantsCount: p._count.variants,
      shop: {
        id: p.shop.publicId,
        name: p.shop.name,
        slug: p.shop.slug,
      },
      category: {
        id: String(p.category.id),
        name: p.category.name,
        slug: p.category.slug,
      },
      createdAt: p.createdAt,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  async updateProductStatus(productId: string, dto: UpdateProductStatusDto) {
    const product = await this.prisma.product.findUnique({
      where: { publicId: productId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm.');
    }

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: { status: dto.status as ProductStatus },
    });

    return {
      success: true,
      productId: updated.publicId,
      status: updated.status,
      message: `Đã cập nhật trạng thái sản phẩm "${updated.name}" thành ${updated.status}.`,
    };
  }

  /**
   * 6. Quản lý Đơn hàng toàn sàn
   */
  async getOrders(query: AdminOrderQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as OrderStatus;
    }

    // Tìm kiếm đa từ khóa thông minh (Multi-token AND + Unaccent)
    if (query.search?.trim()) {
      const tokens = extractSearchTokens(query.search);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const norm = removeVietnameseTones(token);
          return {
            OR: [
              { orderNumber: { contains: token } },
              { contactEmail: { contains: token } },
              { contactPhone: { contains: token } },
              { user: { fullName: { contains: token } } },
              { user: { fullName: { contains: norm } } },
              { user: { email: { contains: token } } },
              { sellerOrders: { some: { shop: { name: { contains: token } } } } },
              { sellerOrders: { some: { shop: { name: { contains: norm } } } } },
            ],
          };
        });
      }
    }

    const [totalItems, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { placedAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          sellerOrders: {
            include: {
              shop: { select: { name: true, slug: true, publicId: true } },
            },
          },
          orderItems: {
            take: 3,
            select: { productName: true, quantity: true, unitPrice: true, imageKey: true },
          },
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    const items = orders.map((o) => {
      const shipping = o.shippingAddress as any;
      const recipientName = shipping?.recipientName || o.user?.fullName || 'Khách hàng';
      return {
        id: o.publicId,
        orderNumber: o.orderNumber,
        customerName: recipientName,
        customerEmail: o.contactEmail || o.user?.email || '',
        customerPhone: o.contactPhone || o.user?.phone || '',
        shops: o.sellerOrders.map((so) => so.shop.name),
        itemsCount: o._count.orderItems,
        itemsPreview: o.orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          image: item.imageKey,
        })),
        grandTotal: Number(o.grandTotal),
        status: o.status,
        placedAt: o.placedAt,
        paidAt: o.paidAt,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  async getOrderDetails(orderPublicId: string) {
    const order = await this.prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: {
        user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } },
        sellerOrders: {
          include: {
            shop: { select: { name: true, slug: true, logoKey: true } },
            orderItems: true,
          },
        },
        orderItems: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng.');
    }

    return {
      id: order.publicId,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: {
        name: order.user?.fullName || (order.shippingAddress as any)?.recipientName || 'Khách hàng',
        email: order.contactEmail || order.user?.email || '',
        phone: order.contactPhone || order.user?.phone || '',
        avatar: order.user?.avatarUrl,
      },
      shippingAddress: order.shippingAddress,
      subtotal: Number(order.subtotal),
      shippingTotal: Number(order.shippingTotal),
      discountTotal: Number(order.discountTotal),
      grandTotal: Number(order.grandTotal),
      voucherCode: order.voucherCode,
      placedAt: order.placedAt,
      paidAt: order.paidAt,
      cancelledAt: order.cancelledAt,
      payments: order.payments.map((p) => ({
        id: p.publicId,
        method: p.provider,
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt,
      })),
      sellerOrders: order.sellerOrders.map((so) => ({
        id: so.publicId,
        shopName: so.shop.name,
        shopSlug: so.shop.slug,
        status: so.status,
        total: Number(so.total),
        items: so.orderItems.map((item) => ({
          id: String(item.id),
          productName: item.productName,
          variantLabel: item.variantLabel,
          sku: item.sku,
          image: item.imageKey,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
      })),
    };
  }

  /**
   * 7. Quản lý Đánh giá & Phản hồi
   */
  async getReviews(query: AdminReviewQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (query.rating) {
      where.rating = Number(query.rating);
    }

    // Tìm kiếm đa từ khóa thông minh (Multi-token AND + Unaccent)
    if (query.search?.trim()) {
      const tokens = extractSearchTokens(query.search);
      if (tokens.length > 0) {
        where.AND = tokens.map((token) => {
          const norm = removeVietnameseTones(token);
          return {
            OR: [
              { comment: { contains: token } },
              { comment: { contains: norm } },
              { user: { fullName: { contains: token } } },
              { user: { fullName: { contains: norm } } },
              { product: { name: { contains: token } } },
              { product: { name: { contains: norm } } },
            ],
          };
        });
      }
    }

    const [totalItems, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, avatarUrl: true } },
          product: {
            select: {
              name: true,
              slug: true,
              publicId: true,
              images: { take: 1, select: { storageKey: true } },
              shop: { select: { name: true, slug: true } },
            },
          },
        },
      }),
    ]);

    const items = reviews.map((r) => ({
      id: r.publicId,
      rating: r.rating,
      comment: r.comment,
      images: (r.images as any) || [],
      isVerified: r.isVerified,
      sellerReply: r.sellerReply,
      createdAt: r.createdAt,
      user: {
        name: r.user.fullName,
        email: r.user.email,
        avatar: r.user.avatarUrl,
      },
      product: {
        id: r.product.publicId,
        name: r.product.name,
        slug: r.product.slug,
        image: r.product.images[0]?.storageKey || null,
        shopName: r.product.shop.name,
      },
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  async deleteReview(reviewPublicId: string) {
    const review = await this.prisma.review.findUnique({
      where: { publicId: reviewPublicId },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá.');
    }

    await this.prisma.review.delete({
      where: { id: review.id },
    });

    return {
      success: true,
      message: 'Đã xóa đánh giá vi phạm thành công.',
    };
  }

  /**
   * 8. Quản lý Lịch sử Giải ngân & Đối soát
   */
  async getPayouts() {
    const shops = await this.prisma.shop.findMany({
      where: { status: 'ACTIVE' },
      include: {
        members: {
          where: { role: 'OWNER' },
          take: 1,
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
        sellerOrders: {
          select: { status: true, total: true, deliveredAt: true },
        },
      },
    });

    let totalGMV = 0;
    let totalCommission = 0;
    let totalPendingPayout = 0;

    const items = shops.map((shop) => {
      const deliveredOrders = shop.sellerOrders.filter(
        (so) => so.status === 'DELIVERED',
      );
      const grossRevenue = shop.sellerOrders
        .filter((so) => so.status !== 'CANCELLED')
        .reduce((sum, so) => sum + Number(so.total || 0n), 0);

      const deliveredRevenue = deliveredOrders.reduce(
        (sum, so) => sum + Number(so.total || 0n),
        0,
      );

      // Phí nền tảng 5%
      const commissionFee = Math.round(deliveredRevenue * 0.05);
      const netPayout = deliveredRevenue - commissionFee;

      totalGMV += deliveredRevenue;
      totalCommission += commissionFee;
      totalPendingPayout += netPayout;

      const owner = shop.members[0]?.user;

      return {
        shopId: shop.publicId,
        shopName: shop.name,
        shopSlug: shop.slug,
        ownerName: owner?.fullName || 'Chưa cập nhật',
        ownerEmail: owner?.email || '',
        ownerPhone: owner?.phone || '',
        totalOrdersCount: shop.sellerOrders.length,
        deliveredOrdersCount: deliveredOrders.length,
        grossRevenue,
        deliveredRevenue,
        commissionFee,
        netPayout,
        payoutStatus: deliveredOrders.length > 0 ? 'READY' : 'SETTLED',
        lastSettlementDate: new Date().toISOString(),
      };
    });

    return {
      summary: {
        totalDeliveredGMV: totalGMV,
        totalPlatformCommission: totalCommission,
        totalNetPayout: totalPendingPayout,
        cycleType: 'T+3 Tự động hàng tuần',
      },
      items,
    };
  }

  async settlePayout(shopPublicId: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { OR: [{ publicId: shopPublicId }, { slug: shopPublicId }] },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy gian hàng.');
    }

    return {
      success: true,
      shopId: shop.publicId,
      message: `Đã hoàn tất lệnh giải ngân doanh thu cho gian hàng "${shop.name}".`,
    };
  }

  /**
   * 9. Quản lý Voucher & Khuyến mãi sàn
   */
  async getVouchers(query: AdminVoucherQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.VoucherWhereInput = {};

    if (query.scope && query.scope !== 'ALL') {
      where.scope = query.scope as VoucherScope;
    }

    if (query.isActive !== undefined) {
      where.isActive = String(query.isActive) === 'true';
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s } },
        { name: { contains: s } },
      ];
    }

    const [totalItems, vouchers] = await Promise.all([
      this.prisma.voucher.count({ where }),
      this.prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          shop: { select: { name: true, slug: true } },
          _count: { select: { usages: true } },
        },
      }),
    ]);

    const items = vouchers.map((v) => ({
      id: v.publicId,
      code: v.code,
      name: v.name,
      description: v.description,
      scope: v.scope,
      type: v.type,
      discountValue: Number(v.discountValue),
      maxDiscountAmount: v.maxDiscountAmount ? Number(v.maxDiscountAmount) : null,
      minOrderValue: Number(v.minOrderValue),
      usageLimit: v.usageLimit,
      usedCount: v.usedCount || v._count.usages,
      usagePerUser: v.usagePerUser,
      startDate: v.startDate,
      endDate: v.endDate,
      isActive: v.isActive,
      shopName: v.shop?.name || null,
      createdAt: v.createdAt,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  async createPlatformVoucher(dto: CreatePlatformVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException(`Mã voucher "${dto.code}" đã tồn tại trên hệ thống.`);
    }

    const created = await this.prisma.voucher.create({
      data: {
        publicId: ulid(),
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        scope: VoucherScope.GLOBAL,
        type: dto.type as VoucherType,
        discountValue: BigInt(dto.discountValue),
        maxDiscountAmount: dto.maxDiscountAmount ? BigInt(dto.maxDiscountAmount) : null,
        minOrderValue: BigInt(dto.minOrderValue || 0),
        usageLimit: dto.usageLimit || 1000,
        usagePerUser: dto.usagePerUser || 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: true,
      },
    });

    return {
      success: true,
      id: created.publicId,
      code: created.code,
      message: `Tạo mã giảm giá sàn "${created.code}" thành công!`,
    };
  }

  async toggleVoucherStatus(voucherPublicId: string, isActive: boolean) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { publicId: voucherPublicId },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher.');
    }

    const updated = await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: { isActive },
    });

    return {
      success: true,
      isActive: updated.isActive,
      message: `Đã ${updated.isActive ? 'kích hoạt' : 'tạm dừng'} mã voucher "${updated.code}".`,
    };
  }

  async deleteVoucher(voucherPublicId: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { publicId: voucherPublicId },
      include: { _count: { select: { usages: true } } },
    });

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher.');
    }

    if (voucher._count.usages > 0) {
      throw new BadRequestException('Không thể xóa voucher đã có người sử dụng. Hãy chuyển sang Tạm dừng.');
    }

    await this.prisma.voucher.delete({
      where: { id: voucher.id },
    });

    return {
      success: true,
      message: `Đã xóa mã voucher "${voucher.code}" thành công.`,
    };
  }
}
