import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { AddToCartDto } from '../types/cart.types';

export const CART_QUERY_KEYS = {
  CART: ['cart'] as const,
};

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: CART_QUERY_KEYS.CART,
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30s
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AddToCartDto) => cartApi.addToCart(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEYS.CART, data);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      cartApi.updateQuantity(variantId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEYS.CART, data);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => cartApi.removeItem(variantId),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEYS.CART, data);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

export function useToggleCartItemSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, selected }: { variantId: string; selected: boolean }) =>
      cartApi.toggleItemSelection(variantId, selected),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEYS.CART, data);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

export function useToggleSelectAllCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ selected, shopId }: { selected: boolean; shopId?: string }) =>
      cartApi.toggleSelectAll(selected, shopId),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEYS.CART, data);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.CART });
    },
  });
}

