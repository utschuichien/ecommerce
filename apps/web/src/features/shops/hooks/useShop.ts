import { useQuery } from '@tanstack/react-query';
import {
  shopsApi,
  ShopProductsQueryParams,
} from '../api/shops.api';

export const SHOP_QUERY_KEYS = {
  PROFILE: (slug: string) => ['shop', 'profile', slug] as const,
  PRODUCTS: (slug: string, params: ShopProductsQueryParams) =>
    ['shop', 'products', slug, params] as const,
  VOUCHERS: (slug: string) => ['shop', 'vouchers', slug] as const,
};

/**
 * Hook lấy thông tin công khai của Shop
 */
export function usePublicShop(slug: string) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.PROFILE(slug),
    queryFn: () => shopsApi.getShopProfile(slug),
    enabled: Boolean(slug && slug.trim()),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
}

/**
 * Hook lấy danh sách sản phẩm của Shop kèm bộ lọc Type-Safe
 */
export function usePublicShopProducts(
  slug: string,
  params: ShopProductsQueryParams = {},
) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.PRODUCTS(slug, params),
    queryFn: () => shopsApi.getShopProducts(slug, params),
    enabled: Boolean(slug && slug.trim()),
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

/**
 * Hook lấy danh sách mã giảm giá khả dụng của Shop
 */
export function usePublicShopVouchers(slug: string) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.VOUCHERS(slug),
    queryFn: () => shopsApi.getShopVouchers(slug),
    enabled: Boolean(slug && slug.trim()),
    staleTime: 1000 * 60 * 5,
  });
}

