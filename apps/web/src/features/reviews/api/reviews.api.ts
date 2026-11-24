import { apiClient } from '@/lib/api-client';
import { ReviewsResponse, CreateReviewPayload } from '../types/reviews.types';

export const reviewsApi = {
  getProductReviews: async (
    slugOrId: string,
    params?: { page?: number; limit?: number; rating?: number; hasImages?: boolean },
  ): Promise<ReviewsResponse> => {
    const res = await apiClient.get<ReviewsResponse | { data: ReviewsResponse }>(
      `/reviews/product/${slugOrId}`,
      { params },
    );
    const raw: any = res.data;
    return raw?.data ?? raw;
  },

  createReview: async (payload: CreateReviewPayload) => {
    const res = await apiClient.post('/reviews', payload);
    return res.data;
  },
};
