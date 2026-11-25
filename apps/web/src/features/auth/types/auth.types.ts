export interface ShopMemberInfo {
  shopId: string;
  role: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string; // publicId
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string | null;
  status: string;
  roles: string[];
  shops?: ShopMemberInfo[];
  wishlistCount?: number;
  createdAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

export interface ApiStandardResponse<T> {
  data: T;
  meta: {
    requestId: string;
    [key: string]: any;
  };
}

export interface UserAddress {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  province: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
}

export interface UserSession {
  id: string;
  deviceName: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ProfileSummaryResponse {
  user: UserProfile & {
    membershipTier: string;
    joinDate: string;
    totalSpent: number;
  };
  stats: {
    ordersCount: number;
    pendingOrdersCount: number;
    completedOrdersCount: number;
    wishlistCount: number;
    addressesCount: number;
    membershipTier: string;
    totalSpent: number;
  };
  defaultAddress: UserAddress | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    date: string;
    status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
    statusLabel: string;
    totalAmount: number;
    image: string;
    productName: string;
    itemsCount: number;
  }>;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  cooldownSeconds: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  resetToken: string;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}


