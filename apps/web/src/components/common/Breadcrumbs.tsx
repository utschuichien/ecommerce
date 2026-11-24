'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[11px] text-gray-500 overflow-x-auto py-1 mb-2 scrollbar-none ${className}`}
    >
      {/* 1. Biểu tượng ngôi nhà (Home Icon) */}
      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-emerald-600 transition shrink-0"
        title="Trang chủ"
        aria-label="Trang chủ"
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
      </Link>

      {/* Dấu > ngay sau ngôi nhà theo đúng yêu cầu */}
      <ChevronRight
        className="w-3.5 h-3.5 text-gray-300 shrink-0 stroke-[2]"
        aria-hidden="true"
      />

      {/* 2. Chữ Trang chủ */}
      <Link
        href="/"
        className="hover:text-emerald-600 transition shrink-0 font-normal"
      >
        Trang chủ
      </Link>

      {/* 3. Các mục tiếp theo */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 shrink-0 stroke-[2]"
              aria-hidden="true"
            />
            {isLast || !item.href ? (
              <span
                className={`truncate ${
                  isLast
                    ? 'font-bold text-gray-900'
                    : 'text-gray-500 font-normal'
                }`}
                aria-current={isLast ? 'page' : undefined}
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-emerald-600 transition shrink-0 font-normal"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
