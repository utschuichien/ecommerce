'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductPaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
}: ProductPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center pt-8 border-t border-gray-100">
      <div className="flex items-center gap-2">
        {/* Nút quay lại (Previous) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>

        {/* Các số trang */}
        {pages.map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Nút tiếp theo (Next) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
