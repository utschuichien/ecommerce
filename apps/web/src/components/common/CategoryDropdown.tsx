'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
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
  Search,
  Sparkle,
} from 'lucide-react';
import { useCategories } from '@/features/catalog/hooks/useCatalog';

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

type Variant = 'cards' | 'feature' | 'compact' | 'tiles' | 'dark' | 'bento';
type Cat = { id: string; name: string; icon: React.ElementType; href: string; count: number };
interface PanelProps { cats: Cat[]; close: () => void }

const TONES = [
  { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconBg: 'bg-emerald-100/70', badgeBg: 'bg-emerald-100 text-emerald-800' },
  { bg: 'bg-sky-50/80 text-sky-600 border-sky-100', iconBg: 'bg-sky-100/70', badgeBg: 'bg-sky-100 text-sky-800' },
  { bg: 'bg-amber-50/80 text-amber-600 border-amber-100', iconBg: 'bg-amber-100/70', badgeBg: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-rose-50/70 text-rose-500 border-rose-100', iconBg: 'bg-rose-100/70', badgeBg: 'bg-rose-100 text-rose-800' },
  { bg: 'bg-violet-50/70 text-violet-600 border-violet-100', iconBg: 'bg-violet-100/70', badgeBg: 'bg-violet-100 text-violet-800' },
  { bg: 'bg-teal-50/80 text-teal-600 border-teal-100', iconBg: 'bg-teal-100/70', badgeBg: 'bg-teal-100 text-teal-800' },
];

function ViewAll({ close, label = 'Xem tất cả danh mục & sản phẩm' }: { close: () => void; label?: string }) {
  return (
    <Link
      href="/products"
      onClick={close}
      className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
    </Link>
  );
}

/**
 * Mẫu 1: Bento Grid cao cấp (Được tối ưu Responsive trên Mobile, Tablet và Desktop)
 */
// Dán đè lên hàm BentoPanel cũ trong CategoryDropdown.tsx (các import và TONES giữ nguyên).

// Tối đa 11 ô nhỏ (3 + 4k) để lưới 4 cột luôn đầy hàng.
const MAX_SMALL = 11;
const VIEW_ALL_SPAN: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
};

function BentoPanel({ cats, close }: PanelProps) {
  const [first, ...restAll] = cats;
  if (!first) return null;

  const rest = restAll.slice(0, MAX_SMALL);
  const hidden = restAll.length - rest.length;

  // Ô "Xem tất cả" tự giãn để lấp chỗ trống ở hàng cuối (4 ô đầu nằm cạnh ô lớn).
  const cells = rest.length + 1;
  const tail = cells <= 4 ? 0 : (cells - 4) % 4;
  const viewAllSpan = VIEW_ALL_SPAN[tail === 0 ? 1 : 5 - tail];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-4">
        {/* Ô nổi bật */}
        <Link
          href={first.href}
          onClick={close}
          className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-4 text-white shadow-lg shadow-emerald-900/15 transition hover:shadow-xl active:scale-[0.99] sm:col-span-2 sm:p-5 md:row-span-2"
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:14px_14px]"
          />
          <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-white/10 blur-xl sm:h-44 sm:w-44" />

          <span className="relative flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 sm:h-12 sm:w-12">
              <first.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold sm:text-[11px]">
              <Sparkle className="h-2.5 w-2.5 fill-current" />
              Nổi bật
            </span>
          </span>

          <span className="relative mt-4 sm:mt-6">
            <span className="block text-balance text-base font-bold leading-tight sm:text-lg md:text-xl">{first.name}</span>
            <span className="mt-1 block text-xs font-medium text-emerald-100/90">{first.count} sản phẩm đang mở bán</span>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition group-hover:bg-emerald-50">
              Khám phá ngay
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>

        {/* Các danh mục còn lại: hiển thị đủ, tên tối đa 2 dòng thay vì bị cắt */}
        {rest.map((c, i) => {
          const tone = TONES[i % TONES.length];
          return (
            <Link
              key={c.id}
              href={c.href}
              onClick={close}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-100/90 bg-gray-50/60 p-2.5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md sm:flex-col sm:items-start sm:rounded-2xl sm:p-3.5"
            >
              <div className="flex items-center gap-2.5 sm:w-full sm:justify-between">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${tone.iconBg} ${tone.bg.split(' ')[1]}`}>
                  <c.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="hidden rounded-full border border-gray-100 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition group-hover:border-emerald-200 group-hover:text-emerald-700 sm:inline-block">
                  {c.count} sp
                </span>
              </div>

              <div className="min-w-0 flex-1 text-left sm:mt-2 sm:w-full sm:flex-initial">
                <span className="line-clamp-2 text-balance text-xs font-semibold leading-snug text-gray-800 transition group-hover:text-emerald-700 sm:text-[13px]">
                  {c.name}
                </span>
                <span className="text-[10px] font-medium text-gray-400 sm:hidden">{c.count} sản phẩm</span>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 sm:hidden" />
            </Link>
          );
        })}

        {/* Xem tất cả: tự giãn lấp hàng cuối */}
        <Link
          href="/products"
          onClick={close}
          className={`group flex cursor-pointer items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-2.5 text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 sm:flex-col sm:items-start sm:rounded-2xl sm:p-3.5 ${viewAllSpan}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-transform group-hover:scale-105">
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
          <div className="ml-2.5 min-w-0 flex-1 text-left sm:ml-0 sm:mt-2 sm:w-full sm:flex-initial">
            <span className="block text-xs font-bold text-emerald-950 sm:text-[13px]">Xem tất cả</span>
            <span className="block text-[10px] font-medium text-emerald-700">
              {hidden > 0 ? `+${hidden} danh mục khác` : `${cats.length} ngành hàng`}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 transition group-hover:translate-x-0.5 sm:hidden" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Mẫu 2: Cards Panel dạng lưới 2 cột
 */
function CardsPanel({ cats, close }: PanelProps) {
  return (
    <>
      <div className="flex items-center justify-between px-1 pb-2.5 border-b border-gray-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Mua sắm theo danh mục
        </p>
        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
          {cats.length} ngành hàng
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-2.5">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={c.href}
            onClick={close}
            className="group flex items-center gap-3 rounded-xl border border-gray-100/90 bg-white p-2.5 sm:p-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer"
          >
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white shadow-2xs">
              <c.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition">
                {c.name}
              </span>
              <span className="block text-[11px] text-gray-400 mt-0.5 font-medium">
                {c.count} sản phẩm
              </span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition shrink-0" />
          </Link>
        ))}
      </div>
      <div className="mt-3 border-t border-gray-100 pt-1.5">
        <ViewAll close={close} />
      </div>
    </>
  );
}

/**
 * Mẫu 3: Feature Panel (Hover chuyển đổi thông tin nổi bật)
 */
function FeaturePanel({ cats, close }: PanelProps) {
  const [active, setActive] = useState(0);
  const cur = cats[Math.min(active, cats.length - 1)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3 sm:gap-4">
      <div>
        <ul className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
          {cats.map((c, i) => (
            <li key={c.id}>
              <Link
                href={c.href}
                onClick={close}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm transition cursor-pointer ${
                  i === active
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <c.icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    i === active ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                  strokeWidth={1.8}
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-[11px] text-gray-400 font-normal">{c.count} sp</span>
                <ChevronRight
                  className={`h-4 w-4 transition ${
                    i === active ? 'translate-x-0.5 text-emerald-600' : 'text-gray-300'
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-gray-100 pt-1.5">
          <ViewAll close={close} label="Xem toàn bộ danh mục" />
        </div>
      </div>

      {cur && (
        <div className="hidden md:flex relative flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-5 text-white shadow-md">
          <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <cur.icon className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <div className="relative mt-6">
            <p className="text-base font-bold leading-snug">{cur.name}</p>
            <p className="mt-1 text-xs text-emerald-100">{cur.count} sản phẩm đang mở bán</p>
            <Link
              href={cur.href}
              onClick={close}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 shadow-xs"
            >
              Khám phá ngay <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mẫu 4: Compact Panel (Lưới biểu tượng gọn kèm ô tìm nhanh)
 */
function CompactPanel({ cats, close }: PanelProps) {
  const [q, setQ] = useState('');
  const list = cats.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <label className="relative block mb-2.5">
        <span className="sr-only">Tìm danh mục</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm nhanh danh mục..."
          className="w-full rounded-xl border border-gray-200/80 bg-gray-50/70 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
        />
      </label>
      {list.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[320px] overflow-y-auto scrollbar-thin">
          {list.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              onClick={close}
              className="group flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition hover:bg-emerald-50/70 cursor-pointer"
            >
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white shadow-2xs">
                <c.icon className="h-5 w-5" strokeWidth={1.8} />
                <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 shadow-xs border border-emerald-100">
                  {c.count}
                </span>
              </span>
              <span className="line-clamp-2 text-[11px] font-medium leading-tight text-gray-800">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-gray-400">Không tìm thấy danh mục phù hợp</p>
      )}
      <div className="mt-2 border-t border-gray-100 pt-1.5">
        <ViewAll close={close} />
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 p-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
          <div className="h-3.5 w-3/4 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function CategoryDropdown({ variant = 'bento' }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isCatalog = pathname.startsWith('/products');
  const { data: serverCategories, isLoading } = useCategories();

  const rawList =
    serverCategories && serverCategories.length > 0
      ? serverCategories
      : !isLoading
      ? DEFAULT_CATEGORIES
      : [];

  const categories: Cat[] = rawList.map((c: any) => ({
    id: c.slug || c.id,
    name: c.name,
    icon: getCategoryIcon(c.slug || c.name),
    href: `/products?category=${c.slug}`,
    count: c.productCount ?? 0,
  }));

  // Đóng khi click ra ngoài hoặc bấm phím Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Tự động đóng dropdown khi chuyển trang
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const enter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const leave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), 220);
  };

  const close = () => setOpen(false);

  const Panel =
    {
      bento: BentoPanel,
      cards: CardsPanel,
      feature: FeaturePanel,
      compact: CompactPanel,
      tiles: CardsPanel,
      dark: CardsPanel,
    }[variant] || BentoPanel;

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      {/* Nút Kích Hoạt Dropdown Danh Mục Chuẩn Nhất */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 pb-1 text-xs font-semibold outline-none transition-colors select-none ${
          isCatalog || open
            ? 'border-emerald-600 text-emerald-700'
            : 'border-transparent text-gray-700 hover:text-emerald-700'
        }`}
      >
        <LayoutGrid
          className={`w-3.5 h-3.5 transition-colors ${
            open || isCatalog ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
          }`}
        />
        <span>Danh mục</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? 'rotate-180 text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
          }`}
        />
      </button>

      {/* Menu Xổ Xuống (Được tính toán để chống tràn màn hình trên Mobile & Tablet) */}
      <div
        className={`fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-[108px] sm:top-full z-[100] sm:pt-2 transition-all duration-200 ${
          open
            ? 'visible translate-y-0 opacity-100 pointer-events-auto'
            : 'invisible -translate-y-1 opacity-0 pointer-events-none'
        } w-auto sm:w-[580px] md:w-[680px] max-w-[calc(100vw-24px)]`}
      >
        <div className="rounded-2xl border border-gray-100 bg-white/98 backdrop-blur-md p-3.5 sm:p-4 shadow-2xl shadow-emerald-950/10 max-h-[78vh] overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <Skeleton />
          ) : categories.length ? (
            <Panel cats={categories} close={close} />
          ) : (
            <div className="py-6 text-center text-xs text-gray-500">
              Chưa có danh mục nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
