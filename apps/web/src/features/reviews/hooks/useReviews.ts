import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';
import { CreateReviewPayload } from '../types/reviews.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/api-client';

export function useProductReviews(
  slugOrId: string,
  params?: { page?: number; limit?: number; rating?: number; hasImages?: boolean },
) {
  return useQuery({
    queryKey: ['product-reviews', slugOrId, params],
    queryFn: () => reviewsApi.getProductReviews(slugOrId, params),
    enabled: Boolean(slugOrId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.createReview(payload),
    onSuccess: (_, variables) => {
      toast.success('Đánh giá thành công', {
        description: 'Cảm ơn bạn đã đóng góp nhận xét cho sản phẩm!',
      });
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err) => {
      toast.error('Gửi đánh giá thất bại', {
        description: extractErrorMessage(err, 'Không thể gửi đánh giá.'),
      });
    },
  });
}

