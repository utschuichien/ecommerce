import { apiClient } from '@/lib/api-client';
import { ProductItem, ProductVariantItem, ProductCategory } from '@/components/seller/seller-types';

export interface SellerProductStats {
  total: number;
  active: number;
  outOfStock: number;
  hidden: number;
}

export interface SellerProductsQueryParams {
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SellerProductsResponse {
  items: ProductItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateProductPayload {
  name: string;
  subtitle?: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  variants?: ProductVariantItem[];
  status?: 'ACTIVE' | 'HIDDEN';
}

export interface UpdateProductPayload {
  name?: string;
  subtitle?: string;
  sku?: string;
  category?: string;
  price?: number;
  stock?: number;
  image?: string;
  images?: string[];
  variants?: ProductVariantItem[];
  status?: 'ACTIVE' | 'HIDDEN';
}

export const sellerProductsApi = {
  /**
   * Đăng ký hoặc kích hoạt kênh người bán (Role SELLER)
   */
  async registerSeller(): Promise<{ success: boolean; message: string; shop: any; roles: string[] }> {
    const res = await apiClient.post('/seller/register');
    return res.data?.data || res.data;
  },

  /**
   * Tải 1 ảnh sản phẩm lên Cloudinary
   */
  async uploadImage(file: File): Promise<{ url: string; secureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/seller/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  /**
   * Tải đồng thời nhiều ảnh lên Cloudinary
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const results = await Promise.all(files.map((file) => this.uploadImage(file)));
    return results.map((res) => res.secureUrl || res.url);
  },

  /**
   * Lấy danh sách danh mục sản phẩm từ Database
   */
  async getCategories(): Promise<ProductCategory[]> {
    const res = await apiClient.get('/seller/categories');
    return res.data?.data || res.data;
  },

  /**
   * Lấy 4 chỉ số thống kê trên cùng
   */
  async getStats(): Promise<SellerProductStats> {
    const res = await apiClient.get('/seller/products/stats');
    return res.data?.data || res.data;
  },

  /**
   * Lấy danh sách sản phẩm theo bộ lọc & phân trang
   */
  async getProducts(
    params: SellerProductsQueryParams = {},
  ): Promise<SellerProductsResponse> {
    const res = await apiClient.get('/seller/products', { params });
    return res.data?.data || res.data;
  },

  /**
   * Lấy chi tiết sản phẩm
   */
  async getProductDetail(id: string): Promise<ProductItem> {
    const res = await apiClient.get(`/seller/products/${id}`);
    return res.data?.data || res.data;
  },

  /**
   * Tạo mới sản phẩm
   */
  async createProduct(payload: CreateProductPayload): Promise<ProductItem> {
    const res = await apiClient.post('/seller/products', payload);
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  async updateProduct(
    id: string,
    payload: UpdateProductPayload,
  ): Promise<ProductItem> {
    const res = await apiClient.put(`/seller/products/${id}`, payload);
    return res.data?.data || res.data;
  },

  /**
   * Bật / Tắt trạng thái bán
   */
  async toggleStatus(
    id: string,
    status: 'ACTIVE' | 'HIDDEN',
  ): Promise<{ success: boolean; status: string; message: string }> {
    const res = await apiClient.patch(`/seller/products/${id}/status`, { status });
    return res.data?.data || res.data;
  },

  /**
   * Xóa mềm sản phẩm
   */
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/seller/products/${id}`);
    return res.data?.data || res.data;
  },
};
