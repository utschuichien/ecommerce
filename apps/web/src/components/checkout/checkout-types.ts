export interface CheckoutItem {
  id: string;
  productId: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  shopName?: string;
}

export interface ShippingMethod {
  id: 'standard' | 'express';
  name: string;
  estimate: string;
  price: number;
}

export interface RecipientInfo {
  fullName: string;
  phone: string;
  address: string;
  line1?: string;
  province: string;
  district: string;
  ward: string;
  saveToAddressBook: boolean;
  note: string;
}

export type PaymentMethodType = 'cod' | 'vnpay' | 'momo' | 'bank_transfer' | 'credit_card';

export interface PaymentOption {
  id: PaymentMethodType;
  name: string;
  description: string;
  badge?: string;
  iconName: string;
}
