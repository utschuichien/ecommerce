import { useQuery } from '@tanstack/react-query';
import { sellerAnalyticsApi } from '../api/seller-analytics.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_ANALYTICS_QUERY_KEYS = {
  DATA: (range: string) => ['seller', 'analytics', range] as const,
};

/**
 * Hook lấy dữ liệu Thống kê & Doanh thu theo khoảng thời gian (7, 30, 90 ngày hoặc năm)
 */
export function useSellerAnalytics(range: '7' | '30' | '90' | 'year' = '30') {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_ANALYTICS_QUERY_KEYS.DATA(range),
    queryFn: () => sellerAnalyticsApi.getAnalytics(range),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

