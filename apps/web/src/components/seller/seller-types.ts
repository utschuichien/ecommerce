export type SellerTabType =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'vouchers'
  | 'analytics'
  | 'settings';

export interface SellerMetricCard {
  id: string;
  title: string;
  value: string;
  changePercent: string;
  isPositive: boolean;
  type: 'revenue' | 'orders' | 'products' | 'rating';
  sparklineData?: number[];
}

export interface SellerTopProduct {
  id: string;
  rank: number;
  name: string;
  image: string;
  soldCount: number;
  revenueText: string;
}

export interface SellerRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED';
  statusLabel: string;
  statusColor: 'amber' | 'blue' | 'green' | 'teal';
  createdAt: string;
}

export interface SellerRevenuePoint {
  date: string;
  value: number; 
  formattedValue: string;
}

export interface ProductVariantItem {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  optionValues?: Record<string, string>;
  image?: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  category: string;
  categoryColor: string;
  price: number;
  minPrice?: number;
  stock: number;
  soldCount: number;
  hasVariants?: boolean;
  variants?: ProductVariantItem[];
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'HIDDEN';
  statusLabel: string;
  createdAt: string;
}

export interface ProductCategory {
  name: string;
  color: string;
}
