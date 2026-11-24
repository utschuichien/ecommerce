import { apiClient } from '@/lib/api-client';

export interface SellerShopProfile {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  bannerUrl?: string;
  slogan?: string;
  brandStory?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'CLOSED';
  flatShippingFee: number;
  enableFreeShipping?: boolean;
  freeShippingThreshold?: number;
  pickupContactName?: string;
  pickupPhone?: string;
  pickupAddress?: string;
  pickupNote?: string;
  supportedCarriers?: string;
  allowInspection?: boolean;
  dispatchTime?: string;
  allowOrders: boolean;
  showOutOfStock: boolean;
  requireAuthCheckout: boolean;
  operatingType: 'always' | 'custom';
  openTime: string;
  closeTime: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSellerShopPayload {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoKey?: string;
  bannerUrl?: string;
  slogan?: string;
  brandStory?: string;
  flatShippingFee?: number;
  enableFreeShipping?: boolean;
  freeShippingThreshold?: number;
  pickupContactName?: string;
  pickupPhone?: string;
  pickupAddress?: string;
  pickupNote?: string;
  supportedCarriers?: string;
  allowInspection?: boolean;
  dispatchTime?: string;
  allowOrders?: boolean;
  showOutOfStock?: boolean;
  requireAuthCheckout?: boolean;
  operatingType?: 'always' | 'custom';
  openTime?: string;
  closeTime?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
}

export const sellerShopApi = {
  /**
   * Lấy thông tin & cấu hình cửa hàng hiện tại
   */
  async getShopProfile(): Promise<SellerShopProfile> {
    const res = await apiClient.get('/seller/shop');
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật thông tin & cấu hình cửa hàng
   */
  async updateShopProfile(
    payload: UpdateSellerShopPayload,
  ): Promise<SellerShopProfile> {
    const res = await apiClient.put('/seller/shop', payload);
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật trạng thái mở cửa / đóng cửa
   */
  async updateShopStatus(
    status: 'ACTIVE' | 'CLOSED',
  ): Promise<{ success: boolean; status: string; message: string }> {
    const res = await apiClient.patch('/seller/shop/status', { status });
    return res.data?.data || res.data;
  },

  /**
   * Tải ảnh logo cửa hàng lên Cloudinary
   */
  async uploadLogo(file: File): Promise<{ url: string; secureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/seller/shop/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  /**
   * Tải ảnh banner / ảnh bìa cửa hàng lên Cloudinary
   */
  async uploadBanner(file: File): Promise<{ url: string; secureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/seller/shop/upload-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },
};

