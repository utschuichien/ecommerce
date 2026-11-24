'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Check,
  TrendingUp,
  Sparkles,
  Flame,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from 'lucide-react';

export type SortOption =
  | 'popular'
  | 'newest'
  | 'bestseller'
  | 'price_asc'
  | 'price_desc';

export type ViewMode = 'grid' | 'list';

interface ProductSortBarProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMobileFilters: () => void;
  activeFilterCount?: number;
}

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  {
    value: 'popular',
    label: 'Phổ biến nhất',
    icon: TrendingUp,
  },
  {
    value: 'newest',
    label: 'Mới nhất',
    icon: Sparkles,
    badge: 'Mới',
  },
  {
    value: 'bestseller',
    label: 'Bán chạy nhất',
    icon: Flame,
    badge: 'Hot',
  },
  {
    value: 'price_asc',
    label: 'Giá: Thấp đến Cao',
    icon: ArrowUpNarrowWide,
  },
  {
    value: 'price_desc',
    label: 'Giá: Cao đến Thấp',
    icon: ArrowDownWideNarrow,
  },
];

export function ProductSortBar({
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  activeFilterCount = 0,
}: ProductSortBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];

  // Đóng dropdown khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    }

    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  const handleSelectSort = (option: SortOption) => {
    onSortChange(option);
    setIsSortOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-white border border-gray-100/80 rounded-xl px-3.5 sm:px-4 py-2.5 shadow-2xs">
      {/* Left side: Results Count + Mobile Filter Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Filter Button (Visible on screens < lg) */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200/80 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-emerald-400 transition cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bộ lọc</span>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-600 text-white rounded-full text-[11px] min-w-[18px] h-[18px] px-1 flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Count display */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
          <span className="hidden sm:inline">Hiển thị</span>
          <span className="font-bold text-gray-900">{totalCount}</span>
          <span>sản phẩm</span>
        </div>
      </div>

      {/* Right side: Custom Sort dropdown + Grid/List switch */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Custom Sort Select Dropdown */}
        <div className="flex items-center gap-2 text-xs sm:text-sm" ref={dropdownRef}>
          <span className="text-gray-500 text-xs font-medium hidden sm:inline select-none">
            Sắp xếp theo
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              className={`inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                isSortOpen
                  ? 'border-emerald-500 bg-white text-emerald-900 ring-1 ring-emerald-500/20'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/80 text-gray-800'
              }`}
            >
              <currentOption.icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-gray-900">{currentOption.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
                  isSortOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>

            {/* Menu Dropdown Popup */}
            {isSortOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full mt-1.5 z-40 w-52 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-900/10 p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150 origin-top-right focus:outline-none"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Tiêu chí sắp xếp
                </div>

                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === sortBy;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectSort(opt.value)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        />
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                              opt.badge === 'Hot'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* View Switcher (Grid / List) */}
        <div className="flex items-center border border-gray-200/70 rounded-lg p-0.5 bg-gray-50/70">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Dạng lưới"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            title="Dạng danh sách"
            className={`p-1.5 rounded-md transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
