'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, LucideIcon } from 'lucide-react';

interface LocationSelectProps {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  required?: boolean;
  icon?: LucideIcon;
  id?: string;
}

export function LocationSelect({
  label,
  placeholder,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  value,
  onChange,
  options,
  disabled = false,
  disabledMessage,
  error,
  required = false,
  icon: Icon,
  id,
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lọc danh sách theo từ khóa tìm kiếm (bỏ dấu tiếng Việt đơn giản để tìm nhanh)
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(query));
  }, [options, searchQuery]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus ô tìm kiếm khi mở
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-gray-700"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {disabled && disabledMessage && (
          <span className="text-[11px] text-amber-600 font-medium">
            {disabledMessage}
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              setSearchQuery('');
            }
          }}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-left transition-all ${
            disabled
              ? 'bg-gray-50/70 border-gray-200/70 text-gray-400 cursor-not-allowed opacity-75'
              : error
              ? 'bg-rose-50/30 border-rose-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-400'
              : isOpen
              ? 'bg-white border-emerald-500 ring-1 ring-emerald-500/30 text-gray-900'
              : 'bg-white border-gray-200/80 hover:border-gray-300 text-gray-900 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {Icon && (
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  value
                    ? 'text-emerald-600'
                    : disabled
                    ? 'text-gray-300'
                    : 'text-gray-400'
                }`}
              />
            )}
            <span
              className={`text-xs sm:text-sm truncate ${
                value ? 'font-medium text-gray-900' : 'text-gray-400'
              }`}
            >
              {value || placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <span
                onClick={handleClear}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                title="Xóa lựa chọn"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100 bg-gray-50/60 sticky top-0">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 p-1 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt === value;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700'
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  Không tìm thấy địa điểm phù hợp
                </div>
              )}
            </div>

            {/* Footer tóm tắt số lượng */}
            <div className="px-3 py-1.5 bg-gray-50/80 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between items-center">
              <span>{filteredOptions.length} kết quả</span>
              <span className="italic">Nhấn để chọn</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 animate-in fade-in duration-150">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

