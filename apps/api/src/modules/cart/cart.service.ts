import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SelectAllCartDto,
} from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy thông tin người dùng theo publicId
   */
  private async getUser(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng.');
    }
    return user;
  }

  /**
   * Lấy hoặc tự động tạo giỏ hàng cho người dùng
   */
  private async getOrCreateCart(userId: bigint) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }
    return cart;
  }

  /**
   * Tìm kiếm biến thể sản phẩm theo variantId (publicId hoặc id numeric) hoặc slug sản phẩm.
   * CHỈ dùng cho addToCart() và enrich khi thêm mới món hàng: yêu cầu status ACTIVE.
   */
  private async resolveVariant(variantIdentifier?: string, productSlug?: string) {
    let variant: any = null;

    if (variantIdentifier) {
      const isNumeric = /^\d+$/.test(variantIdentifier);
      const where: any = isNumeric
        ? { OR: [{ id: BigInt(variantIdentifier) }, { publicId: variantIdentifier }] }
        : { publicId: variantIdentifier };

      variant = await this.prisma.productVariant.findFirst({
        where: {
          ...where,
          status: 'ACTIVE',
        },
        include: {
          inventory: true,
          product: {
            include: {
              shop: true,
              images: { orderBy: { position: 'asc' } },
            },
          },
        },
      });
    }

    if (!variant && productSlug) {
      const product = await this.prisma.product.findFirst({
        where: { slug: productSlug, status: 'ACTIVE' },
        include: {
          shop: true,
          images: { orderBy: { position: 'asc' } },
          variants: {
            where: { status: 'ACTIVE' },
            include: { inventory: true },
            take: 1,
          },
        },
      });

      if (product && product.variants.length > 0) {
        variant = {
          ...product.variants[0],
          product: {
            ...product,
            variants: undefined,
          },
        };
      }
    }

    if (!variant) {
      throw new NotFoundException('Không tìm thấy biến thể sản phẩm hoặc sản phẩm đã ngừng bán.');
    }

    if (variant.product?.status !== 'ACTIVE') {
      throw new BadRequestException('Sản phẩm này hiện đang tạm ẩn hoặc ngừng kinh doanh.');
    }

    return variant;
  }

  /**
   * Format nhãn mô tả biến thể (VD: "Titan Tự Nhiên · 256GB")
   */
  private formatVariantLabel(optionValues: any): string {
    if (!optionValues || typeof optionValues !== 'object') {
      return 'Mặc định';
    }
    const values = Object.values(optionValues).map(String).filter(Boolean);
    return values.length > 0 ? values.join(' · ') : 'Mặc định';
  }

  /**
   * Lấy chi tiết giỏ hàng của người dùng (gom nhóm theo Shop)
   * - Đọc isSelected trực tiếp từ database
   * - Chỉ tính summary tổng tiền cho những món isSelected = true
   */
  async getCart(userPublicId: string) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { createdAt: 'desc' },
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

    const shopsMap = new Map<string, any>();

    let totalQuantity = 0;
    let selectedQuantity = 0;
    let selectedOriginalTotal = 0;
    let selectedFinalTotal = 0;
    let selectedItemsCount = 0;

    for (const item of items) {
      const v = item.variant;
      const p = v.product;
      const s = p.shop;

      const shopKey = s.slug || String(s.id);

      if (!shopsMap.has(shopKey)) {
        shopsMap.set(shopKey, {
          shopId: shopKey,
          shopPublicId: s.publicId,
          shopSlug: s.slug || s.publicId,
          shopName: s.name,
          shopLogo: s.logoKey,
          badge: 'Chính hãng',
          badgeType: 'official',
          deliveryEstimate: 'Giao dự kiến 2–3 ngày · Miễn phí vận chuyển',
          items: [],
        });
      }

      const primaryImage =
        p.images?.find((img: any) => img.isPrimary)?.storageKey ||
        p.images?.[0]?.storageKey ||
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80';

      const currentPrice = Number(v.price);
      const comparePrice = v.compareAtPrice ? Number(v.compareAtPrice) : null;
      const itemOriginalPrice = comparePrice && comparePrice > currentPrice ? comparePrice : currentPrice;

      const isInactive = v.status !== 'ACTIVE' || p.status !== 'ACTIVE';
      const onHand = v.inventory?.onHand ?? 0;
      const reserved = v.inventory?.reserved ?? 0;
      const availableStock = Math.max(0, onHand - reserved);

      const isSelected = item.isSelected;

      const cartItemFormatted = {
        id: v.publicId,
        variantId: v.publicId,
        numericVariantId: String(v.id),
        productId: p.publicId,
        productSlug: p.slug,
        name: p.name,
        variant: this.formatVariantLabel(v.optionValues),
        price: currentPrice,
        oldPrice: comparePrice,
        quantity: item.quantity,
        stock: availableStock,
        outOfStock: availableStock <= 0 || isInactive,
        isInactive,
        image: primaryImage,
        selected: isSelected, // Đọc trực tiếp từ DB
      };

      shopsMap.get(shopKey).items.push(cartItemFormatted);

      totalQuantity += item.quantity;

      // Chỉ tính tài chính cho các sản phẩm ĐƯỢC CHỌN (isSelected = true)
      if (isSelected && !isInactive && availableStock > 0) {
        selectedQuantity += item.quantity;
        selectedOriginalTotal += itemOriginalPrice * item.quantity;
        selectedFinalTotal += currentPrice * item.quantity;
        selectedItemsCount += 1;
      }
    }

    const shops = Array.from(shopsMap.values());
    const totalItems = items.length;
    const productDiscount = Math.max(0, selectedOriginalTotal - selectedFinalTotal);

    return {
      totalItems,
      totalQuantity,
      selectedCount: selectedItemsCount,
      selectedQuantity,
      shops,
      summary: {
        originalTotal: selectedOriginalTotal,
        finalTotal: selectedFinalTotal,
        productDiscount,
      },
    };
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * - Ngăn race-condition bằng prisma.cartItem.upsert với increment
   * - Kiểm tra tồn kho trước và CAP số lượng nếu vượt quá
   * - isSelected mặc định = true
   */
  async addToCart(userPublicId: string, dto: AddToCartDto) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);
    const variant = await this.resolveVariant(dto.variantId, dto.productSlug);

    const onHand = variant.inventory?.onHand ?? 0;
    const reserved = variant.inventory?.reserved ?? 0;
    const availableStock = Math.max(0, onHand - reserved);

    if (availableStock <= 0) {
      throw new BadRequestException('Sản phẩm này hiện tại đã hết hàng.');
    }

    const rawRequested = dto?.quantity ?? 1;
    if (!Number.isInteger(Number(rawRequested)) || Number(rawRequested) <= 0) {
      throw new BadRequestException('Số lượng sản phẩm phải là số nguyên dương lớn hơn 0.');
    }
    let requestedQty = Number(rawRequested);

    // Đọc số lượng hiện có trong giỏ hàng (nếu có)
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id,
        },
      },
    });

    const currentQty = existingItem?.quantity ?? 0;

    let isCapped = false;
    let cappedMessage: string | null = null;
    let cappedTo: number | null = null;

    if (currentQty + requestedQty > availableStock) {
      if (currentQty >= availableStock) {
        throw new BadRequestException(
          `Số lượng trong giỏ hàng đã đạt giới hạn tồn kho hiện có (${availableStock} sản phẩm).`,
        );
      }

      // Giới hạn số lượng tăng thêm vừa đủ chạm mốc tồn kho tối đa
      const allowedIncrement = availableStock - currentQty;
      isCapped = true;
      cappedTo = availableStock;
      cappedMessage = `Chỉ còn ${availableStock} sản phẩm, đã thêm tối đa.`;

      await this.prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
        update: {
          quantity: {
            increment: allowedIncrement,
          },
          isSelected: true,
        },
        create: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: allowedIncrement,
          isSelected: true,
        },
      });
    } else {
      // Upsert nguyên tử chống race condition (increment)
      await this.prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: variant.id,
          },
        },
        update: {
          quantity: {
            increment: requestedQty,
          },
          isSelected: true,
        },
        create: {
          cartId: cart.id,
          variantId: variant.id,
          quantity: requestedQty,
          isSelected: true,
        },
      });
    }

    const cartResponse = await this.getCart(userPublicId);

    if (isCapped) {
      // Đánh dấu capped vào đúng item trong danh sách shops
      for (const shop of cartResponse.shops) {
        const item = shop.items.find(
          (it: any) => it.variantId === variant.publicId || it.numericVariantId === String(variant.id),
        );
        if (item) {
          (item as any).capped = true;
          (item as any).cappedTo = cappedTo;
          (item as any).cappedMessage = cappedMessage;
          break;
        }
      }

      return {
        ...cartResponse,
        capped: true,
        cappedTo,
        cappedMessage,
      };
    }

    return cartResponse;
  }

  /**
   * Cập nhật số lượng của một biến thể trong giỏ hàng
   * - Tìm cartItem trực tiếp theo variant.publicId, KHÔNG qua resolveVariant (cho phép sửa/xóa khi variant INACTIVE)
   * - KHÔNG dùng upsert
   * - Nếu variant INACTIVE mà user cố tăng số lượng -> 400 "Sản phẩm đã ngừng bán."
   * - Nếu user giảm hoặc set quantity <= 0 -> cho phép
   */
  async updateItemQuantity(userPublicId: string, variantPublicId: string, dto: UpdateCartItemDto) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    const isNumeric = /^\d+$/.test(variantPublicId);
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variant: isNumeric
          ? { OR: [{ publicId: variantPublicId }, { id: BigInt(variantPublicId) }] }
          : { publicId: variantPublicId },
      },
      include: {
        variant: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng.');
    }

    const rawQty = dto?.quantity;
    if (rawQty === undefined || rawQty === null || !Number.isInteger(Number(rawQty))) {
      throw new BadRequestException('Số lượng sản phẩm không hợp lệ.');
    }

    const targetQuantity = Number(rawQty);

    // Giảm về 0 hoặc số âm -> Xóa món khỏi giỏ
    if (targetQuantity <= 0) {
      await this.prisma.cartItem.delete({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: cartItem.variantId,
          },
        },
      });
      return this.getCart(userPublicId);
    }

    // Nếu người dùng cố tăng số lượng
    if (targetQuantity > cartItem.quantity) {
      if (cartItem.variant.status !== 'ACTIVE') {
        throw new BadRequestException('Sản phẩm đã ngừng bán.');
      }

      // Kiểm tra tồn kho khả dụng
      const onHand = cartItem.variant.inventory?.onHand ?? 0;
      const reserved = cartItem.variant.inventory?.reserved ?? 0;
      const availableStock = Math.max(0, onHand - reserved);

      if (targetQuantity > availableStock) {
        throw new BadRequestException(
          `Số lượng yêu cầu (${targetQuantity}) vượt quá tồn kho khả dụng (${availableStock} sản phẩm).`,
        );
      }
    }

    // Cập nhật số lượng (chỉ update, KHÔNG upsert)
    await this.prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: cartItem.variantId,
        },
      },
      data: {
        quantity: targetQuantity,
      },
    });

    return this.getCart(userPublicId);
  }

  /**
   * Chọn hoặc bỏ chọn một sản phẩm trong giỏ hàng (lưu vào database)
   */
  async toggleItemSelection(userPublicId: string, variantPublicId: string, selected: boolean) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    const isNumeric = /^\d+$/.test(variantPublicId);
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variant: isNumeric
          ? { OR: [{ publicId: variantPublicId }, { id: BigInt(variantPublicId) }] }
          : { publicId: variantPublicId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng.');
    }

    await this.prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: cartItem.variantId,
        },
      },
      data: {
        isSelected: Boolean(selected),
      },
    });

    return this.getCart(userPublicId);
  }

  /**
   * Chọn hoặc bỏ chọn tất cả sản phẩm (hoặc theo từng Shop)
   */
  async toggleSelectAll(userPublicId: string, dto: SelectAllCartDto) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    const targetSelected = Boolean(dto.selected);

    if (dto.shopId) {
      const isNumericShop = /^\d+$/.test(dto.shopId);
      const shopWhere = isNumericShop
        ? { OR: [{ publicId: dto.shopId }, { id: BigInt(dto.shopId) }, { slug: dto.shopId }] }
        : { OR: [{ publicId: dto.shopId }, { slug: dto.shopId }] };

      await this.prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          variant: {
            product: {
              shop: shopWhere,
            },
          },
        },
        data: {
          isSelected: targetSelected,
        },
      });
    } else {
      await this.prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
        },
        data: {
          isSelected: targetSelected,
        },
      });
    }

    return this.getCart(userPublicId);
  }

  /**
   * Xóa một biến thể khỏi giỏ hàng
   * - Tìm và xóa cartItem trực tiếp theo (cartId, variant.publicId) — KHÔNG qua resolveVariant
   * - Xóa được ngay cả khi variant/product đã bị INACTIVE
   */
  async removeItem(userPublicId: string, variantPublicId: string) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    const isNumeric = /^\d+$/.test(variantPublicId);
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variant: isNumeric
          ? { OR: [{ publicId: variantPublicId }, { id: BigInt(variantPublicId) }] }
          : { publicId: variantPublicId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng.');
    }

    await this.prisma.cartItem.delete({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: cartItem.variantId,
        },
      },
    });

    return this.getCart(userPublicId);
  }

  /**
   * Xóa toàn bộ sản phẩm khỏi giỏ hàng
   */
  async clearCart(userPublicId: string) {
    const user = await this.getUser(userPublicId);
    const cart = await this.getOrCreateCart(user.id);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      success: true,
      message: 'Đã xóa toàn bộ sản phẩm khỏi giỏ hàng.',
    };
  }
}
