import { apiClient } from '@/lib/api-client';
import {
  AdminOverviewStats,
  AdminShopsResponse,
  AdminUsersResponse,
  AdminCategoryItem,
  AdminShopQueryParams,
  AdminUserQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  AdminProductsResponse,
  AdminProductQueryParams,
  AdminOrdersResponse,
  AdminOrderQueryParams,
  AdminOrderDetail,
  AdminReviewsResponse,
  AdminReviewQueryParams,
  AdminPayoutsResponse,
  AdminVouchersResponse,
  AdminVoucherQueryParams,
  CreatePlatformVoucherPayload,
} from '../types/admin.types';

export const adminApi = {
  /**
   * Thống kê tổng quan sàn
   */
  getOverview: async (range: string = '7'): Promise<AdminOverviewStats> => {
    const res = await apiClient.get<any>('/admin/stats/overview', { params: { range } });
    return res.data?.data || res.data;
  },

  /**
   * Danh sách gian hàng
   */
  getShops: async (params?: AdminShopQueryParams): Promise<AdminShopsResponse> => {
    const res = await apiClient.get<any>('/admin/shops', { params });
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật trạng thái gian hàng (Duyệt mở / Tạm khóa)
   */
  updateShopStatus: async (
    shopId: string,
    data: { status: 'ACTIVE' | 'SUSPENDED'; reason?: string },
  ) => {
    const res = await apiClient.patch<any>(`/admin/shops/${shopId}/status`, data);
    return res.data?.data || res.data;
  },

  /**
   * Danh sách người dùng
   */
  getUsers: async (params?: AdminUserQueryParams): Promise<AdminUsersResponse> => {
    const res = await apiClient.get<any>('/admin/users', { params });
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật vai trò / trạng thái người dùng
   */
  updateUser: async (
    userId: string,
    data: { role?: 'CUSTOMER' | 'SELLER' | 'ADMIN'; status?: 'ACTIVE' | 'SUSPENDED' },
  ) => {
    const res = await apiClient.patch<any>(`/admin/users/${userId}`, data);
    return res.data?.data || res.data;
  },

  /**
   * Danh mục ngành hàng
   */
  getCategories: async (): Promise<AdminCategoryItem[]> => {
    const res = await apiClient.get<any>('/admin/categories');
    return res.data?.data || res.data;
  },

  createCategory: async (data: CreateCategoryPayload) => {
    const res = await apiClient.post<any>('/admin/categories', data);
    return res.data?.data || res.data;
  },

  updateCategory: async (categoryId: string, data: UpdateCategoryPayload) => {
    const res = await apiClient.put<any>(`/admin/categories/${categoryId}`, data);
    return res.data?.data || res.data;
  },

  deleteCategory: async (categoryId: string) => {
    const res = await apiClient.delete<any>(`/admin/categories/${categoryId}`);
    return res.data?.data || res.data;
  },

  /**
   * Quản lý sản phẩm
   */
  getProducts: async (params?: AdminProductQueryParams): Promise<AdminProductsResponse> => {
    const res = await apiClient.get<any>('/admin/products', { params });
    return res.data?.data || res.data;
  },

  updateProductStatus: async (
    productId: string,
    status: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED',
  ) => {
    const res = await apiClient.patch<any>(`/admin/products/${productId}/status`, { status });
    return res.data?.data || res.data;
  },

  /**
   * Quản lý đơn hàng
   */
  getOrders: async (params?: AdminOrderQueryParams): Promise<AdminOrdersResponse> => {
    const res = await apiClient.get<any>('/admin/orders', { params });
    return res.data?.data || res.data;
  },

  getOrderDetails: async (orderId: string): Promise<AdminOrderDetail> => {
    const res = await apiClient.get<any>(`/admin/orders/${orderId}`);
    return res.data?.data || res.data;
  },

  /**
   * Quản lý đánh giá
   */
  getReviews: async (params?: AdminReviewQueryParams): Promise<AdminReviewsResponse> => {
    const res = await apiClient.get<any>('/admin/reviews', { params });
    return res.data?.data || res.data;
  },

  deleteReview: async (reviewId: string) => {
    const res = await apiClient.delete<any>(`/admin/reviews/${reviewId}`);
    return res.data?.data || res.data;
  },

  /**
   * Quản lý giải ngân
   */
  getPayouts: async (): Promise<AdminPayoutsResponse> => {
    const res = await apiClient.get<any>('/admin/payouts');
    return res.data?.data || res.data;
  },

  settlePayout: async (shopId: string) => {
    const res = await apiClient.post<any>(`/admin/payouts/${shopId}/settle`);
    return res.data?.data || res.data;
  },

  /**
   * Quản lý voucher
   */
  getVouchers: async (params?: AdminVoucherQueryParams): Promise<AdminVouchersResponse> => {
    const res = await apiClient.get<any>('/admin/vouchers', { params });
    return res.data?.data || res.data;
  },

  createVoucher: async (payload: CreatePlatformVoucherPayload) => {
    const res = await apiClient.post<any>('/admin/vouchers', payload);
    return res.data?.data || res.data;
  },

  toggleVoucherStatus: async (voucherId: string, isActive: boolean) => {
    const res = await apiClient.patch<any>(`/admin/vouchers/${voucherId}/status`, { isActive });
    return res.data?.data || res.data;
  },

  deleteVoucher: async (voucherId: string) => {
    const res = await apiClient.delete<any>(`/admin/vouchers/${voucherId}`);
    return res.data?.data || res.data;
  },
};
