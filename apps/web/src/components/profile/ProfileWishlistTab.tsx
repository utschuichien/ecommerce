'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductImage } from '@/components/common/ProductImage';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Search,
  SlidersHorizontal,
  Star,
  Check,
  ArrowUpDown,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { ProfileWishlistItem } from './profile-types';
import { formatVND } from '../../lib/api-client';
import { Pagination } from '../common/Pagination';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useDebounce } from '@/hooks/useDebounce';

interface ProfileWishlistTabProps {
  items?: ProfileWishlistItem[];
  onRemoveItem?: (id: string) => void;
  onAddToCart?: (item: ProfileWishlistItem) => void;
  onAddAllToCart?: () => void;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'phone', label: 'Điện thoại' },
  { id: 'audio', label: 'Âm thanh' },
  { id: 'watch', label: 'Đồng hồ' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'fashion', label: 'Thời trang' },
];

export function ProfileWishlistTab({
  items: fallbackItems = [],
  onRemoveItem,
  onAddToCart,
  onAddAllToCart,
}: ProfileWishlistTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc page trực tiếp từ URL query params (limit luôn là 10)
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Lấy dữ liệu wishlist từ backend với limit luôn là 10
  const { data: wishlistResponse, isLoading, isFetching } = useWishlist({
    page: pageFromUrl,
    limit: 10,
  });

  // Chuyển đổi dữ liệu từ API hoặc fallback props
  const rawItems: ProfileWishlistItem[] = useMemo(() => {
    if (wishlistResponse?.data && wishlistResponse.data.length > 0) {
      return wishlistResponse.data.map((w) => ({
        id: w.id,
        productId: w.productId,
        productNumericId: w.productNumericId,
        slug: w.slug || (w as any).productSlug || w.productId,
        name: w.name,
        brand: w.brand || (w as any).brand,
        price: w.price,
        oldPrice: w.oldPrice,
        discountPercent: w.discountPercent,
        rating: w.rating || 5,
        reviewsCount: w.reviewsCount || 10,
        inStock: w.inStock ?? true,
        isFavorite: true,
        category: w.category || 'other',
        image: w.image,
      }));
    }
    if (wishlistResponse?.data) {
      return [];
    }
    return fallbackItems;
  }, [wishlistResponse, fallbackItems]);

  const pagination = wishlistResponse?.pagination || {
    total: rawItems.length,
    page: pageFromUrl,
    limit: 10,
    totalPages: Math.max(1, Math.ceil(rawItems.length / 10)),
  };

  // Cập nhật page lên URL
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'wishlist');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Xử lý thêm vào giỏ có feedback trực quan
  const handleAddToCartWithFeedback = (item: ProfileWishlistItem) => {
    onAddToCart?.(item);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  // Lọc và sắp xếp sản phẩm
  const filteredAndSortedItems = useMemo(() => {
    let result = [...rawItems];

    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Tìm kiếm theo tên hoặc thương hiệu (dùng debouncedSearch)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return result;
  }, [rawItems, selectedCategory, debouncedSearch, sortBy]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* 1. HEADER SECTION & HÀNH ĐỘNG NHANH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-950">
              Danh sách yêu thích
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              {pagination.total} sản phẩm
            </span>
            {isFetching && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Các sản phẩm bạn quan tâm, nhận thông báo ngay khi có ưu đãi giảm giá (10 sản phẩm / trang)
          </p>
        </div>

        {/* Nút hành động nhanh: Thêm tất cả vào giỏ */}
        {rawItems.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAddAllToCart}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md transition shadow-xs cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm tất cả vào giỏ</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. THANH CÔNG CỤ: TÌM KIẾM, DANH MỤC & SẮP XẾP */}
      {rawItems.length > 0 && (
        <div className="space-y-3">
          {/* Hàng 1: Ô tìm kiếm & Dropdown Sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm trong danh sách yêu thích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                <ArrowUpDown className="w-3 h-3" />
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="default">Mới thêm gần đây</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="discount">Ưu đãi giảm sâu nhất</option>
              </select>
            </div>
          </div>

          {/* Hàng 2: Bộ lọc danh mục */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH SẢN PHẨM HOẶC TRẠNG THÁI RỖNG */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-3 animate-pulse"
            >
              {/* Ảnh skeleton */}
              <div className="w-full aspect-square rounded-lg bg-gray-100" />

              {/* Chi tiết sản phẩm skeleton */}
              <div className="space-y-2">
                <div className="h-2.5 w-16 bg-gray-100 rounded" />
                <div className="h-3.5 w-full bg-gray-200 rounded" />
                <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
              </div>

              {/* Giá skeleton */}
              <div className="pt-1 flex items-baseline gap-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>

              {/* Buttons skeleton */}
              <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-2">
                <div className="h-8 bg-gray-100 rounded-lg" />
                <div className="h-8 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="py-14 text-center space-y-3.5">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800">
              {searchQuery || selectedCategory !== 'all'
                ? 'Không tìm thấy sản phẩm phù hợp'
                : 'Danh sách yêu thích đang trống'}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục để tìm thấy sản phẩm yêu thích của bạn.'
                : 'Hãy thả tim những sản phẩm bạn ưng ý khi mua sắm để theo dõi giá và mua lại sau này nhé.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khám phá sản phẩm ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredAndSortedItems.map((item) => {
              const isAdded = addedItemIds[item.id];
              const hasDiscount = item.discountPercent && item.discountPercent > 0;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-emerald-200/80 p-3.5 transition duration-200 flex flex-col justify-between hover:shadow-xs relative"
                >
                  {/* PHẦN TRÊN: ẢNH & THÔNG TIN SẢN PHẨM */}
                  <div>
                    {/* Ảnh Thumbnail */}
                    <div className="w-full aspect-square rounded-lg bg-gray-50 relative overflow-hidden mb-3 border border-gray-100 flex items-center justify-center p-2">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      />

                      {/* Badge giảm giá */}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                          -{item.discountPercent}%
                        </div>
                      )}

                      {/* Nút xóa nhanh khỏi yêu thích trên ảnh */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 flex items-center justify-center shadow-xs transition cursor-pointer"
                        title="Xóa khỏi yêu thích"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    {/* Chi tiết nội dung */}
                    <div className="space-y-1.5">
                      {item.brand && (
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                          {item.brand}
                        </p>
                      )}

                      <Link
                        href={`/products/${(item as any).slug || (item as any).productId || item.id}`}
                        className="block"
                      >
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-950 line-clamp-2 group-hover:text-emerald-700 transition leading-snug">
                          {item.name}
                        </h4>
                      </Link>

                      {/* Đánh giá sao */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                        <span className="font-semibold text-gray-700 text-[11px]">{item.rating}</span>
                        <span className="text-[11px] text-gray-400">({item.reviewsCount})</span>
                      </div>

                      {/* Giá bán & Giá cũ */}
                      <div className="pt-1 flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-gray-950">
                          {formatVND(item.price)}
                        </span>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatVND(item.oldPrice)}
                          </span>
                        )}
                      </div>

                      {/* Thông báo tiết kiệm */}
                      {hasDiscount && (
                        <p className="text-[10px] font-semibold text-emerald-700">
                          Tiết kiệm {formatVND(item.oldPrice! - item.price)}
                        </p>
                      )}
                    </div>

                    {/* Trạng thái còn hàng */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Còn hàng</span>
                    </div>
                  </div>

                  {/* PHẦN DƯỚI: NÚT THÊM VÀO GIỎ & XÓA */}
                  <div className="pt-3 mt-3 border-t border-gray-50 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCartWithFeedback(item)}
                      className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã thêm vào giỏ!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Thêm vào giỏ</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveItem?.(item.id)}
                      className="p-2 border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phân trang Wishlist - limit luôn là 10, hiển thị page lên URL */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            limit={10}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
