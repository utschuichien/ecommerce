export type ShopTabType =
  | 'home'
  | 'products'
  | 'bestseller'
  | 'promotions'
  | 'reviews'
  | 'policies'
  | 'about';

export interface ShopInfo {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  slogan?: string;
  brandStory?: string;
  isOfficial: boolean;
  badgeText: string;
  followersCount: string;
  ratingScore: number;
  reviewsCount: string;
  responseRate: string;
  responseTime: string;
  productsCount: number;
  joinDate: string;
  isFollowed?: boolean;
  address: string;
  phone: string;
  email: string;
  description: string;
  openTime?: string | null;
  closeTime?: string | null;
  enableFreeShipping?: boolean;
  freeShippingThreshold?: number | null;
  holidayMode?: boolean;
  holidayMessage?: string | null;
  enableReturn?: boolean;
  returnPeriodDays?: number;
  requireUnboxVideo?: boolean;
  returnPolicyNote?: string | null;
  warrantyType?: string | null;
  warrantyPeriodMonths?: number | null;
  warrantyPolicyNote?: string | null;
}

export interface ShopVoucher {
  id: string;
  code: string;
  discountText: string;
  minSpendText: string;
  expiryText: string;
  type: 'discount' | 'shipping' | 'follower';
  isSaved?: boolean;
}

export interface ShopProduct {
  id: string;
  slug?: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewsCount: number;
  soldCount: string;
  image: string;
  inStock: boolean;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue';
  isFlashSale?: boolean;
  flashSaleProgress?: number;
}

export interface ShopReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  productVariant: string;
  comment: string;
  images?: string[];
  sellerResponse?: string;
  helpfulCount: number;
}
