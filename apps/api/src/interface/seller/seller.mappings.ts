import { Prisma } from '@prisma/client';
import {
  SellerProductStatusFilter,
  SellerProductSortOption,
} from './dto/seller-product-query.dto';
import {
  SellerOrderStatusFilter,
  SellerOrderAmountRange,
  SellerOrderSortBy,
  SellerOrderTimeRange,
} from './dto/seller-order-query.dto';
import {
  SellerStockLevelFilter,
  SellerInventorySortBy,
} from './dto/seller-inventory-query.dto';

// =====================================================================
// 1. SELLER PRODUCT MAPPINGS
// =====================================================================

export const SELLER_PRODUCT_STATUS_MAP: Record<
  SellerProductStatusFilter,
  Prisma.ProductWhereInput | null
> = {
  [SellerProductStatusFilter.ALL]: null,
  [SellerProductStatusFilter.HIDDEN]: {
    status: 'HIDDEN',
  },
  [SellerProductStatusFilter.ACTIVE]: {
    status: 'ACTIVE',
    variants: {
      some: {
        inventory: { onHand: { gt: 0 } },
        deletedAt: null,
      },
    },
  },
  [SellerProductStatusFilter.OUT_OF_STOCK]: {
    status: 'ACTIVE',
    variants: {
      every: {
        inventory: { onHand: { lte: 0 } },
        deletedAt: null,
      },
    },
  },
};

export const SELLER_PRODUCT_SORT_MAP: Record<
  SellerProductSortOption,
  Prisma.ProductOrderByWithRelationInput
> = {
  [SellerProductSortOption.NEWEST]: { createdAt: 'desc' },
  [SellerProductSortOption.OLDEST]: { createdAt: 'asc' },
  [SellerProductSortOption.PRICE_ASC]: { minPrice: 'asc' },
  [SellerProductSortOption.PRICE_DESC]: { minPrice: 'desc' },
  [SellerProductSortOption.STOCK_ASC]: { minPrice: 'asc' },
  [SellerProductSortOption.STOCK_DESC]: { minPrice: 'desc' },
};

// =====================================================================
// 2. SELLER ORDER MAPPINGS
// =====================================================================

export const SELLER_ORDER_STATUS_MAP: Record<
  SellerOrderStatusFilter,
  Prisma.SellerOrderWhereInput | null
> = {
  [SellerOrderStatusFilter.ALL]: null,
  [SellerOrderStatusFilter.PENDING]: {
    status: { in: ['PENDING', 'PROCESSING'] },
  },
  [SellerOrderStatusFilter.SHIPPING]: {
    status: 'SHIPPED',
  },
  [SellerOrderStatusFilter.DELIVERED]: {
    status: 'DELIVERED',
  },
  [SellerOrderStatusFilter.CANCELLED]: {
    status: 'CANCELLED',
  },
};

export const SELLER_ORDER_AMOUNT_MAP: Record<
  SellerOrderAmountRange,
  Prisma.SellerOrderWhereInput | null
> = {
  [SellerOrderAmountRange.ALL]: null,
  [SellerOrderAmountRange.UNDER_500K]: {
    total: { lt: BigInt(500000) },
  },
  [SellerOrderAmountRange.FROM_500K_TO_2M]: {
    total: { gte: BigInt(500000), lte: BigInt(2000000) },
  },
  [SellerOrderAmountRange.OVER_2M]: {
    total: { gt: BigInt(2000000) },
  },
};

export const SELLER_ORDER_SORT_MAP: Record<
  SellerOrderSortBy,
  Prisma.SellerOrderOrderByWithRelationInput
> = {
  [SellerOrderSortBy.NEWEST]: { id: 'desc' },
  [SellerOrderSortBy.OLDEST]: { id: 'asc' },
  [SellerOrderSortBy.TOTAL_DESC]: { total: 'desc' },
  [SellerOrderSortBy.TOTAL_ASC]: { total: 'asc' },
};

/**
 * Helper tính toán điều kiện where theo khoảng thời gian đặt đơn
 */
export function getSellerOrderTimeRangeWhere(timeRange?: SellerOrderTimeRange | string): Prisma.SellerOrderWhereInput | null {
  if (!timeRange || timeRange === SellerOrderTimeRange.ALL || timeRange === 'all') {
    return null;
  }
  const now = new Date();
  if (timeRange === SellerOrderTimeRange.TODAY) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { order: { placedAt: { gte: startOfToday } } };
  }
  if (timeRange === SellerOrderTimeRange.DAYS_7) {
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    return { order: { placedAt: { gte: d7 } } };
  }
  if (timeRange === SellerOrderTimeRange.DAYS_30) {
    const d30 = new Date();
    d30.setDate(d30.getDate() - 30);
    return { order: { placedAt: { gte: d30 } } };
  }
  if (timeRange === SellerOrderTimeRange.MONTH) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { order: { placedAt: { gte: startOfMonth } } };
  }
  return null;
}

// =====================================================================
// 3. SELLER INVENTORY MAPPINGS
// =====================================================================

export const SELLER_STOCK_LEVEL_MAP: Record<
  SellerStockLevelFilter,
  Prisma.ProductVariantWhereInput | null
> = {
  [SellerStockLevelFilter.ALL]: null,
  [SellerStockLevelFilter.OUT_OF_STOCK]: {
    inventory: { onHand: { lte: 0 } },
  },
  [SellerStockLevelFilter.LOW_STOCK]: {
    inventory: { onHand: { gt: 0, lte: 10 } },
  },
  [SellerStockLevelFilter.IN_STOCK]: {
    inventory: { onHand: { gt: 10 } },
  },
  [SellerStockLevelFilter.SAFE]: {
    inventory: { onHand: { gt: 10 } },
  },
};

export const SELLER_INVENTORY_SORT_MAP: Record<
  SellerInventorySortBy,
  Prisma.ProductVariantOrderByWithRelationInput
> = {
  [SellerInventorySortBy.NEWEST]: { id: 'desc' },
  [SellerInventorySortBy.STOCK_ASC]: { inventory: { onHand: 'asc' } },
  [SellerInventorySortBy.STOCK_DESC]: { inventory: { onHand: 'desc' } },
  [SellerInventorySortBy.NAME_ASC]: { product: { name: 'asc' } },
};

