'use client';

import React from 'react';
import { Heart, Star } from 'lucide-react';
import { Product } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';
import { ProductBadge } from './ProductBadge';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div
      onClick={() => onSelect?.(product)}
      className="group relative bg-white border border-[#E8EEF0] rounded-[18px] overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top badges & Favorite button: Tràn viền 3 phía */}
      <div className="relative w-full aspect-square bg-[#F7F9FA] overflow-hidden">
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <ProductBadge badge={product.badge} badgeColor={product.badgeColor} />
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-gray-700 hover:text-rose-500 hover:bg-white transition z-10 cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition mb-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-800">{product.rating}</span>
            <span>({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="text-sm font-bold text-gray-950">
            {formatVND(product.price)}
          </div>
          {product.oldPrice && (
            <div className="text-[11px] text-gray-400 line-through">
              {formatVND(product.oldPrice)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
