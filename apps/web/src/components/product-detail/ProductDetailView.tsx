'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Product, getProductBySlug } from '../mock/mock-data';
import { CatalogProductDetail } from '@/features/catalog/types/catalog.types';
import { useProductDetail } from '@/features/catalog/hooks/useCatalog';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductSellerCard } from './ProductSellerCard';
import { ProductTabs } from './ProductTabs';
import { ProductRelated } from './ProductRelated';

export interface ProductDetailViewProps {
  slug: string;
  product?: Product | CatalogProductDetail;
  onAddToCart?: (
    product: any,
    quantity: number,
    options: { color?: string; capacity?: string }
  ) => void;
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6 pb-16 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-52 bg-gray-100 rounded" />

      {/* Top 3 Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Cột 1: Gallery skeleton - 5 cột */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-gray-100 rounded-md" />
            ))}
          </div>
          <div className="flex-1 aspect-square bg-gray-100 rounded-lg" />
        </div>

        {/* Cột 2: Info skeleton - 4 cột */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-7 w-4/5 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
          <div className="h-9 w-44 bg-gray-200 rounded" />
          <div className="h-16 w-full bg-gray-100 rounded-lg" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
          <div className="h-11 w-full bg-gray-200 rounded-lg" />
        </div>

        {/* Cột 3: Seller skeleton - 3 cột */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <div className="h-3.5 bg-gray-100 rounded" />
              <div className="h-3.5 bg-gray-100 rounded" />
              <div className="h-3.5 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailView({
  slug,
  product: initialProduct,
  onAddToCart,
}: ProductDetailViewProps) {
  // Lấy chi tiết sản phẩm từ API Catalog theo Slug
  const { data: apiProduct, isLoading } = useProductDetail(slug);

  // Chỉ dùng dữ liệu thực từ API hoặc initialProduct
  const product = apiProduct || initialProduct;

  const handleAddToCart = (
    prod: any,
    qty: number,
    options: { color?: string; capacity?: string }
  ) => {
    onAddToCart?.(prod, qty, options);
  };

  // Trạng thái đang tải dữ liệu
  if (isLoading && !product) {
    return <ProductDetailSkeleton />;
  }

  // Trạng thái không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center text-center space-y-4 py-16">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md">
          Sản phẩm bạn đang tìm kiếm có thể đã hết hàng hoặc đường dẫn không tồn tại trên hệ thống.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh mục sản phẩm</span>
        </Link>
      </div>
    );
  }

  const categoryLabel =
    (product as any).categoryName ||
    (product as any).subCategory ||
    (typeof product.category === 'string' ? product.category : 'Sản phẩm');

  const categoryHref =
    typeof product.category === 'string' && product.category !== 'other'
      ? `/products?category=${product.category}`
      : '/products';

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          {
            label: categoryLabel,
            href: categoryHref,
          },
          {
            label: product.name,
          },
        ]}
      />

      {/* 3. Phần thông tin chính phía trên (Top Showcase Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Cột 1: Thư viện hình ảnh sản phẩm (Gallery) - 5 cột */}
        <div className="lg:col-span-5 w-full">
          <ProductGallery
            images={product.images && product.images.length > 0 ? product.images : [product.image]}
            productName={product.name}
            badge={(product as any).badge}
            badgeColor={(product as any).badgeColor}
          />
        </div>

        {/* Cột 2: Thông tin & Lựa chọn biến thể mua hàng (Info & Action) - 4 cột */}
        <div className="lg:col-span-4 w-full">
          <ProductInfo product={product} onAddToCart={handleAddToCart} />
        </div>

        {/* Cột 3: Gian hàng & Ưu đãi mua kèm (Seller & Cross-sell) - 3 cột */}
        <div className="lg:col-span-3 w-full">
          <ProductSellerCard
            brand={typeof product.brand === 'string' ? product.brand : (product as any).brand?.name}
            shop={(product as any).shop}
          />
        </div>
      </div>

      {/* 4. Phần thông tin chi tiết phía dưới (Bottom Detail Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-4">
        {/* Cột trái: Hệ thống Tabs (Tính năng, Mô tả, Thông số, Đánh giá, Hỏi đáp) - 8 cột */}
        <div className="lg:col-span-8 w-full">
          <ProductTabs product={product} />
        </div>

        {/* Cột phải: Sản phẩm liên quan (Related Products) - 4 cột */}
        <div className="lg:col-span-4 w-full">
          <ProductRelated
            currentProductId={product.id}
            category={typeof product.category === 'string' ? product.category : undefined}
          />
        </div>
      </div>
    </div>
  );
}
