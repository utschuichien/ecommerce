'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Sparkles,
  Dumbbell,
  Home as HomeIcon,
  BookOpen,
  LayoutGrid,
  MoreHorizontal,
  ChevronUp,
} from 'lucide-react';
import { useCategories } from '@/features/catalog/hooks/useCatalog';

interface HomeFeaturedCategoriesProps {
  onNavigateToCatalog?: () => void;
  className?: string;
}

// Ánh xạ icon và màu nền gradient pastel cho danh mục dựa trên slug hoặc tên
// (giữ nguyên như cũ; kích thước icon được ép nhỏ lại bằng [&>svg] ở component bên dưới)
export const getCategoryIconAndColor = (slugOrName: string) => {
  const lower = slugOrName.toLowerCase();
  if (lower.includes('phone') || lower.includes('dien-thoai')) {
    return {
      icon: <Smartphone className="w-6.5 h-6.5 text-blue-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-blue-100 to-blue-200/70 border border-blue-200/80 shadow-xs shadow-blue-500/10',
    };
  }
  if (lower.includes('laptop') || lower.includes('may-tinh')) {
    return {
      icon: <Laptop className="w-6.5 h-6.5 text-indigo-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200/70 border border-indigo-200/80 shadow-xs shadow-indigo-500/10',
    };
  }
  if (
    lower.includes('audio') ||
    lower.includes('am-thanh') ||
    lower.includes('dien-tu')
  ) {
    return {
      icon: <Headphones className="w-6.5 h-6.5 text-emerald-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200/70 border border-emerald-200/80 shadow-xs shadow-emerald-500/10',
    };
  }
  if (lower.includes('fashion') || lower.includes('thoi-trang')) {
    return {
      icon: <Shirt className="w-6.5 h-6.5 text-rose-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-rose-100 to-rose-200/70 border border-rose-200/80 shadow-xs shadow-rose-500/10',
    };
  }
  if (
    lower.includes('beauty') ||
    lower.includes('lam-dep') ||
    lower.includes('suc-khoe')
  ) {
    return {
      icon: <Sparkles className="w-6.5 h-6.5 text-fuchsia-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200/70 border border-fuchsia-200/80 shadow-xs shadow-fuchsia-500/10',
    };
  }
  if (lower.includes('sports') || lower.includes('the-thao')) {
    return {
      icon: <Dumbbell className="w-6.5 h-6.5 text-teal-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-teal-100 to-teal-200/70 border border-teal-200/80 shadow-xs shadow-teal-500/10',
    };
  }
  if (lower.includes('home') || lower.includes('gia-dung')) {
    return {
      icon: <HomeIcon className="w-6.5 h-6.5 text-amber-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-amber-100 to-amber-200/70 border border-amber-200/80 shadow-xs shadow-amber-500/10',
    };
  }
  if (lower.includes('book') || lower.includes('sach')) {
    return {
      icon: <BookOpen className="w-6.5 h-6.5 text-cyan-600" strokeWidth={1.9} />,
      bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200/70 border border-cyan-200/80 shadow-xs shadow-cyan-500/10',
    };
  }
  return {
    icon: <LayoutGrid className="w-6.5 h-6.5 text-emerald-600" strokeWidth={1.9} />,
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200/70 border border-emerald-200/80 shadow-xs shadow-emerald-500/10',
  };
};

// Kích thước dùng chung cho TẤT CẢ ô (danh mục, skeleton, nút Xem thêm) để hàng grid không bị kéo cao
const CARD_BASE =
  'flex flex-col items-center justify-center gap-1.5 text-center px-1.5 py-2.5 rounded-xl min-h-[88px] sm:min-h-[92px]';
const ICON_BOX = 'w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0';
const LABEL_BOX = 'w-full flex items-center justify-center min-h-[30px]';

export function HomeFeaturedCategories({
  onNavigateToCatalog,
  className = '',
}: HomeFeaturedCategoriesProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: serverCategories, isLoading } = useCategories();
  const categories = serverCategories || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const showSkeleton = !mounted || isLoading;

  return (
    <section className={`space-y-3 ${className}`}>
      {/* Header danh mục */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
        Danh mục nổi bật
      </h2>

      {/* Grid danh mục */}
      {showSkeleton ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`${CARD_BASE} bg-white shadow-2xs animate-pulse ${
                i >= 3 && i < 5 ? 'hidden sm:flex' : ''
              } ${i >= 5 ? 'hidden lg:flex' : ''}`}
            >
              <div className={`${ICON_BOX} bg-gray-100`} />
              <div className="h-3 w-14 bg-gray-200 rounded-md" />
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
          {categories.map((cat, index) => {
            const { icon, bg } = getCategoryIconAndColor(cat.slug || cat.name);
            const visibilityClass = !isExpanded
              ? index < 3
                ? 'flex'
                : index < 5
                ? 'hidden sm:flex'
                : index < 7
                ? 'hidden lg:flex'
                : 'hidden'
              : 'flex';

            return (
              <Link
                key={cat.id || cat.slug}
                href={`/products?category=${cat.slug}`}
                title={cat.name}
                className={`${visibilityClass} ${CARD_BASE} group bg-white border border-gray-100/70 hover:border-gray-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              >
                {/* [&>svg] ép icon về 20px mà không cần sửa hàm getCategoryIconAndColor */}
                <div className={`${ICON_BOX} ${bg} [&>svg]:w-5 [&>svg]:h-5`}>{icon}</div>

                <div className={LABEL_BOX}>
                  <span className="text-xs font-medium text-gray-800 leading-tight text-center line-clamp-2">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Nút Xem thêm / Thu gọn: cùng kích thước với các card khác */}
          {categories.length > 3 && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`${CARD_BASE} group bg-slate-50/70 border border-dashed border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              title={isExpanded ? 'Thu gọn danh mục' : 'Xem thêm tất cả danh mục'}
              aria-label={isExpanded ? 'Thu gọn danh mục' : 'Xem thêm tất cả danh mục'}
            >
              <div
                className={`${ICON_BOX} bg-white text-gray-500 shadow-2xs transition-colors`}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" strokeWidth={2.2} />
                ) : (
                  <MoreHorizontal className="w-5 h-5" strokeWidth={2.2} />
                )}
              </div>
              <div className={LABEL_BOX}>
                <span className="text-xs font-semibold text-gray-700 leading-tight text-center">
                  {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                </span>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-xs sm:text-sm text-gray-400 bg-white rounded-2xl shadow-2xs">
          Chưa có danh mục nào
        </div>
      )}
    </section>
  );
}