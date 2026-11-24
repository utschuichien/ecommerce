import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';
import {
  CheckoutSummaryResponse,
  CreateOrderPayload,
  CreateOrderResponse,
} from '../types/checkout.types';

export const checkoutApi = {
  getCheckoutSummary: async (): Promise<CheckoutSummaryResponse> => {
    const response = await apiClient.get<
      ApiStandardResponse<CheckoutSummaryResponse>
    >('/orders/checkout-summary');
    return (
      response.data?.data ||
      (response.data as unknown as CheckoutSummaryResponse)
    );
  },

  createCheckoutOrder: async (
    payload: CreateOrderPayload,
  ): Promise<CreateOrderResponse> => {
    const headers: Record<string, string> = {};
    if (payload.idempotencyKey) {
      headers['Idempotency-Key'] = payload.idempotencyKey;
    }

    const response = await apiClient.post<
      ApiStandardResponse<CreateOrderResponse>
    >('/orders/checkout', payload, { headers });
    return (
      response.data?.data || (response.data as unknown as CreateOrderResponse)
    );
  },
};
