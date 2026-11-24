import { apiClient } from '@/lib/api-client';
import {
  SellerMetricCard,
  SellerTopProduct,
  SellerRecentOrder,
  SellerRevenuePoint,
} from '@/components/seller/seller-types';

export interface SellerOverviewResponse {
  metrics: SellerMetricCard[];
  revenuePoints: SellerRevenuePoint[];
  topProducts: SellerTopProduct[];
  recentOrders: SellerRecentOrder[];
}

export const sellerOverviewApi = {
  /**
   * Lấy toàn bộ dữ liệu tổng hợp cho trang Tổng quan
   */
  async getOverview(range: '7' | '30' | '90' = '7'): Promise<SellerOverviewResponse> {
    const response = await apiClient.get<SellerOverviewResponse>('/seller/overview', {
      params: { range },
    });
    return response.data;
  },
};

