import { apiClient } from '@/lib/api-client';

export interface SellerVoucherRecord {
  id: string; // publicId
  code: string;
  name: string;
  description?: string;
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
  status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

export interface SellerVoucherStats {
  total: number;
  active: number;
  upcoming: number;
  expired: number;
  disabled: number;
  totalUsages: number;
}

export interface SellerVouchersQueryParams {
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED';
  page?: number;
  limit?: number;
}

export interface SellerVouchersResponse {
  items: SellerVoucherRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  stats: SellerVoucherStats;
}

export interface CreateSellerVoucherPayload {
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
  isActive?: boolean;
}

export interface UpdateSellerVoucherPayload extends Partial<CreateSellerVoucherPayload> {}

export const sellerVouchersApi = {
  /**
   * Lấy danh sách voucher của Shop
   */
  async getVouchers(params: SellerVouchersQueryParams = {}): Promise<SellerVouchersResponse> {
    const response = await apiClient.get<SellerVouchersResponse>('/seller/vouchers', { params });
    return response.data;
  },

  /**
   * Tạo voucher mới cho Shop
   */
  async createVoucher(
    payload: CreateSellerVoucherPayload,
  ): Promise<{ success: boolean; message: string; voucher: SellerVoucherRecord }> {
    const response = await apiClient.post('/seller/vouchers', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin voucher
   */
  async updateVoucher(
    id: string,
    payload: UpdateSellerVoucherPayload,
  ): Promise<{ success: boolean; message: string; voucher: SellerVoucherRecord }> {
    const response = await apiClient.patch(`/seller/vouchers/${id}`, payload);
    return response.data;
  },

  /**
   * Bật / Tắt trạng thái hoạt động của voucher
   */
  async toggleStatus(
    id: string,
    isActive: boolean,
  ): Promise<{ success: boolean; message: string; voucher: SellerVoucherRecord }> {
    const response = await apiClient.patch(`/seller/vouchers/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Xóa hoặc tạm dừng voucher
   */
  async deleteVoucher(
    id: string,
  ): Promise<{ success: boolean; message: string; isDeactivated?: boolean }> {
    const response = await apiClient.delete(`/seller/vouchers/${id}`);
    return response.data;
  },
};

