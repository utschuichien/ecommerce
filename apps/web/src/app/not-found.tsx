import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md text-center">
          {/* 404 với la bàn thay cho số 0 */}
          <div className="flex items-center justify-center gap-2 select-none" aria-hidden="true">
            <span className="text-6xl sm:text-7xl font-extrabold leading-none tracking-tight bg-gradient-to-b from-gray-900 to-gray-400 bg-clip-text text-transparent">
              4
            </span>
            <span className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-100">
              <Compass className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.8} />
            </span>
            <span className="text-6xl sm:text-7xl font-extrabold leading-none tracking-tight bg-gradient-to-b from-gray-900 to-gray-400 bg-clip-text text-transparent">
              4
            </span>
          </div>
          <span className="sr-only">Lỗi 404</span>

          <h1 className="mt-6 text-lg sm:text-xl font-bold tracking-tight text-gray-900">
            Trang bạn tìm kiếm không tồn tại
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-gray-500">
            Đường dẫn có thể đã thay đổi hoặc địa chỉ bị nhập sai. Vui lòng quay lại trang chủ.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}