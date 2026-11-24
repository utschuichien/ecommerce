export interface AdminRevenuePoint {
  date: string;
  value: number;
  formattedValue: string;
}

export interface AdminTopProduct {
  id: string;
  rank: number;
  name: string;
  image: string | null;
  shopName: string;
  price: number;
  formattedPrice: string;
  soldCount: number;
}

export interface AdminOverviewStats {
  totalGMV: number;
  totalOrders: number;
  completedOrdersCount: number;
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  revenuePoints?: AdminRevenuePoint[];
  topProducts?: AdminTopProduct[];
  topShops: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    ownerName: string;
    ownerEmail: string;
    productsCount: number;
    ordersCount: number;
    totalRevenue: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shops: string[];
    grandTotal: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AdminShopItem {
  id: string;
  numericId: string;
  name: string;
  slug: string;
  logo: string | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export interface AdminShopsResponse {
  items: AdminShopItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminUserItem {
  id: string;
  numericId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  roles: string[];
  primaryRole: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  status: 'ACTIVE' | 'SUSPENDED';
  ordersCount: number;
  shop: {
    name: string;
    slug: string;
  } | null;
  createdAt: string;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
  productsCount: number;
}

export interface AdminShopQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  position?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  position?: number;
  isActive?: boolean;
}

// ================= PRODUCT TYPES =================
export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  minPrice: number;
  status: 'DRAFT' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
  image: string | null;
  variantsCount: number;
  shop: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

export interface AdminProductsResponse {
  items: AdminProductItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}

// ================= ORDER TYPES =================
export interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shops: string[];
  itemsCount: number;
  itemsPreview: {
    name: string;
    quantity: number;
    price: number;
    image: string | null;
  }[];
  grandTotal: number;
  status: string;
  placedAt: string;
  paidAt: string | null;
}

export interface AdminOrdersResponse {
  items: AdminOrderItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  shippingAddress: any;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  voucherCode: string | null;
  placedAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  payments: {
    id: string;
    method: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  sellerOrders: {
    id: string;
    shopName: string;
    shopSlug: string;
    status: string;
    total: number;
    items: {
      id: string;
      productName: string;
      variantLabel: string;
      sku: string;
      image: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
  }[];
}

// ================= REVIEW TYPES =================
export interface AdminReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  isVerified: boolean;
  sellerReply: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    shopName: string;
  };
}

export interface AdminReviewsResponse {
  items: AdminReviewItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminReviewQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
}

// ================= PAYOUT TYPES =================
export interface AdminPayoutItem {
  shopId: string;
  shopName: string;
  shopSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  totalOrdersCount: number;
  deliveredOrdersCount: number;
  grossRevenue: number;
  deliveredRevenue: number;
  commissionFee: number;
  netPayout: number;
  payoutStatus: 'READY' | 'SETTLED';
  lastSettlementDate: string;
}

export interface AdminPayoutsResponse {
  summary: {
    totalDeliveredGMV: number;
    totalPlatformCommission: number;
    totalNetPayout: number;
    cycleType: string;
  };
  items: AdminPayoutItem[];
}

// ================= VOUCHER TYPES =================
export interface AdminVoucherItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scope: 'GLOBAL' | 'SHOP';
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  usagePerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  shopName: string | null;
  createdAt: string;
}

export interface AdminVouchersResponse {
  items: AdminVoucherItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminVoucherQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  scope?: string;
  isActive?: boolean;
}

export interface CreatePlatformVoucherPayload {
  code: string;
  name: string;
  description?: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usagePerUser?: number;
  startDate: string;
  endDate: string;
}

