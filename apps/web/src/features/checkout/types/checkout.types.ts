export interface CheckoutAddress {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  line1: string;
}

export interface CheckoutUserProfile {
  fullName: string;
  phone: string;
}

export interface CheckoutItemData {
  variantPublicId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CheckoutShopGroup {
  publicId: string;
  name: string;
  slug: string;
  logoKey: string | null;
  items: CheckoutItemData[];
  subtotal: number;
  shippingFee: number;
}

export interface CheckoutSummaryData {
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  totalQuantity: number;
}

export interface CheckoutSummaryResponse {
  defaultAddress: CheckoutAddress | null;
  userProfile: CheckoutUserProfile;
  shops: CheckoutShopGroup[];
  summary: CheckoutSummaryData;
}

export interface CreateOrderPayload {
  shippingAddress: {
    recipientName: string;
    phone: string;
    line1: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  contactPhone?: string;
  contactEmail?: string;
  paymentMethod?: string;
  shippingMethodId?: string;
  voucherCode?: string;
  note?: string;
  idempotencyKey?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  paymentMethod: string;
  itemsCount: number;
  recipient: any;
  message: string;
}
