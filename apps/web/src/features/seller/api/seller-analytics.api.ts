import { apiClient } from '@/lib/api-client';

export interface AnalyticsChartDataPoint {
  date: string;
  amount: number;
  label: string;
  x: number;
  y: number;
}

export interface AnalyticsTopProduct {
  rank: number;
  name: string;
  soldCount: number;
  revenue: string;
  image: string;
  rankBg: string;
}

export interface AnalyticsPaymentBreakdown {
  method: string;
  label: string;
  percent: number;
  amount: string;
}

export interface SellerAnalyticsResponse {
  kpi: {
    totalRevenue: number;
    totalRevenueFormatted: string;
    totalOrders: number;
    itemsSold: number;
    averageRating: string;
  };
  revenueChart: AnalyticsChartDataPoint[];
  topProducts: AnalyticsTopProduct[];
  paymentBreakdown: AnalyticsPaymentBreakdown[];
}

export const sellerAnalyticsApi = {
  /**
   * Lấy dữ liệu phân tích doanh thu & hiệu suất
   */
  async getAnalytics(range: '7' | '30' | '90' | 'year' = '30'): Promise<SellerAnalyticsResponse> {
    const response = await apiClient.get<SellerAnalyticsResponse>('/seller/analytics', {
      params: { range },
    });
    return response.data;
  },
};

