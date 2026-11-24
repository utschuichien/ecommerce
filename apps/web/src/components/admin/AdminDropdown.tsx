'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface AdminDropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface AdminDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: AdminDropdownOption<T>[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  menuWidth?: string;
  align?: 'left' | 'right';
  variant?: 'gray' | 'white';
}

/**
 * Dropdown Menu custom chuẩn chỉnh cho Admin Portal
 * - Tuân thủ nghiêm ngặt rounded-lg
 * - Cursor pointer trên toàn bộ phần tử tương tác
 * - Viền mềm mại border-gray-200/50
 * - Tự động đóng khi click ra ngoài
 */
export function AdminDropdown<T extends string = string>({
  value,
  onChange,
  options,
  icon,
  placeholder,
  className = '',
  menuWidth = 'w-48',
  align = 'left',
  variant = 'gray',
}: AdminDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng khi click ngoài dropdown
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

  const baseButtonClass =
    variant === 'gray'
      ? 'bg-gray-50/60 hover:bg-gray-100/70 border-gray-200/50 hover:border-gray-300 text-gray-700'
      : 'bg-white hover:bg-gray-50 border-gray-200/70 text-gray-800 shadow-2xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Nút kích hoạt Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-xs font-medium cursor-pointer transition select-none ${baseButtonClass}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          {selectedOption?.icon && (
            <span className="text-gray-500 shrink-0">{selectedOption.icon}</span>
          )}
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

      {/* Menu xổ xuống */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 ${menuWidth} bg-white border border-gray-200/80 rounded-lg shadow-lg py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto`}
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
                    ? 'bg-emerald-50/70 text-emerald-800 font-semibold'
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
