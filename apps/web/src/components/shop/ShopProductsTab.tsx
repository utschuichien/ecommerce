'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  ArrowUpDown,
  Filter,
  Package,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { ShopProduct } from './shop-types';
import { ShopProductCard } from './ShopProductCard';

interface ShopCategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ShopProductsTabProps {
  products: ShopProduct[];
  categories?: ShopCategoryOption[];
  onAddToCart: (product: ShopProduct) => void;
  selectedCategory?: string;
  onCategoryChange?: (categorySlug: string) => void;
  initialSortBy?: 'popular' | 'newest' | 'bestseller' | 'price-asc' | 'price-desc';
}

export function ShopProductsTab({
  products,
  categories = [],
  onAddToCart,
  selectedCategory: initialCategory = 'all',
  onCategoryChange,
  initialSortBy = 'popular',
}: ShopProductsTabProps) {
  const router = useRouter();

  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState<{ min?: number; max?: number }>({});
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'bestseller' | 'price-asc' | 'price-desc'>(initialSortBy);
  const [search, setSearch] = useState('');

  // Danh mục sản phẩm động từ Shop
  const categoryFilters = useMemo(() => {
    const list = [{ id: 'all', label: 'Tất cả danh mục' }];
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        list.push({ id: cat.slug || cat.id, label: cat.name });
      });
    } else {
      const uniqueCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
      uniqueCats.forEach((cat) => {
        list.push({ id: cat, label: cat });
      });
    }
    return list;
  }, [categories, products]);

  const handleCategoryClick = (catId: string) => {
    setSelectedCat(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPrice ? Number(minPrice.replace(/\D/g, '')) : undefined;
    const max = maxPrice ? Number(maxPrice.replace(/\D/g, '')) : undefined;
    setAppliedPriceRange({ min, max });
  };

  const handleResetFilters = () => {
    setSelectedCat('all');
    setMinPrice('');
    setMaxPrice('');
    setAppliedPriceRange({});
    setMinRating(null);
    setSearch('');
    setSortBy('popular');
    if (onCategoryChange) {
      onCategoryChange('all');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Lọc theo danh mục
    if (selectedCat !== 'all') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCat.toLowerCase() ||
          p.slug?.toLowerCase().includes(selectedCat.toLowerCase()),
      );
    }

    // 2. Lọc theo khoảng giá
    if (appliedPriceRange.min !== undefined) {
      result = result.filter((p) => p.price >= appliedPriceRange.min!);
    }
    if (appliedPriceRange.max !== undefined) {
      result = result.filter((p) => p.price <= appliedPriceRange.max!);
    }

    // 3. Lọc theo đánh giá sao
    if (minRating !== null) {
      result = result.filter((p) => (p.rating || 5) >= minRating);
    }

    // 4. Tìm kiếm theo tên
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // 5. Sắp xếp
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'bestseller') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return result;
  }, [products, selectedCat, appliedPriceRange, minRating, search, sortBy]);

  if (products.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center space-y-3 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto border border-gray-100">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900">
          Gian hàng chưa có sản phẩm nào
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Người bán hiện chưa đăng bán sản phẩm nào. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  const hasActiveFilter =
    selectedCat !== 'all' ||
    appliedPriceRange.min !== undefined ||
    appliedPriceRange.max !== undefined ||
    minRating !== null ||
    search.trim().length > 0;

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* 1. SIDEBAR BỘ LỌC CHUẨN SHOPEE */}
      <aside className="w-full lg:w-56 shrink-0 bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Bộ lọc tìm kiếm
            </h3>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        {/* Danh mục gian hàng */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-900">Theo Danh Mục</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-none pr-1">
            {categoryFilters.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Khoảng giá */}
        <div className="pt-3 border-t border-gray-100 space-y-2.5">
          <h4 className="text-xs font-bold text-gray-900">Khoảng Giá (₫)</h4>
          <form onSubmit={handleApplyPrice} className="space-y-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Từ ₫"
                className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="text"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Đến ₫"
                className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
            >
              ÁP DỤNG
            </button>
          </form>
        </div>

        {/* Đánh giá sao */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <h4 className="text-xs font-bold text-gray-900">Đánh Giá</h4>
          <div className="space-y-1">
            {[5, 4, 3].map((star) => {
              const isSelected = minRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setMinRating(isSelected ? null : star)}
                  className={`w-full text-left px-2 py-1 rounded-md text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    isSelected ? 'bg-amber-50 text-gray-900 font-bold' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < star ? 'fill-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {star < 5 && <span className="text-[11px] text-gray-500">trở lên</span>}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 2. KHU VỰC SẢN PHẨM & THANH SẮP XẾP */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Thanh Sắp Xếp chuẩn Shopee */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Sắp xếp theo:</span>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                sortBy === 'popular'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Phổ biến
            </button>
            <button
              type="button"
              onClick={() => setSortBy('bestseller')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                sortBy === 'bestseller'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bán chạy
            </button>

            {/* Dropdown sắp xếp giá */}
            <div className="relative">
              <select
                value={sortBy.startsWith('price') ? sortBy : 'price-asc'}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`pl-3 pr-7 py-1.5 rounded-lg font-semibold text-xs border outline-none cursor-pointer appearance-none transition ${
                  sortBy.startsWith('price')
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Ô tìm kiếm trong shop */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm trong shop..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Lưới sản phẩm dùng CatalogProductCard */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center space-y-2.5 shadow-xs">
            <p className="text-sm font-semibold text-gray-800">
              Không tìm thấy sản phẩm phù hợp
            </p>
            <p className="text-xs text-gray-400">
              Hãy thử tìm với từ khóa khác hoặc điều chỉnh khoảng giá trong bộ lọc
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredProducts.map((p) => (
              <ShopProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
