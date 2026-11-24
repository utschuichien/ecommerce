import { useQuery, useMutation } from '@tanstack/react-query';
import { vouchersApi } from '../api/vouchers.api';
import { ValidateVoucherPayload } from '../types/vouchers.types';

export function useAvailableVouchers(shop?: string) {
  return useQuery({
    queryKey: ['vouchers', 'available', shop || 'all'],
    queryFn: () => vouchersApi.getAvailableVouchers(shop),
    staleTime: 1000 * 60, // 1 phút
  });
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: (payload: ValidateVoucherPayload) =>
      vouchersApi.validateVoucher(payload),
  });
}

