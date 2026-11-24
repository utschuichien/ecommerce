export interface CatalogCategory {
  id: string; // slug hoặc publicId
  numericId?: string;
  name: string;
  slug: string;
  position?: number;
  productCount: number;
}

export interface CatalogBrand {
  id: string; // tên thương hiệu hoặc slug
  name: string;
  slug: string;
  publicId?: string;
  logoKey?: string;
  productCount: number;
}

export interface CatalogProductItem {
  id: string;
  numericId?: string;
  name: string;
  slug: string;
  category: string;
  categoryName?: string;
  brand: string;
  brandSlug?: string;
  price: number;
  oldPrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  image: string;
  images?: string[];
  description?: string;
}

export interface CatalogProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  optionValues?: Record<string, any>;
}

export interface CatalogProductDetail extends CatalogProductItem {
  soldCount?: string;
  colors?: { name: string; hex: string }[];
  capacities?: string[];
  variants?: CatalogProductVariant[];
  shop?: {
    name: string;
    slug: string;
    logoKey?: string | null;
    enableFreeShipping?: boolean;
    freeShippingThreshold?: number | null;
    holidayMode?: boolean;
    holidayMessage?: string | null;
    enableReturn?: boolean;
    returnPeriodDays?: number;
    requireUnboxVideo?: boolean;
    returnPolicyNote?: string | null;
    warrantyType?: string | null;
    warrantyPeriodMonths?: number | null;
    warrantyPolicyNote?: string | null;
  } | null;
  brandDetail?: {
    name: string;
    slug: string;
    logoKey?: string | null;
  } | null;
  categoryDetail?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  features?: string[];
  specs?: Record<string, string>;
  reviews?: any[];
}

export interface CatalogProductsResponse {
  data: CatalogProductItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CatalogQueryParams {
  category?: string;
  brands?: string; // ngăn cách dấu phẩy: "apple,samsung"
  minPrice?: number;
  maxPrice?: number;
  stock?: 'all' | 'in_stock' | 'out_of_stock';
  search?: string;
  sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'bestseller';
  page?: number;
  limit?: number;
}
