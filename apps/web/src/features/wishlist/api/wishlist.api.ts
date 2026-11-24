import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';

export interface WishlistItemDto {
  id: string;
  productId: string;
  productNumericId?: string;
  name: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
  isFavorite: boolean;
  category?: string;
  image: string;
  addedAt?: string;
}

export interface WishlistListResponse {
  data: WishlistItemDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const wishlistApi = {
  async getWishlist(params: { page?: number; limit?: number } = {}): Promise<WishlistListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    query.append('limit', '10'); // Limit luôn là 10 theo yêu cầu

    const qs = query.toString();
    const url = `/wishlist${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<ApiStandardResponse<WishlistListResponse>>(url);
    return response.data?.data || (response.data as unknown as WishlistListResponse);
  },

  async addToWishlist(productId: string): Promise<{ message: string; isFavorite: boolean }> {
    const response = await apiClient.post<ApiStandardResponse<{ message: string; isFavorite: boolean }>>(
      `/wishlist/${productId}`,
    );
    return response.data?.data || (response.data as unknown as { message: string; isFavorite: boolean });
  },

  async removeFromWishlist(productId: string): Promise<{ message: string; isFavorite: boolean }> {
    const response = await apiClient.delete<ApiStandardResponse<{ message: string; isFavorite: boolean }>>(
      `/wishlist/${productId}`,
    );
    return response.data?.data || (response.data as unknown as { message: string; isFavorite: boolean });
  },

  async checkWishlist(productId: string): Promise<{ isFavorite: boolean }> {
    const response = await apiClient.get<ApiStandardResponse<{ isFavorite: boolean }>>(
      `/wishlist/check/${productId}`,
    );
    return response.data?.data || (response.data as unknown as { isFavorite: boolean });
  },
};
