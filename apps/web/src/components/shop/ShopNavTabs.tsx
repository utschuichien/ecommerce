'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ShopTabType } from './shop-types';

interface ShopNavTabsProps {
  activeTab: ShopTabType;
  onTabChange: (tab: ShopTabType) => void;
  categories?: Array<{ id: string; name: string; slug: string }>;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  productsCount?: number;
  reviewsCount?: string;
}

export function ShopNavTabs({
  activeTab,
  onTabChange,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
}: ShopNavTabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tự động đóng dropdown khi click ra ngoài mà không gây giật lag
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Danh mục hiển thị: Ưu tiên dữ liệu thực từ shop, fallback các danh mục công nghệ chuẩn
  const defaultCategories = [
    { id: 'phones', name: 'Điện thoại', slug: 'phones' },
    { id: 'laptops', name: 'Laptop', slug: 'laptops' },
    { id: 'accessories', name: 'Phụ kiện', slug: 'accessories' },
    { id: 'smart-devices', name: 'Thiết bị thông minh', slug: 'smart-devices' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  const primaryCategories = displayCategories.slice(0, 4);
  const remainingCategories = displayCategories.slice(4);

  const handleSelectCategory = (catSlug: string) => {
    onCategoryChange?.(catSlug);
    setIsDropdownOpen(false);
    if (activeTab !== 'products') {
      onTabChange('products');
    }
  };

  return (
    <div className="relative z-20 border-b border-gray-100/90 pt-1">
      <nav
        aria-label="Điều hướng danh mục gian hàng"
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto sm:overflow-visible scrollbar-none px-2 sm:px-4"
      >
        {/* Tab 1: Tất cả sản phẩm (Mặc định) */}
        <button
          type="button"
          onClick={() => {
            onCategoryChange?.('all');
            onTabChange('home');
          }}
          className={`py-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
            activeTab === 'home' || (activeTab === 'products' && selectedCategory === 'all')
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-emerald-700 font-medium'
          }`}
        >
          <span>Tất cả sản phẩm</span>
        </button>

        {/* Các danh mục chính (Điện thoại, Laptop, Phụ kiện, ...) */}
        {primaryCategories.map((cat) => {
          const isCatActive =
            activeTab === 'products' && selectedCategory === (cat.slug || cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.slug || cat.id)}
              className={`py-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                isCatActive
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-gray-500 hover:text-emerald-700 font-medium'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}

        {/* Tab Bán chạy */}
        <button
          type="button"
          onClick={() => onTabChange('bestseller')}
          className={`py-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
            activeTab === 'bestseller'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-emerald-700 font-medium'
          }`}
        >
          <span>Bán chạy</span>
        </button>

        {/* Tab Đánh giá */}
        <button
          type="button"
          onClick={() => onTabChange('reviews')}
          className={`py-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-emerald-700 font-medium'
          }`}
        >
          <span>Đánh giá</span>
        </button>

        {/* Tab Chính sách */}
        <button
          type="button"
          onClick={() => onTabChange('policies')}
          className={`py-3 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] ${
            activeTab === 'policies'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-emerald-700 font-medium'
          }`}
        >
          <span>Chính sách</span>
        </button>

        {/* Dropdown danh mục Khác (nếu có hơn 4 danh mục) */}
        {remainingCategories.length > 0 && (
          <div ref={dropdownRef} className="relative py-1">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`py-2 text-xs sm:text-[13px] whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[1px] font-medium inline-flex items-center gap-1 ${
                isDropdownOpen
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-emerald-700'
              }`}
              aria-expanded={isDropdownOpen}
            >
              <span>Khác</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-emerald-700' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50">
                {remainingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug || cat.id)}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-emerald-50/60 hover:text-emerald-700 transition"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
