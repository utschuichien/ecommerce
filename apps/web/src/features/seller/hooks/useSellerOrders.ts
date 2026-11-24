import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sellerOrdersApi,
  SellerOrdersQueryParams,
  SellerOrderStats,
} from '../api/seller-orders.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_ORDER_QUERY_KEYS = {
  STATS: ['seller', 'orders', 'stats'] as const,
  LIST: (params: SellerOrdersQueryParams) => ['seller', 'orders', 'list', params] as const,
  DETAIL: (id: string) => ['seller', 'orders', 'detail', id] as const,
};

/**
 * Hook lấy 4 chỉ số thống kê đơn hàng
 */
export function useSellerOrderStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_ORDER_QUERY_KEYS.STATS,
    queryFn: () => sellerOrdersApi.getStats(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

/**
 * Hook lấy danh sách đơn hàng có phân trang, tìm kiếm & bộ lọc
 */
export function useSellerOrders(params: SellerOrdersQueryParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_ORDER_QUERY_KEYS.LIST(params),
    queryFn: () => sellerOrdersApi.getOrders(params),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 phút
  });
}

/**
 * Hook lấy chi tiết một đơn hàng
 */
export function useSellerOrderDetail(id: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_ORDER_QUERY_KEYS.DETAIL(id || ''),
    queryFn: () => sellerOrdersApi.getOrderDetail(id!),
    enabled: Boolean(isAuthenticated && id),
  });
}

/**
 * Hook cập nhật trạng thái đơn hàng (Đang xử lý -> Đang giao -> Hoàn thành / Hủy)
 */
export function useUpdateSellerOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      carrier,
      trackingCode,
      reason,
    }: {
      id: string;
      status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
      carrier?: string;
      trackingCode?: string;
      reason?: string;
    }) => sellerOrdersApi.updateStatus(id, { status, carrier, trackingCode, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] });
    },
  });
}

