export interface ReviewItem {
  id: string;
  author: string;
  avatar: string | null;
  rating: number;
  comment: string | null;
  images: string[];
  sellerReply: string | null;
  repliedAt: string | null;
  variant: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  countWithImages: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewsResponse {
  summary: ReviewSummary;
  items: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  variantId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}
