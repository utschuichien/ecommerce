'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Heart, ArrowRight } from 'lucide-react';
import { Product, RELATED_PRODUCTS } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';
import { ProductImage } from '@/components/common/ProductImage';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalog';
import { useWishlistToggle } from '@/features/wishlist/hooks/useWishlist';

interface ProductRelatedProps {
  currentProductId?: string;
  category?: string;
  onSelectProduct?: (product: any) => void;
}

export function ProductRelated({
  currentProductId,
  category,
  onSelectProduct,
}: ProductRelatedProps) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlistToggle();

  // Tải sản phẩm liên quan thực tế từ API theo danh mục
  const { data: catalogData } = useCatalogProducts({
    category: category && category !== 'all' ? category : undefined,
    limit: 6,
  });

  // Chỉ lấy dữ liệu thật từ API, không dùng mock
  const products = (catalogData?.data || [])
    .filter((p) => p.id !== currentProductId && p.slug !== currentProductId)
    .slice(0, 3);

  const handleProductClick = (product: any) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      router.push(`/products/${product.slug}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-lg p-4 sm:p-4.5 shadow-2xs space-y-3.5">
      {/* Header card */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">
          Sản phẩm liên quan
        </h3>
        <Link
          href="/products"
          className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Danh sách sản phẩm liên quan thực tế */}
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((item) => {
            const isFav = isWishlisted(item);

            return (
              <div
                key={item.id}
                onClick={() => handleProductClick(item)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/80 transition-all cursor-pointer border border-transparent hover:border-gray-200/60 group"
              >
                {/* Ảnh sản phẩm thu nhỏ tràn viền (Full border) */}
                <div className="w-14 h-14 sm:w-15 sm:h-15 shrink-0 rounded-md overflow-hidden border border-gray-200/80 bg-white relative">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-xs font-medium text-gray-800 group-hover:text-emerald-600 transition truncate">
                    {item.name}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-700">{item.rating}</span>
                    <span>({item.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-xs font-bold text-gray-900">
                      {formatVND(item.price)}
                    </span>
                    {item.discountPercent && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 py-0.2 rounded">
                        -{item.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút tim */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(item, e)}
                  className={`p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer shrink-0 ${
                    isFav ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-400 italic">
          Chưa có sản phẩm liên quan nào.
        </div>
      )}
    </div>
  );
}
