import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sellerProductsApi,
  SellerProductsQueryParams,
  CreateProductPayload,
  UpdateProductPayload,
} from '../api/seller-products.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_PRODUCT_QUERY_KEYS = {
  STATS: ['seller', 'products', 'stats'] as const,
  LIST: (params: SellerProductsQueryParams) => ['seller', 'products', 'list', params] as const,
  DETAIL: (id: string) => ['seller', 'products', 'detail', id] as const,
  CATEGORIES: ['seller', 'categories'] as const,
};

/**
 * Hook lấy 4 chỉ số thống kê sản phẩm
 */
export function useSellerProductStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_PRODUCT_QUERY_KEYS.STATS,
    queryFn: () => sellerProductsApi.getStats(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

/**
 * Hook lấy danh sách sản phẩm phân trang & bộ lọc
 */
export function useSellerProducts(params: SellerProductsQueryParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_PRODUCT_QUERY_KEYS.LIST(params),
    queryFn: () => sellerProductsApi.getProducts(params),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 phút
  });
}

/**
 * Hook lấy chi tiết 1 sản phẩm
 */
export function useSellerProductDetail(id: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_PRODUCT_QUERY_KEYS.DETAIL(id || ''),
    queryFn: () => sellerProductsApi.getProductDetail(id!),
    enabled: Boolean(isAuthenticated && id),
  });
}

/**
 * Hook lấy danh mục cho seller dropdown
 */
export function useSellerCategories() {
  return useQuery({
    queryKey: SELLER_PRODUCT_QUERY_KEYS.CATEGORIES,
    queryFn: () => sellerProductsApi.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 phút
  });
}

/**
 * Hook tạo mới sản phẩm
 */
export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      sellerProductsApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
  });
}

/**
 * Hook cập nhật sản phẩm
 */
export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      sellerProductsApi.updateProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
      queryClient.invalidateQueries({
        queryKey: SELLER_PRODUCT_QUERY_KEYS.DETAIL(variables.id),
      });
    },
  });
}

/**
 * Hook bật / tạm ẩn sản phẩm nhanh
 */
export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'HIDDEN' }) =>
      sellerProductsApi.toggleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
  });
}

/**
 * Hook xóa mềm sản phẩm
 */
export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerProductsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
  });
}

