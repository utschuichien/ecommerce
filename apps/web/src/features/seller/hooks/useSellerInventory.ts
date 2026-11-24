import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sellerInventoryApi,
  SellerInventoryQueryParams,
  AdjustStockPayload,
} from '../api/seller-inventory.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_INVENTORY_QUERY_KEYS = {
  STATS: ['seller', 'inventory', 'stats'] as const,
  LIST: (params: SellerInventoryQueryParams) => ['seller', 'inventory', 'list', params] as const,
};

/**
 * Hook lấy 4 chỉ số thống kê kho hàng
 */
export function useSellerInventoryStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_INVENTORY_QUERY_KEYS.STATS,
    queryFn: () => sellerInventoryApi.getStats(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

/**
 * Hook lấy danh sách tồn kho có phân trang & bộ lọc
 */
export function useSellerInventory(params: SellerInventoryQueryParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_INVENTORY_QUERY_KEYS.LIST(params),
    queryFn: () => sellerInventoryApi.getInventory(params),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 phút
  });
}

/**
 * Hook điều chỉnh số lượng tồn kho (RESTOCK / ADJUST)
 */
export function useAdjustSellerInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdjustStockPayload) =>
      sellerInventoryApi.adjustStock(payload),
    onSuccess: () => {
      // Invalidate cả inventory và products vì tồn kho ảnh hưởng trạng thái sản phẩm
      queryClient.invalidateQueries({ queryKey: ['seller', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
  });
}

