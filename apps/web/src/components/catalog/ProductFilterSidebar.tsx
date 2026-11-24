'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Sparkles,
  Compass,
  Home as HomeIcon,
  BookOpen,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useCategories, useBrands } from '@/features/catalog/hooks/useCatalog';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  stock: 'all' | 'in_stock' | 'out_of_stock';
}

interface ProductFilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

// Icon mapper cho danh mục
const getCategoryIcon = (slugOrId: string) => {
  const lower = slugOrId.toLowerCase();
  if (lower.includes('phone') || lower.includes('dien-thoai')) return Smartphone;
  if (lower.includes('laptop') || lower.includes('may-tinh')) return Laptop;
  if (lower.includes('audio') || lower.includes('am-thanh') || lower.includes('dien-tu')) return Headphones;
  if (lower.includes('fashion') || lower.includes('thoi-trang')) return Shirt;
  if (lower.includes('beauty') || lower.includes('lam-dep') || lower.includes('suc-khoe')) return Sparkles;
  if (lower.includes('sports') || lower.includes('the-thao')) return Compass;
  if (lower.includes('home') || lower.includes('gia-dung')) return HomeIcon;
  if (lower.includes('book') || lower.includes('sach')) return BookOpen;
  return LayoutGrid;
};

// Các khoảng giá phổ biến gợi ý chọn nhanh
const PRICE_PRESETS = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 5 triệu', min: 2000000, max: 5000000 },
  { label: '5 - 15 triệu', min: 5000000, max: 15000000 },
  { label: '15 - 30 triệu', min: 15000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: 50000000 },
];

export function ProductFilterSidebar({
  filters,
  onChange,
  isOpenMobile = false,
  onCloseMobile,
}: ProductFilterSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Local state cho khoảng giá để kéo slider & gõ phím mượt mà, không trigger reload trang liên tục
  const [localMinPrice, setLocalMinPrice] = useState<number>(filters.minPrice || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState<number>(filters.maxPrice || 50000000);

  // Đồng bộ khi filters thay đổi từ ngoài (URL hoặc nút đặt lại)
  useEffect(() => {
    setLocalMinPrice(filters.minPrice || 0);
    setLocalMaxPrice(filters.maxPrice || 50000000);
  }, [filters.minPrice, filters.maxPrice]);

  const isPriceFiltered = filters.minPrice > 0 || filters.maxPrice < 50000000;
  const isDirtyPrice = localMinPrice !== filters.minPrice || localMaxPrice !== filters.maxPrice;

  const handleApplyPrice = () => {
    let min = Math.max(0, localMinPrice);
    let max = Math.max(min, localMaxPrice);
    if (max <= 0) max = 50000000;
    setLocalMinPrice(min);
    setLocalMaxPrice(max);
    onChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleSelectPreset = (presetMin: number, presetMax: number) => {
    setLocalMinPrice(presetMin);
    setLocalMaxPrice(presetMax);
    onChange({
      ...filters,
      minPrice: presetMin,
      maxPrice: presetMax,
    });
  };

  const handleResetPrice = () => {
    setLocalMinPrice(0);
    setLocalMaxPrice(50000000);
    onChange({
      ...filters,
      minPrice: 0,
      maxPrice: 50000000,
    });
  };

  // 1. Lấy danh mục động từ Database
  const { data: serverCategories, isLoading: isCategoriesLoading } = useCategories();

  // 2. Lấy thương hiệu động (lọc theo danh mục đang chọn - Phương án B)
  const { data: serverBrands, isLoading: isBrandsLoading } = useBrands(filters.category);

  // Đảm bảo khớp HTML giữa Server SSR và Client Hydration
  const isCategoriesLoadingState = !mounted || isCategoriesLoading;
  const isBrandsLoadingState = !mounted || isBrandsLoading;

  const handleCategorySelect = (catId: string) => {
    // Khi đổi danh mục, reset thương hiệu đã chọn để tránh mismatch
    onChange({ ...filters, category: catId, brands: [] });
  };

  const handleBrandToggle = (brandName: string) => {
    const nextBrands = filters.brands.includes(brandName)
      ? filters.brands.filter((b) => b !== brandName)
      : [...filters.brands, brandName];
    onChange({ ...filters, brands: nextBrands });
  };

  const handleStockChange = (stock: 'all' | 'in_stock' | 'out_of_stock') => {
    onChange({ ...filters, stock });
  };

  const handleResetFilters = () => {
    onChange({
      category: 'all',
      minPrice: 0,
      maxPrice: 50000000,
      brands: [],
      stock: 'all',
    });
  };

  // Tính tổng số sản phẩm cho mục "Tất cả danh mục"
  const totalCategoryProducts = (serverCategories || []).reduce(
    (acc, cat) => acc + (cat.productCount || 0),
    0,
  );

  const categoryList = [
    {
      id: 'all',
      name: 'Tất cả danh mục',
      count: totalCategoryProducts,
      icon: LayoutGrid,
    },
    ...((serverCategories && serverCategories.length > 0)
      ? serverCategories.map((c) => ({
          id: c.slug,
          name: c.name,
          count: c.productCount,
          icon: getCategoryIcon(c.slug),
        }))
      : []),
  ];

  // Khi chọn danh mục cụ thể, chỉ hiển thị thương hiệu có sản phẩm trong danh mục đó
  const brandList = (serverBrands && serverBrands.length > 0)
    ? (filters.category !== 'all'
        ? serverBrands.filter((b) => b.productCount > 0)
        : serverBrands)
    : [];

  const displayedBrands = showAllBrands ? brandList : brandList.slice(0, 6);

  const filterContent = (
    <div className="bg-white border border-gray-100 rounded-lg p-3.5 shadow-xs space-y-3 divide-y divide-gray-100 text-sm">
      {/* 1. Danh mục động từ database */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
            Danh mục
          </h3>
        </div>

        {isCategoriesLoadingState ? (
          <div className="space-y-1 py-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-2 animate-pulse rounded-md">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-3.5 h-3.5 rounded bg-gray-200 shrink-0" />
                  <div
                    className="h-3 bg-gray-200 rounded"
                    style={{ width: `${55 + (i % 3) * 15}%` }}
                  />
                </div>
                <div className="h-2.5 w-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] ml-1 shrink-0 ${
                    isActive ? 'text-emerald-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>
        )}
      </div>
    

      {/* 2. Khoảng giá (Dễ sử dụng, không giật lag trang khi thao tác) */}
      <div className="pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
            Khoảng giá
          </h3>
          {isPriceFiltered && (
            <button
              type="button"
              onClick={handleResetPrice}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>

        {/* Gợi ý chọn nhanh các mức giá phổ biến */}
        <div className="flex flex-wrap gap-1">
          {PRICE_PRESETS.map((p) => {
            const isSelected =
              filters.minPrice === p.min && filters.maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p.min, p.max)}
                className={`text-[10px] sm:text-[11px] px-2 py-1 rounded-md border transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Thanh trượt kéo mượt mà (cập nhật state local, không trigger load lại trang) */}
        <div className="space-y-1.5 pt-1">
          <div className="relative py-1">
            <input
              type="range"
              min="0"
              max="50000000"
              step="500000"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-md appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>0đ</span>
            <span className="font-medium text-gray-600">
              Đến: {localMaxPrice >= 50000000 ? '50tr+' : `${(localMaxPrice / 1000000).toFixed(localMaxPrice % 1000000 === 0 ? 0 : 1)} triệu`}
            </span>
          </div>
        </div>

        {/* Nhập khoảng giá cụ thể Từ - Đến */}
        <div className="space-y-2 pt-0.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Từ (đ)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={localMinPrice === 0 ? '' : localMinPrice}
                onChange={(e) => setLocalMinPrice(Number(e.target.value) || 0)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                placeholder="0"
                className="w-full px-2 py-1 text-xs font-medium border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-gray-50/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">Đến (đ)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={localMaxPrice >= 50000000 ? '' : localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value) || 50000000)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPrice()}
                placeholder="50.000.000"
                className="w-full px-2 py-1 text-xs font-medium border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-gray-50/50"
              />
            </div>
          </div>

          {/* Nút Áp dụng khoảng giá */}
          <button
            type="button"
            onClick={handleApplyPrice}
            className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs ${
              isDirtyPrice
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Áp dụng khoảng giá
          </button>
        </div>
      </div>

      {/* 3. Thương hiệu động (Phương án B: Lọc theo danh mục) */}
      <div className="pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
            Thương hiệu
          </h3>
        </div>

        {isBrandsLoadingState ? (
          <div className="space-y-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-3.5 h-3.5 rounded bg-gray-200 shrink-0" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-2.5 w-5 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : brandList.length === 0 ? (
          <p className="text-[11px] text-gray-400 py-1">
            Không có thương hiệu cho mục này
          </p>
        ) : (
          <div className="space-y-1">
            {displayedBrands.map((b) => {
              const isChecked = filters.brands.includes(b.name);
              return (
                <label
                  key={b.name}
                  className="flex items-center justify-between text-xs text-gray-700 hover:text-emerald-700 cursor-pointer select-none group py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandToggle(b.name)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={isChecked ? 'font-semibold text-emerald-700' : ''}>
                      {b.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">({b.productCount})</span>
                </label>
              );
            })}
          </div>
        )}

        {brandList.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium pt-0.5 cursor-pointer"
          >
            <span>{showAllBrands ? 'Thu gọn' : `Xem thêm (${brandList.length - 6})`}</span>
            {showAllBrands ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* 4. Tình trạng hàng */}
      <div className="pt-3 space-y-1.5">
        <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
          Tình trạng
        </h3>
        <div className="space-y-1 text-xs">
          <label className="flex items-center justify-between text-gray-700 hover:text-emerald-700 cursor-pointer select-none py-0.5">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="stockStatus"
                checked={filters.stock === 'all' || filters.stock === 'in_stock'}
                onChange={() => handleStockChange('in_stock')}
                className="w-3.5 h-3.5 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Còn hàng</span>
            </div>
          </label>

          <label className="flex items-center justify-between text-gray-700 hover:text-emerald-700 cursor-pointer select-none py-0.5">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="stockStatus"
                checked={filters.stock === 'out_of_stock'}
                onChange={() => handleStockChange('out_of_stock')}
                className="w-3.5 h-3.5 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Hết hàng</span>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Nút Reset bộ lọc */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleResetFilters}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200/80 hover:border-gray-300 text-gray-600 hover:text-gray-900 rounded-lg text-xs font-semibold transition cursor-pointer hover:bg-gray-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="sticky top-24">{filterContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-xs bg-white shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-gray-900 text-sm">Bộ lọc tìm kiếm</h2>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4">{filterContent}</div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-gray-100/80 bg-gray-50/80 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-gray-200/80 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 transition cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
