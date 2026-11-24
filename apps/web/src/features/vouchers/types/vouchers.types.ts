export type VoucherScope = 'GLOBAL' | 'SHOP';
export type VoucherType = 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';

export interface VoucherShopInfo {
  id: string;
  name: string;
  slug: string;
}

export interface AvailableVoucher {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scope: VoucherScope;
  shop: VoucherShopInfo | null;
  type: VoucherType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  usagePerUser: number;
  usedByCurrentUser: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  unavailableReason: string | null;
}

export interface ValidateVoucherPayload {
  code: string;
}

export interface ValidateVoucherResponse {
  valid: boolean;
  voucher: {
    code: string;
    name: string;
    scope: VoucherScope;
    shopName: string | null;
    type: VoucherType;
  };
  discountAmount: number;
  subtotal: number;
  finalTotal: number;
  message: string;
}

