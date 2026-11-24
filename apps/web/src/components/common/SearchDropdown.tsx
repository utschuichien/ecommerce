'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  PackageSearch,
  Tag,
  Loader2,
} from 'lucide-react';
import { formatVND } from '../../lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalog';

export interface SearchDropdownProps {
  isOpen: boolean;
  searchTerm: string;
  onClose: () => void;
  onSubmitSearch: (term: string) => void;
}

function SearchSkeletonItem() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
      <div className="w-11 h-11 rounded-md bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5 py-1">
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

export function SearchDropdown({
  isOpen,
  searchTerm,
  onClose,
  onSubmitSearch,
}: SearchDropdownProps) {
  const trimmedTerm = searchTerm.trim();

  // Dùng hook useDebounce để hoãn gọi API 300ms tránh spam request
  const debouncedSearch = useDebounce(trimmedTerm, 300);

  // Đang trong thời gian debounce chờ người dùng ngừng gõ
  const isDebouncing = debouncedSearch !== trimmedTerm;

  // Gọi API catalog tìm kiếm sản phẩm thực tế theo từ khóa
  const { data: searchResponse, isLoading, isFetching } = useCatalogProducts(
    {
      search: debouncedSearch,
      limit: 5,
    },
    {
      enabled: Boolean(debouncedSearch.length > 0),
    }
  );

  // Không hiển thị dropdown nếu chưa mở hoặc chưa có từ khóa
  if (!isOpen || !trimmedTerm) return null;

  // Đang tìm kiếm: hoặc đang chờ debounce, hoặc query đang gọi API mạng
  const isSearching = isDebouncing || isLoading || isFetching;

  // Chỉ lấy danh sách sản phẩm khi đã hoàn tất debounce để tránh hiển thị kết quả cũ
  const products = !isDebouncing ? (searchResponse?.data || []) : [];
  const totalCount = searchResponse?.pagination?.total ?? products.length;

  return (
    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-left transition-all animate-in fade-in-50 zoom-in-95 duration-150">
      {/* 1. Header gợi ý từ khóa tìm kiếm */}
      <div
        onClick={() => onSubmitSearch(trimmedTerm)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50/70 hover:bg-emerald-50 border-b border-gray-100 text-xs text-gray-700 cursor-pointer transition group"
      >
        <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate">
          Tìm kiếm cho &quot;<strong className="text-emerald-700 font-semibold">{trimmedTerm}</strong>&quot; trong tất cả danh mục
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 ml-auto shrink-0 transition" />
      </div>

      {/* 2. Trạng thái đang tìm kiếm (Hiển thị Skeleton liên tục khi đang gõ hoặc đang gọi API) */}
      {isSearching ? (
        <div className="p-2 space-y-1 min-h-[170px]">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Đang tìm kiếm sản phẩm...</span>
            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <SearchSkeletonItem key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        /* 3. Danh sách sản phẩm thực tế từ API */
        <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto scrollbar-thin">
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Sản phẩm ({products.length} / {totalCount})
          </div>

          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/products/${prod.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-lg bg-transparent hover:bg-emerald-50/80 border border-transparent hover:border-emerald-200/70 transition-all duration-150 group cursor-pointer"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-11 h-11 rounded-md object-cover bg-gray-100 border border-gray-100 shrink-0 group-hover:scale-105 transition-transform"
              />

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium text-gray-800 group-hover:text-emerald-700 transition truncate leading-snug">
                  {prod.name}
                </h4>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                    <Tag className="w-2.5 h-2.5 text-gray-400" />
                    {prod.categoryName || prod.category}
                  </span>
                  {prod.brand && (
                    <>
                      <span className="text-gray-200 text-[10px]">•</span>
                      <span className="text-[10px] text-gray-400">{prod.brand}</span>
                    </>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-emerald-600">
                    {formatVND(prod.price)}
                  </span>
                  {prod.oldPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {formatVND(prod.oldPrice)}
                    </span>
                  )}
                  {Boolean(prod.discountPercent && prod.discountPercent > 0) && (
                    <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                      -{prod.discountPercent}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* 4. Trạng thái chỉ xuất hiện khi ĐÃ HOÀN TẤT TÌM KIẾM mà không có sản phẩm */
        <div className="p-6 text-center space-y-2 min-h-[170px] flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mx-auto">
            <PackageSearch className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-gray-700">
            Không tìm thấy sản phẩm phù hợp với &quot;{trimmedTerm}&quot;
          </p>
          <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
            Vui lòng thử lại với từ khóa khác hoặc kiểm tra lại chính tả.
          </p>
        </div>
      )}

      {/* 5. Footer xem tất cả kết quả */}
      {products.length > 0 && (
        <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => onSubmitSearch(trimmedTerm)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
          >
            <span>
              Xem tất cả {totalCount > products.length ? totalCount : ''} kết quả cho &quot;{trimmedTerm}&quot;
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
