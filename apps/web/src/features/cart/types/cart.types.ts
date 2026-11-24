export interface CartItem {
  id: string; // variant publicId
  variantId: string;
  numericVariantId?: string;
  productId: string;
  productSlug: string;
  name: string;
  variant: string;
  price: number;
  oldPrice?: number | null;
  quantity: number;
  stock: number;
  outOfStock: boolean;
  image: string;
  selected?: boolean;
}

export interface CartShopGroupData {
  shopId: string;
  shopPublicId?: string;
  shopSlug?: string;
  shopName: string;
  shopLogo?: string | null;
  badge?: string;
  badgeType?: 'official' | 'mall';
  deliveryEstimate: string;
  items: CartItem[];
}

export interface CartSummary {
  originalTotal: number;
  finalTotal: number;
  productDiscount: number;
}

export interface CartResponse {
  totalItems: number;
  totalQuantity: number;
  shops: CartShopGroupData[];
  summary: CartSummary;
}

export interface AddToCartDto {
  variantId?: string;
  productSlug?: string;
  quantity?: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

