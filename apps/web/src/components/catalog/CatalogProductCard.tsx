'use client';

import React, { useState } from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';
import { ProductBadge } from './ProductBadge';
import { ProductImage } from '@/components/common/ProductImage';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useAddToCart } from '@/features/cart';
import { useWishlistToggle } from '@/features/wishlist/hooks/useWishlist';
import { extractErrorMessage } from '../../lib/api-client';

interface CatalogProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function CatalogProductCard({
  product,
  viewMode = 'grid',
  onSelect,
  onAddToCart,
}: CatalogProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlistToggle();
  const isFavorite = isWishlisted(product);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCartMutation = useAddToCart();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    toggleWishlist(product, e);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCartMutation.mutate(
        {
          variantId: (product as any).variants?.[0]?.id || (product as any).variantId,
          productSlug: product.slug || product.id,
          quantity: 1,
        },
        {
          onSuccess: () => {
            toast.success('Đã thêm vào giỏ hàng', {
              description: product.name,
            });
          },
          onError: (err) => {
            toast.error('Thêm vào giỏ thất bại', {
              description: extractErrorMessage(err, 'Không thể thêm sản phẩm vào giỏ hàng.'),
            });
          },
        }
      );
    }
  };

  // Helper định dạng số lượt đánh giá (VD: 12500 -> 12.5k)
  const formatReviewsCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return count.toString();
  };

  // -------------------------------------------------------------
  // LIST VIEW: Hiển thị dạng danh sách nằm ngang
  // -------------------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect?.(product)}
        className="group bg-white border border-gray-100/90 rounded-2xl p-3 sm:p-3.5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 cursor-pointer"
      >
        {/* Ảnh sản phẩm hình vuông tỷ lệ 1:1 */}
        <div className="relative w-full h-44 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0 bg-[#F7F9FA] rounded-xl overflow-hidden flex items-center justify-center p-2">
          {product.badge && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <ProductBadge badge={product.badge} badgeColor={product.badgeColor} />
            </div>
          )}
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 select-none"
            loading="lazy"
          />
        </div>

        {/* Thông tin ở giữa */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-semibold text-gray-800">{product.rating}</span>
            <span>({formatReviewsCount(product.reviewsCount)} đánh giá)</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">{product.soldCount || 'Đã bán 1k+'}</span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition line-clamp-2 sm:truncate">
            {product.name}
          </h3>

          <div className="text-xs text-gray-500">
            <span>Thương hiệu: </span>
            <span className="font-medium text-gray-700">{product.brand}</span>
          </div>
        </div>

        {/* Giá & Thao tác bên phải */}
        <div className="flex flex-col sm:items-end justify-between gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100/80">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-base sm:text-lg font-bold text-emerald-600">
                {formatVND(product.price)}
              </span>
              {product.discountPercent && (
                <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  -{product.discountPercent}%
                </span>
              )}
            </div>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-200/70 bg-white hover:bg-gray-50 flex items-center justify-center transition cursor-pointer shrink-0 ${
                isFavorite ? 'text-rose-500 border-rose-200 bg-rose-50/50' : 'text-gray-400'
              }`}
              title="Yêu thích"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                strokeWidth={1.8}
              />
            </button>
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 h-9 sm:h-10 rounded-xl transition active:scale-95 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GRID VIEW: Hiển thị dạng thẻ chuẩn xác theo thiết kế mẫu
  // -------------------------------------------------------------
  return (
    <div
      onClick={() => onSelect?.(product)}
      className="group relative pb-1 bg-white border border-gray-100/90 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. KHU VỰC ẢNH SẢN PHẨM: Tràn hết viền ra 3 phía (Top, Left, Right), Tỷ lệ chuẩn 1:1 */}
      <div className="relative w-full aspect-[6/5] bg-[#F7F9FA] overflow-hidden">
        {/* Badge góc trên bên trái */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <ProductBadge badge={product.badge} badgeColor={product.badgeColor} />
          </div>
        )}

        {/* Nút Yêu thích (Heart) tròn góc trên bên phải nhỏ gọn */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full backdrop-blur-xs transition cursor-pointer shrink-0 border ${
            isFavorite
              ? 'text-rose-500 bg-rose-50/90 border-rose-200 shadow-2xs'
              : 'text-gray-700 bg-white/95 border-gray-200/90 shadow-2xs hover:text-rose-500 hover:border-rose-200'
          }`}
          title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-700 stroke-[1.8]'
            }`}
          />
        </button>

        {/* Ảnh sản phẩm lấp đầy tràn viền 3 phía không bị khoảng trống */}
        <ProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
          loading="lazy"
        />

        {/* Chấm phân trang ảnh (Dots indicator) */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 transition-all shadow-xs" />
            <span className="w-1 h-1 rounded-full bg-gray-300 transition-all shadow-xs" />
            <span className="w-1 h-1 rounded-full bg-gray-300 transition-all shadow-xs" />
          </div>
        )}
      </div>

      {/* 2. THÔNG TIN CHI TIẾT SẢN PHẨM: Đệm đều phía dưới */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        {/* Tên sản phẩm (2 dòng vừa vặn) */}
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2 min-h-[34px] sm:min-h-[40px] group-hover:text-emerald-600 transition mb-1">
          {product.name}
        </h3>

        {/* Đánh giá & Số lượng đã bán: ⭐ 4.8 (12.5k đánh giá) | Đã bán 50k+ */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 whitespace-nowrap overflow-hidden">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-semibold text-gray-800">{product.rating}</span>
          <span className="text-gray-500">
            ({formatReviewsCount(product.reviewsCount)})
          </span>
          <span className="text-gray-300 font-light mx-0.5">|</span>
          <span className="text-gray-500 truncate">{product.soldCount || 'Đã bán 1k+'}</span>
        </div>

        {/* Giá bán & Giảm giá */}
        <div className="flex items-baseline gap-1.5 mb-2 sm:mb-2.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-emerald-600 leading-none">
            {formatVND(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through leading-none">
              {formatVND(product.oldPrice)}
            </span>
          )}
          {product.discountPercent && (
            <span className="ml-auto text-[11px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded leading-none">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* 3. NÚT HÀNH ĐỘNG: Thêm vào giỏ hàng tràn chiều rộng gọn gàng, tinh tế */}
        <button
          type="button"
          onClick={handleAddToCartClick}
          className="w-full h-8 sm:h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold px-2.5 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  );
}
