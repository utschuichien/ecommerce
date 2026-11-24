import { apiClient } from '@/lib/api-client';
import { InventoryItemRecord } from '@/components/seller/modals';

export interface SellerInventoryStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalStockQuantity: string;
}

export interface SellerInventoryQueryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  stockLevel?: string;
}

export interface SellerInventoryResponse {
  items: InventoryItemRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdjustStockPayload {
  itemId: string;
  newStock: number;
  reason?: string;
}

export const sellerInventoryApi = {
  /**
   * Lấy 4 thẻ thống kê kho hàng
   */
  async getStats(): Promise<SellerInventoryStats> {
    const response = await apiClient.get<SellerInventoryStats>('/seller/inventory/stats');
    return response.data;
  },

  /**
   * Lấy danh sách tồn kho (phân trang, lọc theo trạng thái/danh mục/tìm kiếm)
   */
  async getInventory(params: SellerInventoryQueryParams = {}): Promise<SellerInventoryResponse> {
    const response = await apiClient.get<SellerInventoryResponse>('/seller/inventory', { params });
    return response.data;
  },

  /**
   * Điều chỉnh số lượng tồn kho của 1 sản phẩm / variant
   */
  async adjustStock(payload: AdjustStockPayload): Promise<{
    success: boolean;
    itemId: string;
    newStock: number;
    message: string;
  }> {
    const response = await apiClient.post('/seller/inventory/adjust', payload);
    return response.data;
  },
};

