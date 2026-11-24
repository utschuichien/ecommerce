import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sellerVouchersApi,
  SellerVouchersQueryParams,
  CreateSellerVoucherPayload,
  UpdateSellerVoucherPayload,
} from '../api/seller-vouchers.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_VOUCHER_QUERY_KEYS = {
  LIST: (params: SellerVouchersQueryParams) => ['seller', 'vouchers', 'list', params] as const,
  ALL: ['seller', 'vouchers'] as const,
};

/**
 * Hook lấy danh sách voucher của Shop
 */
export function useSellerVouchers(params: SellerVouchersQueryParams = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_VOUCHER_QUERY_KEYS.LIST(params),
    queryFn: () => sellerVouchersApi.getVouchers(params),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 phút
  });
}

/**
 * Hook tạo voucher mới
 */
export function useCreateSellerVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSellerVoucherPayload) => sellerVouchersApi.createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_VOUCHER_QUERY_KEYS.ALL });
    },
  });
}

/**
 * Hook cập nhật voucher
 */
export function useUpdateSellerVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSellerVoucherPayload }) =>
      sellerVouchersApi.updateVoucher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_VOUCHER_QUERY_KEYS.ALL });
    },
  });
}

/**
 * Hook bật / tắt trạng thái voucher
 */
export function useToggleSellerVoucherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sellerVouchersApi.toggleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_VOUCHER_QUERY_KEYS.ALL });
    },
  });
}

/**
 * Hook xóa hoặc vô hiệu hóa voucher
 */
export function useDeleteSellerVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerVouchersApi.deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_VOUCHER_QUERY_KEYS.ALL });
    },
  });
}

