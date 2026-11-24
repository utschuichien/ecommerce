import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';
import {
  CartResponse,
  AddToCartDto,
  UpdateCartItemDto,
} from '../types/cart.types';

export const cartApi = {
  /**
   * Lấy chi tiết giỏ hàng của người dùng hiện tại (được gom nhóm theo Shop)
   */
  async getCart(): Promise<CartResponse> {
    const response = await apiClient.get<ApiStandardResponse<CartResponse>>('/cart');
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Thêm sản phẩm hoặc biến thể vào giỏ hàng
   */
  async addToCart(dto: AddToCartDto): Promise<CartResponse> {
    const response = await apiClient.post<ApiStandardResponse<CartResponse>>('/cart/items', dto);
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Cập nhật số lượng của một biến thể trong giỏ
   */
  async updateQuantity(variantId: string, quantity: number): Promise<CartResponse> {
    const response = await apiClient.patch<ApiStandardResponse<CartResponse>>(
      `/cart/items/${variantId}`,
      { quantity } satisfies UpdateCartItemDto
    );
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Chọn hoặc bỏ chọn một sản phẩm trong giỏ hàng (lưu vào database)
   */
  async toggleItemSelection(variantId: string, selected: boolean): Promise<CartResponse> {
    const response = await apiClient.patch<ApiStandardResponse<CartResponse>>(
      `/cart/items/${variantId}/select`,
      { selected }
    );
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Chọn hoặc bỏ chọn tất cả sản phẩm (hoặc lọc theo Shop)
   */
  async toggleSelectAll(selected: boolean, shopId?: string): Promise<CartResponse> {
    const response = await apiClient.patch<ApiStandardResponse<CartResponse>>(
      '/cart/select-all',
      { selected, shopId }
    );
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Xóa một biến thể khỏi giỏ hàng
   */
  async removeItem(variantId: string): Promise<CartResponse> {
    const response = await apiClient.delete<ApiStandardResponse<CartResponse>>(
      `/cart/items/${variantId}`
    );
    return response.data?.data || (response.data as unknown as CartResponse);
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   */
  async clearCart(): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiStandardResponse<{ message: string }>>('/cart/clear');
    return response.data?.data || (response.data as unknown as { message: string });
  },
};

