'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md text-center">
          {/* Biểu tượng cảnh báo lỗi trang trọng */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shadow-md shadow-rose-500/10 ring-4 ring-rose-50">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Đã xảy ra sự cố kỹ thuật
          </h1>

          <p className="mx-auto mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-gray-500">
            Hệ thống gặp gián đoạn tạm thời trong quá trình tải dữ liệu. Vui lòng bấm thử lại hoặc quay về trang chủ.
          </p>

          {error?.digest && (
            <div className="mt-3 inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 font-mono text-[11px]">
              Mã lỗi: {error.digest}
            </div>
          )}

          {/* Nhóm nút thao tác */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Thử lại ngay</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs transition active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
