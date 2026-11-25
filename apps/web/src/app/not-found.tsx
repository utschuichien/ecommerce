import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[380px] bg-white border border-gray-150 rounded-2xl p-6 sm:p-7 text-center shadow-xs">
          {/* 404 nhỏ gọn với icon la bàn thanh thoát */}
          <div className="flex items-center justify-center gap-1.5 select-none" aria-hidden="true">
            <span className="text-4xl sm:text-5xl font-black leading-none tracking-tight text-gray-800">
              4
            </span>
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs ring-2 ring-emerald-50">
              <svg
                className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
            <span className="text-4xl sm:text-5xl font-black leading-none tracking-tight text-gray-800">
              4
            </span>
          </div>
          <span className="sr-only">Lỗi 404</span>

          <h1 className="mt-4 text-sm sm:text-base font-semibold tracking-tight text-gray-900">
            Không tìm thấy trang
          </h1>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[12px] sm:text-[13px] leading-relaxed text-gray-500">
            Đường dẫn có thể đã thay đổi hoặc không tồn tại. Vui lòng quay về trang chủ.
          </p>

          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-medium text-white shadow-xs transition active:scale-95"
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
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}