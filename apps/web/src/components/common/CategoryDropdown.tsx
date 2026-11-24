'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Sparkles,
  Dumbbell,
  Home as HomeIcon,
  BookOpen,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import { useCategories } from '@/features/catalog/hooks/useCatalog';

// Ánh xạ Icon linh hoạt theo slug hoặc tên danh mục
const getCategoryIcon = (slugOrName: string) => {
  const lower = slugOrName.toLowerCase();
  if (lower.includes('phone') || lower.includes('dien-thoai')) return Smartphone;
  if (lower.includes('laptop') || lower.includes('may-tinh')) return Laptop;
  if (lower.includes('audio') || lower.includes('am-thanh') || lower.includes('dien-tu')) return Headphones;
  if (lower.includes('fashion') || lower.includes('thoi-trang')) return Shirt;
  if (lower.includes('beauty') || lower.includes('lam-dep') || lower.includes('suc-khoe')) return Sparkles;
  if (lower.includes('sports') || lower.includes('the-thao')) return Dumbbell;
  if (lower.includes('home') || lower.includes('gia-dung')) return HomeIcon;
  if (lower.includes('book') || lower.includes('sach')) return BookOpen;
  return LayoutGrid;
};

// Danh mục dự phòng đầy đủ khi database chưa khởi tạo hoặc đang tải
const DEFAULT_CATEGORIES = [
  { slug: 'phone', name: 'Điện thoại & Phụ kiện', productCount: 12 },
  { slug: 'laptop', name: 'Laptop & Máy tính', productCount: 8 },
  { slug: 'audio', name: 'Điện tử & Âm thanh', productCount: 15 },
  { slug: 'fashion', name: 'Thời trang & Phụ kiện', productCount: 24 },
  { slug: 'beauty', name: 'Sức khỏe & Làm đẹp', productCount: 18 },
  { slug: 'sports', name: 'Thể thao & Dã ngoại', productCount: 9 },
  { slug: 'home', name: 'Đồ gia dụng', productCount: 14 },
  { slug: 'books', name: 'Sách & Văn phòng phẩm', productCount: 7 },
];

export function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isCatalog = pathname.startsWith('/products');

  // Lấy danh mục động từ database qua React Query (dùng chung cache với Sidebar)
  const { data: serverCategories, isLoading } = useCategories();

  // Ưu tiên danh mục từ server, nếu chưa có hoặc rỗng thì dùng danh mục mặc định để không bị trắng/lỗi
  const rawList =
    serverCategories && serverCategories.length > 0
      ? serverCategories
      : !isLoading
      ? DEFAULT_CATEGORIES
      : [];

  const categories = rawList.map((c: any) => ({
    id: c.slug || c.id,
    name: c.name,
    icon: getCategoryIcon(c.slug || c.name),
    href: `/products?category=${c.slug}`,
    count: c.productCount ?? 0,
  }));

  // Đóng khi click bên ngoài hoặc bấm phím Escape
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 250);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút Danh mục */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`group flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap outline-none text-xs font-semibold ${
          isCatalog || open
            ? 'text-emerald-700 border-emerald-600'
            : 'text-gray-700 border-transparent hover:text-emerald-700'
        }`}
      >
        <span>Danh mục</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-emerald-600' : 'group-hover:text-emerald-600'
          }`}
        />
      </button>

      {/* Dropdown Menu Popup Wrapper - pt-2 bridges gap seamlessly to prevent hover loss */}
      <div
        className={`absolute left-0 top-full z-[100] pt-2 w-[520px] max-w-[calc(100vw-32px)] transition-all duration-200 ${
          open
            ? 'visible translate-y-0 opacity-100 pointer-events-auto'
            : 'invisible -translate-y-1 opacity-0 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-2xl shadow-gray-900/10">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2 animate-pulse">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Danh sách danh mục thực tế từ API */}
          {!isLoading && categories.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    onClick={() => setOpen(false)}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 px-3 text-left transition hover:bg-gray-100"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-700 transition-colors duration-200 group-hover:bg-gray-100 group-hover:text-emerald-600">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>

                    <span className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                      <span className="truncate text-xs font-medium text-gray-800 transition-colors group-hover:text-emerald-700">
                        {cat.name}
                      </span>
                      {typeof cat.count === 'number' && cat.count > 0 && (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                          {cat.count}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Khi chưa có danh mục */}
          {!isLoading && categories.length === 0 && (
            <div className="py-6 text-center text-xs text-gray-500">
              Chưa có danh mục nào
            </div>
          )}

          {/* Thanh xem tất cả danh mục ở dưới cùng */}
          <div className="mt-2.5 border-t border-gray-100 pt-2.5">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="group flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-emerald-700"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">
                Xem tất cả danh mục & sản phẩm
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-gray-400 group-hover:text-emerald-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
