'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Ghi log lỗi ra console phục vụ kiểm tra lỗi runtime
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[380px] bg-white border border-gray-150 rounded-2xl p-6 sm:p-7 text-center shadow-xs">
          {/* Biểu tượng cảnh báo lỗi nhỏ gọn, tự chứa không phụ thuộc chunk bên ngoài */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shadow-2xs">
              <svg
                className="w-6 h-6 stroke-[1.9]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>

          <h1 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900">
            Đã xảy ra sự cố kỹ thuật
          </h1>

          <p className="mx-auto mt-1.5 max-w-[300px] text-[12px] sm:text-[13px] leading-relaxed text-gray-500">
            Hệ thống gặp gián đoạn khi xử lý dữ liệu. Vui lòng bấm thử lại hoặc quay về trang chủ.
          </p>

          {error?.digest && (
            <div className="mt-2.5 inline-block px-2 py-0.5 rounded bg-gray-50 border border-gray-150 text-gray-400 font-mono text-[10px]">
              Mã lỗi: {error.digest}
            </div>
          )}

          {/* Nhóm nút thao tác nhỏ gọn, hài hòa */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 text-xs font-medium text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>Thử lại</span>
            </button>

            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 text-xs font-medium text-gray-700 shadow-2xs transition active:scale-95"
            >
              <svg
                className="h-3.5 w-3.5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Trang chủ</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
