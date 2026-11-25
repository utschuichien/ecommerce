import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wishlistApi } from '../api/wishlist.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { AUTH_QUERY_KEYS } from '../../auth/hooks/useAuth';
import { extractErrorMessage } from '../../../lib/api-client';

export const WISHLIST_QUERY_KEYS = {
  ALL: (params?: any) => ['wishlist', params] as const,
  IDS: () => ['wishlist', 'ids'] as const,
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

export function useWishlistIds() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEYS.IDS(),
    queryFn: () => wishlistApi.getWishlistIds(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 phút
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

export interface WishlistProductTarget {
  id?: string | number;
  productId?: string | number;
  slug?: string;
  name?: string;
}

/**
 * Hook thống nhất để kiểm tra và bật/tắt yêu thích ở mọi nơi trong hệ thống
 */
export function useWishlistToggle() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: wishlistIds = [] } = useWishlistIds();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const isWishlisted = (target?: WishlistProductTarget | string | number | null): boolean => {
    if (!isAuthenticated || !target || wishlistIds.length === 0) return false;

    if (typeof target === 'string' || typeof target === 'number') {
      const targetStr = String(target);
      return wishlistIds.includes(targetStr);
    }

    if (target.id && wishlistIds.includes(String(target.id))) return true;
    if (target.productId && wishlistIds.includes(String(target.productId))) return true;
    if (target.slug && wishlistIds.includes(target.slug)) return true;

    return false;
  };

  const toggleWishlist = (
    product: WishlistProductTarget,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để lưu sản phẩm vào danh sách yêu thích.',
      });
      return;
    }

    const identifier = String(product.id || product.productId || product.slug || '');
    if (!identifier) return;

    const currentlyWishlisted = isWishlisted(product);
    const productName = product.name || 'Sản phẩm';

    // Cập nhật lạc quan (Optimistic update) để icon trái tim phản hồi tức thì
    if (currentlyWishlisted) {
      queryClient.setQueryData(WISHLIST_QUERY_KEYS.IDS(), (old: string[] = []) => {
        const removeSet = new Set(
          [String(product.id || ''), String(product.productId || ''), String(product.slug || '')].filter(Boolean)
        );
        return old.filter((id) => !removeSet.has(id));
      });

      removeFromWishlistMutation.mutate(identifier, {
        onSuccess: () => {
          toast.success('Đã xóa khỏi yêu thích', {
            description: productName,
          });
        },
        onError: (err) => {
          queryClient.invalidateQueries({ queryKey: ['wishlist'] });
          toast.error('Lỗi yêu thích', {
            description: extractErrorMessage(err, 'Không thể xóa khỏi danh sách yêu thích.'),
          });
        },
      });
    } else {
      queryClient.setQueryData(WISHLIST_QUERY_KEYS.IDS(), (old: string[] = []) => {
        const next = new Set(old);
        if (product.id) next.add(String(product.id));
        if (product.productId) next.add(String(product.productId));
        if (product.slug) next.add(product.slug);
        return Array.from(next);
      });

      addToWishlistMutation.mutate(identifier, {
        onSuccess: () => {
          toast.success('Đã thêm vào yêu thích', {
            description: productName,
          });
        },
        onError: (err) => {
          queryClient.invalidateQueries({ queryKey: ['wishlist'] });
          toast.error('Lỗi yêu thích', {
            description: extractErrorMessage(err, 'Không thể thêm vào danh sách yêu thích.'),
          });
        },
      });
    }
  };

  return {
    isWishlisted,
    toggleWishlist,
    isLoading: addToWishlistMutation.isPending || removeFromWishlistMutation.isPending,
  };
}
