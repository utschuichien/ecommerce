import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import { CatalogQueryParams } from '../types/catalog.types';

export const CATALOG_QUERY_KEYS = {
  CATEGORIES: ['catalog', 'categories'] as const,
  BRANDS: (category?: string) => ['catalog', 'brands', category || 'all'] as const,
  PRODUCTS: (params: CatalogQueryParams) => ['catalog', 'products', params] as const,
  PRODUCT_DETAIL: (slug: string) => ['catalog', 'product', slug] as const,
};

/**
 * Hook lấy danh mục động từ database
 */
export function useCategories() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.CATEGORIES,
    queryFn: () => catalogApi.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 phút
  });
}

/**
 * Hook lấy thương hiệu động từ database (lọc theo danh mục đã chọn)
 */
export function useBrands(category?: string) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.BRANDS(category),
    queryFn: () => catalogApi.getBrands(category),
    staleTime: 1000 * 60 * 10, // 10 phút
  });
}

/**
 * Hook lấy danh sách sản phẩm theo bộ lọc đa chiều & phân trang
 */
export function useCatalogProducts(
  params: CatalogQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.PRODUCTS(params),
    queryFn: () => catalogApi.getProducts(params),
    staleTime: 1000 * 60 * 2, // 2 phút
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

/**
 * Hook lấy chi tiết sản phẩm theo Slug
 */
export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.PRODUCT_DETAIL(slug),
    queryFn: () => catalogApi.getProductDetail(slug),
    enabled: Boolean(slug),
  });
}
