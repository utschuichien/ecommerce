import { useQuery } from '@tanstack/react-query';
import { sellerOverviewApi } from '../api/seller-overview.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_OVERVIEW_QUERY_KEYS = {
  DATA: (range: string) => ['seller', 'overview', range] as const,
};

/**
 * Hook lấy dữ liệu trang Tổng quan theo khoảng thời gian biểu đồ (7, 30, 90 ngày)
 */
export function useSellerOverview(range: '7' | '30' | '90' = '7') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_OVERVIEW_QUERY_KEYS.DATA(range),
    queryFn: () => sellerOverviewApi.getOverview(range),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

