import { apiClient } from '@/lib/api-client';
import { ShopInfo, ShopProduct } from '@/components/shop/shop-types';

export type ShopProductTab = 'all' | 'bestseller' | 'promotions';
export type ShopProductSort = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'BESTSELLER' | 'POPULAR';

export interface ShopProductsQueryParams {
  category?: string;
  tab?: ShopProductTab;
  sortBy?: ShopProductSort;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ShopProductsResponse {
  items: ShopProduct[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
}

export interface PublicVoucherItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  scope: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  endDate: string;
  isActive: boolean;
}

export const shopsApi = {
  /**
   * Lấy thông tin công khai của Shop theo Slug / ID
   */
  async getShopProfile(slug: string): Promise<ShopInfo> {
    const response = await apiClient.get<any>(`/shops/${slug}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Lấy danh sách sản phẩm thuộc Shop với các tham số Query type-safe
   */
  async getShopProducts(
    slug: string,
    params: ShopProductsQueryParams = {},
  ): Promise<ShopProductsResponse> {
    const response = await apiClient.get<any>(`/shops/${slug}/products`, {
      params,
    });
    return response.data?.data ?? response.data;
  },

  /**
   * Lấy danh sách các mã giảm giá khả dụng của Shop
   */
  async getShopVouchers(slug: string): Promise<PublicVoucherItem[]> {
    const response = await apiClient.get<any>('/vouchers/available', {
      params: { shop: slug },
    });
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  },
};

