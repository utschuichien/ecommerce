import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';
import {
  AvailableVoucher,
  ValidateVoucherPayload,
  ValidateVoucherResponse,
} from '../types/vouchers.types';

export const vouchersApi = {
  getAvailableVouchers: async (
    shop?: string,
  ): Promise<AvailableVoucher[]> => {
    const params = shop ? { shop } : undefined;
    const response = await apiClient.get<
      ApiStandardResponse<AvailableVoucher[]>
    >('/vouchers/available', { params });
    return (
      response.data?.data ||
      (response.data as unknown as AvailableVoucher[]) ||
      []
    );
  },

  validateVoucher: async (
    payload: ValidateVoucherPayload,
  ): Promise<ValidateVoucherResponse> => {
    const response = await apiClient.post<
      ApiStandardResponse<ValidateVoucherResponse>
    >('/vouchers/validate', payload);
    return (
      response.data?.data ||
      (response.data as unknown as ValidateVoucherResponse)
    );
  },
};

