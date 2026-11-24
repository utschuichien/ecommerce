export type ProfileTabType =
  | 'overview'
  | 'personal-info'
  | 'addresses'
  | 'orders'
  | 'wishlist'
  | 'security';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  membershipTier: string;
  joinDate: string;
  ordersCount: number;
  wishlistCount: number;
  status: 'active' | 'inactive';
}

export interface ProfileOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'shipping' | 'delivered' | 'completed' | 'cancelled';
  statusLabel: string;
  totalAmount: number;
  image: string;
  productName: string;
  itemsCount: number;
}

export interface ProfileAddress {
  id: string;
  recipientName: string;
  phone: string;
  address: string;
  isDefault: boolean;
  type?: 'home' | 'office';
}

export interface ProfilePaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  name: string;
  detail: string;
  provider?: string;
  isDefault?: boolean;
}

export interface ProfileWishlistItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  isFavorite: boolean;
  brand?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  discountPercent?: number;
  inStock?: boolean;
}
