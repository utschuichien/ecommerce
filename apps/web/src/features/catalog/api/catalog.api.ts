import { apiClient } from '../../../lib/api-client';
import { ApiStandardResponse } from '../../auth/types/auth.types';
import {
  CatalogCategory,
  CatalogBrand,
  CatalogProductsResponse,
  CatalogQueryParams,
  CatalogProductDetail,
} from '../types/catalog.types';

export const catalogApi = {
  /**
   * Lấy danh sách danh mục động kèm số lượng sản phẩm
   */
  async getCategories(): Promise<CatalogCategory[]> {
    const response = await apiClient.get<ApiStandardResponse<CatalogCategory[]>>('/catalog/categories');
    return response.data?.data || (response.data as unknown as CatalogCategory[]) || [];
  },

  /**
   * Lấy danh sách thương hiệu động (lọc theo danh mục nếu có)
   */
  async getBrands(category?: string): Promise<CatalogBrand[]> {
    const qs = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const response = await apiClient.get<ApiStandardResponse<CatalogBrand[]>>(`/catalog/brands${qs}`);
    return response.data?.data || (response.data as unknown as CatalogBrand[]) || [];
  },

  /**
   * Lấy danh sách sản phẩm theo bộ lọc đa chiều & phân trang
   */
  async getProducts(params: CatalogQueryParams = {}): Promise<CatalogProductsResponse> {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'all') {
      query.append('category', params.category);
    }
    if (params.brands) {
      query.append('brands', params.brands);
    }
    if (params.minPrice !== undefined && params.minPrice > 0) {
      query.append('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice < 50000000) {
      query.append('maxPrice', params.maxPrice.toString());
    }
    if (params.stock && params.stock !== 'all') {
      query.append('stock', params.stock);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.sort) {
      query.append('sort', params.sort);
    }
    if (params.page) {
      query.append('page', params.page.toString());
    }
    if (params.limit) {
      query.append('limit', params.limit.toString());
    }

    const qs = query.toString();
    const url = `/catalog/products${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<ApiStandardResponse<CatalogProductsResponse>>(url);
    return response.data?.data || (response.data as unknown as CatalogProductsResponse);
  },

  /**
   * Lấy chi tiết sản phẩm theo Slug
   */
  async getProductDetail(slug: string): Promise<CatalogProductDetail> {
    const response = await apiClient.get<ApiStandardResponse<CatalogProductDetail>>(`/catalog/products/${slug}`);
    return response.data?.data || (response.data as unknown as CatalogProductDetail);
  },
};
