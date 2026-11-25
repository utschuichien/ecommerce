'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ShopProduct } from './shop-types';
import { formatVND } from '../../lib/api-client';
import { ProductImage } from '@/components/common/ProductImage';
import { useWishlistToggle } from '@/features/wishlist/hooks/useWishlist';

interface ShopProductCardProps {
  product: ShopProduct;
  onAddToCart?: (product: ShopProduct) => void;
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlistToggle();
  const isLiked = isWishlisted(product);

  const discountPercent =
    product.discountPercent ||
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null);

  const handleToggleLike = (e: React.MouseEvent) => {
    toggleWishlist(product, e);
  };

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      className="group bg-white border border-gray-100 hover:border-emerald-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer select-none relative"
    >
      <div>
        {/* Nút yêu thích góc phải */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={`absolute top-4 right-4 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isLiked
              ? 'text-rose-500 bg-rose-50'
              : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100/80'
          }`}
          title={isLiked ? 'Bỏ lưu' : 'Lưu sản phẩm'}
          aria-label="Yêu thích"
        >
          <Heart
            className="w-4 h-4"
            fill={isLiked ? 'currentColor' : 'none'}
            strokeWidth={1.8}
          />
        </button>

        {/* Khung ảnh vuông mềm mại */}
        <div className="relative aspect-square w-full bg-[#f8f9fa] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-2.5">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Thông tin: Tên sản phẩm */}
        <h4 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-1 group-hover:text-emerald-700 transition">
          {product.name}
        </h4>
      </div>

      {/* Cụm Giá bán & Huy hiệu giảm giá chuẩn mockup */}
      <div className="pt-2 sm:pt-2.5 flex items-end justify-between gap-1.5 border-t border-gray-50/80 mt-2">
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-bold text-gray-950 block leading-tight truncate">
            {formatVND(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price ? (
            <span className="text-[10px] sm:text-[11px] text-gray-400 line-through leading-tight block mt-0.5 truncate">
              {formatVND(product.oldPrice)}
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] text-transparent leading-tight block mt-0.5 select-none">
              &nbsp;
            </span>
          )}
        </div>

        {discountPercent ? (
          <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
            -{discountPercent}%
          </span>
        ) : null}
      </div>
    </Link>
  );
}
