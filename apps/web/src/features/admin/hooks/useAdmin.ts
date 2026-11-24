import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import {
  AdminShopQueryParams,
  AdminUserQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  AdminProductQueryParams,
  AdminOrderQueryParams,
  AdminReviewQueryParams,
  AdminVoucherQueryParams,
  CreatePlatformVoucherPayload,
} from '../types/admin.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/api-client';

export const ADMIN_QUERY_KEYS = {
  OVERVIEW: (range?: string) => ['admin', 'overview', range] as const,
  SHOPS: (params?: AdminShopQueryParams) => ['admin', 'shops', params] as const,
  USERS: (params?: AdminUserQueryParams) => ['admin', 'users', params] as const,
  CATEGORIES: ['admin', 'categories'] as const,
  PRODUCTS: (params?: AdminProductQueryParams) => ['admin', 'products', params] as const,
  ORDERS: (params?: AdminOrderQueryParams) => ['admin', 'orders', params] as const,
  ORDER_DETAIL: (orderId: string) => ['admin', 'orders', orderId] as const,
  REVIEWS: (params?: AdminReviewQueryParams) => ['admin', 'reviews', params] as const,
  PAYOUTS: ['admin', 'payouts'] as const,
  VOUCHERS: (params?: AdminVoucherQueryParams) => ['admin', 'vouchers', params] as const,
};

/**
 * Hook lấy thống kê tổng quan
 */
export function useAdminOverview(range: string = '7') {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.OVERVIEW(range),
    queryFn: () => adminApi.getOverview(range),
    staleTime: 30_000,
  });
}

/**
 * Hook lấy danh sách gian hàng kèm bộ lọc
 */
export function useAdminShops(params?: AdminShopQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.SHOPS(params),
    queryFn: () => adminApi.getShops(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook cập nhật trạng thái gian hàng
 */
export function useUpdateShopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shopId,
      status,
      reason,
    }: {
      shopId: string;
      status: 'ACTIVE' | 'SUSPENDED';
      reason?: string;
    }) => adminApi.updateShopStatus(shopId, { status, reason }),
    onSuccess: (data) => {
      toast.success(data?.message || 'Cập nhật trạng thái gian hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'shops'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật trạng thái gian hàng'));
    },
  });
}

/**
 * Hook lấy danh sách người dùng kèm bộ lọc
 */
export function useAdminUsers(params?: AdminUserQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.USERS(params),
    queryFn: () => adminApi.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook cập nhật người dùng
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { role?: 'CUSTOMER' | 'SELLER' | 'ADMIN'; status?: 'ACTIVE' | 'SUSPENDED' };
    }) => adminApi.updateUser(userId, data),
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật tài khoản người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật người dùng'));
    },
  });
}

/**
 * Hook lấy danh mục
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.CATEGORIES,
    queryFn: () => adminApi.getCategories(),
  });
}

/**
 * Hook tạo danh mục
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => adminApi.createCategory(data),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã thêm danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể tạo danh mục'));
    },
  });
}

/**
 * Hook cập nhật danh mục
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryPayload }) =>
      adminApi.updateCategory(categoryId, data),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã cập nhật danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật danh mục'));
    },
  });
}

/**
 * Hook xóa danh mục
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => adminApi.deleteCategory(categoryId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã xóa danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CATEGORIES });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể xóa danh mục'));
    },
  });
}

/**
 * Hook quản lý sản phẩm
 */
export function useAdminProducts(params?: AdminProductQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.PRODUCTS(params),
    queryFn: () => adminApi.getProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      status,
    }: {
      productId: string;
      status: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
    }) => adminApi.updateProductStatus(productId, status),
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật trạng thái sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật trạng thái sản phẩm'));
    },
  });
}

/**
 * Hook quản lý đơn hàng
 */
export function useAdminOrders(params?: AdminOrderQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.ORDERS(params),
    queryFn: () => adminApi.getOrders(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.ORDER_DETAIL(orderId || ''),
    queryFn: () => (orderId ? adminApi.getOrderDetails(orderId) : null),
    enabled: !!orderId,
  });
}

/**
 * Hook quản lý đánh giá
 */
export function useAdminReviews(params?: AdminReviewQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.REVIEWS(params),
    queryFn: () => adminApi.getReviews(params),
    placeholderData: (prev) => prev,
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => adminApi.deleteReview(reviewId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã xóa đánh giá vi phạm thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể xóa đánh giá'));
    },
  });
}

/**
 * Hook quản lý giải ngân
 */
export function useAdminPayouts() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.PAYOUTS,
    queryFn: () => adminApi.getPayouts(),
  });
}

export function useSettlePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopId: string) => adminApi.settlePayout(shopId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã giải ngân doanh thu cho gian hàng');
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.PAYOUTS });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể thực hiện giải ngân'));
    },
  });
}

/**
 * Hook quản lý voucher
 */
export function useAdminVouchers(params?: AdminVoucherQueryParams) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.VOUCHERS(params),
    queryFn: () => adminApi.getVouchers(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlatformVoucherPayload) => adminApi.createVoucher(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Tạo voucher sàn thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể tạo mã voucher'));
    },
  });
}

export function useToggleVoucherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voucherId, isActive }: { voucherId: string; isActive: boolean }) =>
      adminApi.toggleVoucherStatus(voucherId, isActive),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã cập nhật trạng thái voucher');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể cập nhật voucher'));
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voucherId: string) => adminApi.deleteVoucher(voucherId),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã xóa mã voucher thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Không thể xóa voucher'));
    },
  });
}

