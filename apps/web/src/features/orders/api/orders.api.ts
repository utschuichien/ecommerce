import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';

export interface OrderItemDetail {
  id: string;
  sellerOrderId?: string;
  productId?: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  sku?: string;
  image?: string;
  imageKey?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface SellerOrderDetail {
  id: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  carrier?: string | null;
  trackingCode?: string | null;
  shop?: {
    id: string;
    name: string;
    slug: string;
    logoKey?: string | null;
  };
}

export interface MyOrderDto {
  id: string;
  orderNumber: string;
  date?: string;
  status: string;
  statusLabel?: string;
  badgeClass?: string;
  rawStatus?: string;
  uiStatus?: string;
  statusMeta?: {
    label: string;
    variant: string;
    color: string;
    description: string;
  };
  totalAmount?: number;
  grandTotal?: number;
  subtotal: number;
  shippingFee?: number;
  shippingTotal?: number;
  discountTotal?: number;
  currency?: string;
  image?: string;
  productName?: string;
  itemsCount?: number;
  items: OrderItemDetail[];
  sellerOrders?: SellerOrderDetail[];
  shippingAddress: any;
  contactEmail: string;
  contactPhone: string;
  placedAt: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  expiresAt?: string | null;
}

export interface OrdersListResponse {
  data: MyOrderDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ordersApi = {
  async getMyOrders(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<OrdersListResponse> {
    const query = new URLSearchParams();
    if (params.status && params.status.toLowerCase() !== 'all') {
      query.append('status', params.status.toLowerCase());
    }
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    const url = `/orders/my-orders${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<ApiStandardResponse<OrdersListResponse>>(url);
    return response.data?.data || (response.data as unknown as OrdersListResponse);
  },

  async getMyOrderById(orderId: string): Promise<MyOrderDto> {
    const response = await apiClient.get<ApiStandardResponse<MyOrderDto>>(
      `/orders/my-orders/${orderId}`,
    );
    return response.data?.data || (response.data as unknown as MyOrderDto);
  },

  async cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
    const response = await apiClient.put<ApiStandardResponse<{ message: string }>>(
      `/orders/my-orders/${orderId}/cancel`,
      { reason },
    );
    return response.data?.data || (response.data as unknown as { message: string });
  },

  async getOrderStatuses(): Promise<import('../types/order-status').OrderStatusConfigItem[]> {
    const response = await apiClient.get<ApiStandardResponse<import('../types/order-status').OrderStatusConfigItem[]>>(
      '/orders/statuses',
    );
    return response.data?.data || (response.data as unknown as import('../types/order-status').OrderStatusConfigItem[]);
  },
};
