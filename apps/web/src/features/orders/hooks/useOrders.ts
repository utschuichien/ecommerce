import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { AUTH_QUERY_KEYS } from '../../auth/hooks/useAuth';

export const ORDER_QUERY_KEYS = {
  MY_ORDERS: (filter?: any) => ['orders', 'my-orders', filter] as const,
  ORDER_DETAIL: (id: string) => ['orders', 'detail', id] as const,
};

export function useMyOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.MY_ORDERS(params),
    queryFn: () => ordersApi.getMyOrders(params),
    enabled: isAuthenticated,
  });
}

export function useMyOrderDetails(orderId: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ORDER_QUERY_KEYS.ORDER_DETAIL(orderId || ''),
    queryFn: () => ordersApi.getMyOrderById(orderId!),
    enabled: Boolean(isAuthenticated && orderId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SUMMARY });
    },
  });
}

export function useOrderStatuses() {
  return useQuery({
    queryKey: ['orders', 'statuses'],
    queryFn: () => ordersApi.getOrderStatuses(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

