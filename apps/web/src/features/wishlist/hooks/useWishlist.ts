import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { AUTH_QUERY_KEYS } from '../../auth/hooks/useAuth';

export const WISHLIST_QUERY_KEYS = {
  ALL: (params?: any) => ['wishlist', params] as const,
  CHECK: (productId: string) => ['wishlist', 'check', productId] as const,
};

export function useWishlist(params: { page?: number; limit?: number } = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEYS.ALL(params),
    queryFn: () => wishlistApi.getWishlist(params),
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEYS.CHECK(productId) });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SUMMARY });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEYS.CHECK(productId) });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SUMMARY });
    },
  });
}

export function useCheckWishlist(productId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEYS.CHECK(productId),
    queryFn: () => wishlistApi.checkWishlist(productId),
    enabled: Boolean(isAuthenticated && productId),
  });
}
