'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { ProductBadge } from '../catalog/ProductBadge';
import { ProductImage } from '@/components/common/ProductImage';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue';
}

export function ProductGallery({
  images,
  productName,
  badge,
  badgeColor,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Đảm bảo luôn có ít nhất 1 ảnh hợp lệ
  const galleryImages =
    images && images.length > 0 && images.some(Boolean)
      ? images
      : [DEFAULT_PRODUCT_IMAGE];
  const activeImage = galleryImages[selectedIndex] || galleryImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 lg:gap-3.5 items-start w-full">
      {/* 1. Dải ảnh thu nhỏ (Vertical thumbnails on left) */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible w-full sm:w-16 lg:w-18 shrink-0 py-0.5 sm:py-0">
        {galleryImages.slice(0, 4).map((img, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 shrink-0 rounded-md overflow-hidden bg-white transition-all cursor-pointer border ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-gray-200/80 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          );
        })}

        {/* Thumbnail thứ 5 kèm nhãn "+3" nếu có nhiều hơn 4 ảnh */}
        {galleryImages.length > 4 && (
          <button
            type="button"
            onClick={() => setSelectedIndex(4)}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 shrink-0 rounded-md overflow-hidden bg-gray-900 transition-all cursor-pointer border ${
              selectedIndex >= 4
                ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ProductImage
              src={galleryImages[4]}
              alt="Xem thêm ảnh"
              className="w-full h-full object-cover opacity-50"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-medium text-xs">
              +{galleryImages.length - 4}
            </div>
          </button>
        )}
      </div>

      {/* 2. Khung xem ảnh lớn chính (Main Image Preview - Full viền, bo góc ít rounded-lg) */}
      <div className="relative flex-1 w-full aspect-square rounded-lg border border-gray-200/90 overflow-hidden bg-white shadow-2xs group flex items-center justify-center">
        {/* Badge "Bán chạy" / "Mới" góc trên bên trái */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <ProductBadge badge={badge} badgeColor={badgeColor} />
          </div>
        )}

        {/* Nút lùi ảnh (Prev) */}
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 z-10 backdrop-blur-xs"
            title="Ảnh trước"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" strokeWidth={2} />
          </button>
        )}

        {/* Ảnh chính to tràn viền (Full border) */}
        <ProductImage
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />

        {/* Nút tiến ảnh (Next) */}
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 z-10 backdrop-blur-xs"
            title="Ảnh tiếp theo"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" strokeWidth={2} />
          </button>
        )}

        {/* Các chấm phân trang ở dưới cùng (Pagination Dots dạng pill tinh tế) */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-xs z-10">
            {galleryImages.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setSelectedIndex(dotIdx)}
                className={`transition-all rounded-full cursor-pointer ${
                  selectedIndex === dotIdx
                    ? 'w-2 h-2 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                title={`Chuyển đến ảnh ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
