'use client';

import React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  onChange,
  label,
  className = '',
  disabled,
  id,
  title,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  return (
    <label
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group shrink-0 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      title={title}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />

        {/* Khung hiển thị Checkbox tùy chỉnh hiện đại */}
        <div
          className={`w-[18px] h-[18px] rounded-[4.5px] border transition-all duration-150 flex items-center justify-center ${
            checked
              ? 'bg-emerald-600 border-emerald-600 shadow-2xs'
              : 'border-gray-300 bg-white group-hover:border-emerald-500'
          }`}
        >
          {/* Biểu tượng dấu tick trắng sắc nét */}
          <svg
            className={`w-3 h-3 text-white transition-all duration-150 ${
              checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2.2 6.2 4.6 8.6 9.8 3.4" />
          </svg>
        </div>
      </div>

      {label && (
        <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-none">
          {label}
        </span>
      )}
    </label>
  );
}
