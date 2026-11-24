import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '../api/checkout.api';
import { CreateOrderPayload } from '../types/checkout.types';

export function useCheckoutSummary() {
  return useQuery({
    queryKey: ['checkout', 'summary'],
    queryFn: () => checkoutApi.getCheckoutSummary(),
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      checkoutApi.createCheckoutOrder(payload),
    onSuccess: () => {
      // Làm mới dữ liệu giỏ hàng, danh sách đơn hàng và tóm tắt checkout
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['checkout', 'summary'] });
    },
  });
}

