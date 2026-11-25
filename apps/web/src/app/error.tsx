'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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
          {/* Biểu tượng cảnh báo lỗi nhỏ gọn, tinh tế */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shadow-2xs">
              <AlertCircle className="w-6 h-6 stroke-[1.9]" />
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
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </button>

            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 text-xs font-medium text-gray-700 shadow-2xs transition active:scale-95"
            >
              <Home className="h-3.5 w-3.5 text-gray-500" />
              <span>Trang chủ</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
