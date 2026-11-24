import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sellerShopApi,
  SellerShopProfile,
  UpdateSellerShopPayload,
} from '../api/seller-shop.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const SELLER_SHOP_QUERY_KEYS = {
  PROFILE: ['seller', 'shop'] as const,
};

/**
 * Hook lấy thông tin & cấu hình cửa hàng của Seller
 */
export function useSellerShop() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: SELLER_SHOP_QUERY_KEYS.PROFILE,
    queryFn: () => sellerShopApi.getShopProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
}

/**
 * Hook cập nhật thông tin cửa hàng
 */
export function useUpdateSellerShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSellerShopPayload) =>
      sellerShopApi.updateShopProfile(payload),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(SELLER_SHOP_QUERY_KEYS.PROFILE, updatedShop);
      queryClient.invalidateQueries({ queryKey: SELLER_SHOP_QUERY_KEYS.PROFILE });
    },
  });
}

/**
 * Hook cập nhật trạng thái mở / đóng cửa hàng
 */
export function useUpdateShopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'ACTIVE' | 'CLOSED') =>
      sellerShopApi.updateShopStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_SHOP_QUERY_KEYS.PROFILE });
    },
  });
}

/**
 * Hook upload logo cửa hàng
 */
export function useUploadShopLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => sellerShopApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_SHOP_QUERY_KEYS.PROFILE });
    },
  });
}

/**
 * Hook upload banner / cover cửa hàng
 */
export function useUploadShopBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => sellerShopApi.uploadBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_SHOP_QUERY_KEYS.PROFILE });
    },
  });
}

