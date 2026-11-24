import { apiClient } from '@/lib/api-client';
import { SellerOrderRecord } from '@/components/seller/modals';

export interface SellerOrderStats {
  total: number;
  pending: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

export interface SellerOrdersQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  timeRange?: string;
  amountRange?: string;
  sortBy?: string;
}

export interface SellerOrdersResponse {
  items: SellerOrderRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  counts: Record<string, number>;
}

export interface UpdateSellerOrderStatusPayload {
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  carrier?: string;
  trackingCode?: string;
  reason?: string;
}

export const sellerOrdersApi = {
  /**
   * Lấy 4 thẻ thống kê đơn hàng
   */
  async getStats(): Promise<SellerOrderStats> {
    const response = await apiClient.get<SellerOrderStats>('/seller/orders/stats');
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng của Seller (phân trang & bộ lọc)
   */
  async getOrders(params: SellerOrdersQueryParams = {}): Promise<SellerOrdersResponse> {
    const response = await apiClient.get<SellerOrdersResponse>('/seller/orders', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo PublicId
   */
  async getOrderDetail(id: string): Promise<SellerOrderRecord> {
    const response = await apiClient.get<SellerOrderRecord>(`/seller/orders/${id}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Hoàn thành, Đã hủy)
   */
  async updateStatus(
    id: string,
    payload:
      | UpdateSellerOrderStatusPayload
      | 'PENDING'
      | 'PROCESSING'
      | 'SHIPPING'
      | 'DELIVERED'
      | 'CANCELLED',
  ): Promise<{ success: boolean; status: string; message: string }> {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    const response = await apiClient.patch(`/seller/orders/${id}/status`, body);
    return response.data;
  },
};

