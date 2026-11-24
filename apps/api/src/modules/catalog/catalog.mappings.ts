import { Prisma } from '@prisma/client';
import { CatalogSortOption, CatalogStockFilter } from './dto/catalog-query.dto';

/**
 * Ánh xạ kiểu Record từ CatalogSortOption sang Prisma.ProductOrderByWithRelationInput
 */
export const CATALOG_SORT_MAP: Record<
  CatalogSortOption,
  Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]
> = {
  [CatalogSortOption.POPULAR]: [{ minPrice: 'desc' }, { createdAt: 'desc' }],
  [CatalogSortOption.NEWEST]: { createdAt: 'desc' },
  [CatalogSortOption.PRICE_ASC]: { minPrice: 'asc' },
  [CatalogSortOption.PRICE_DESC]: { minPrice: 'desc' },
  [CatalogSortOption.BESTSELLER]: [{ minPrice: 'desc' }, { createdAt: 'desc' }],
};

/**
 * Ánh xạ kiểu Record từ CatalogStockFilter sang Prisma.ProductWhereInput
 */
export const CATALOG_STOCK_MAP: Record<
  CatalogStockFilter,
  Prisma.ProductWhereInput | null
> = {
  [CatalogStockFilter.ALL]: null,
  [CatalogStockFilter.IN_STOCK]: {
    variants: {
      some: {
        status: 'ACTIVE',
        inventory: {
          onHand: { gt: 0 },
        },
      },
    },
  },
  [CatalogStockFilter.OUT_OF_STOCK]: {
    OR: [
      { variants: { none: { status: 'ACTIVE' } } },
      {
        variants: {
          every: {
            OR: [
              { inventory: null },
              { inventory: { onHand: { lte: 0 } } },
            ],
          },
        },
      },
    ],
  },
};

