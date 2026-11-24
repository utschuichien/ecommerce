'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface SellerDropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SellerDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SellerDropdownOption<T>[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  menuWidth?: string;
  align?: 'left' | 'right';
  variant?: 'white' | 'gray';
}

/**
 * Component Dropdown Menu chọn 1 mục dùng chung cho toàn bộ Seller Portal
 */
export function SellerDropdown<T extends string = string>({
  value,
  onChange,
  options,
  icon,
  placeholder,
  className = '',
  menuWidth = 'w-44',
  align = 'left',
  variant = 'white',
}: SellerDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const baseStyle =
    variant === 'gray'
      ? 'bg-gray-50/70 hover:bg-gray-100/70 text-gray-700 border-gray-200/80'
      : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200/90 shadow-2xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Nút bấm kích hoạt Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-xs font-medium cursor-pointer transition select-none ${baseStyle}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-gray-500 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || 'Chọn'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Menu danh sách xổ xuống */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 ${menuWidth} bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between gap-2 transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-emerald-50/60 text-emerald-800 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className={isSelected ? 'text-emerald-600' : 'text-gray-400'}>
                      {option.icon}
                    </span>
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// FILTER POPOVER: Dùng cho nút "Bộ lọc" nâng cao (SlidersHorizontal)
// -------------------------------------------------------------

export interface FilterSection {
  id: string;
  title: string;
  options: { value: string; label: string }[];
  currentValue: string;
  onChange: (val: string) => void;
}

interface SellerFilterPopoverProps {
  title?: string;
  sections: FilterSection[];
  onReset?: () => void;
  activeCount?: number;
  align?: 'left' | 'right';
}

export function SellerFilterPopover({
  title,
  sections,
  onReset,
  activeCount = 0,
  align = 'right',
}: SellerFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium cursor-pointer transition shrink-0 shadow-2xs ${
          activeCount > 0 || isOpen
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-white border-gray-200/90 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <SlidersHorizontal
          className={`w-3.5 h-3.5 ${
            activeCount > 0 || isOpen ? 'text-emerald-600' : 'text-gray-500'
          }`}
        />
        <span>Bộ lọc</span>
        {activeCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : 'text-gray-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-72 sm:w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150 space-y-4`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>{title || 'Bộ lọc nâng cao'}</span>
            </span>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {sections.map((sec) => (
              <div key={sec.id} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 block">
                  {sec.title}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sec.options.map((opt) => {
                    const isSelected = sec.currentValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => sec.onChange(opt.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/70'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer nút đóng */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

