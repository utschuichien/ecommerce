'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  X,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { Logo } from './Logo';
import { CategoryDropdown } from './CategoryDropdown';
import { UserAvatar } from './UserAvatar';
import { SearchDropdown } from './SearchDropdown';
import { NotificationBell } from '@/features/notifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart';
import { useWishlistIds } from '@/features/wishlist/hooks/useWishlist';

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount: explicitCartCount }: HeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isLoadingUser } = useAuth();
  const { data: cartData } = useCart();
  const { data: wishlistIds = [] } = useWishlistIds();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng dropdown khi click ra ngoài ô tìm kiếm
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy số lượng giỏ hàng thực tế từ API nếu đã đăng nhập
  const cartCount = isAuthenticated
    ? (cartData?.totalQuantity ?? 0)
    : (explicitCartCount !== undefined ? explicitCartCount : 0);

  // Lấy số lượng yêu thích thực tế nếu đã đăng nhập
  const wishlistCount = isAuthenticated
    ? (user?.wishlistCount ?? wishlistIds.length)
    : 0;

  const handleSearchSubmit = (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const query = (customTerm !== undefined ? customTerm : searchTerm).trim();
    if (!query) return;
    setIsSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100/90">
      {/* Main Header Bar */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-3.5 pb-2.5 sm:pb-3">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-5 lg:gap-8">
          {/* Brand Logo */}
          <Link href="/" className="order-1 shrink-0 select-none" tabIndex={-1}>
            <Logo />
          </Link>

          {/* Search Bar */}
          <div
            ref={searchContainerRef}
            className="order-3 w-full sm:order-2 sm:flex-1 sm:max-w-2xl relative"
          >
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="flex items-stretch bg-gray-50/80 border border-gray-200/70 rounded-lg overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 focus-within:bg-white transition-all shadow-2xs"
            >
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                className="flex-1 min-w-0 pl-3.5 pr-2 py-2 bg-transparent text-xs sm:text-sm placeholder:text-gray-400 placeholder:font-normal [&::placeholder]:text-[11px] sm:[&::placeholder]:text-sm border-0 outline-none focus:outline-none focus:ring-0"
              />

              {/* Nút xóa nhanh từ khóa (Clear X button) */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 mr-1 rounded-full transition cursor-pointer shrink-0 self-center"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Nút tìm kiếm đồng bộ liền mạch với viền */}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" strokeWidth={2.4} />
              </button>
            </form>

            {/* Menu gợi ý tìm kiếm sản phẩm trực tiếp (Live Search Dropdown) */}
            <SearchDropdown
              isOpen={isSearchOpen && Boolean(searchTerm.trim())}
              searchTerm={searchTerm}
              onSubmitSearch={(term) => handleSearchSubmit(undefined, term)}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>

          {/* Right Actions */}
          <div className="order-2 sm:order-3 flex items-center gap-2 sm:gap-2.5 text-gray-700 shrink-0">
            {/* Chuông thông báo in-app */}
            {mounted && isAuthenticated && <NotificationBell />}

            {/* Yêu thích (Wishlist) với Badge số lượng */}
            {!mounted ? (
              <div
                className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gray-100/90 animate-pulse flex items-center justify-center border border-gray-200/60 shrink-0"
                aria-label="Đang tải yêu thích"
              >
                <div className="w-4 h-4 rounded-full bg-gray-200/90" />
              </div>
            ) : (
              <Link
                href="/profile?tab=wishlist"
                className="w-9 sm:w-10 h-9 sm:h-10 hover:text-rose-500 text-gray-700 bg-gray-50/90 hover:bg-rose-50/80 border border-gray-200/80 hover:border-rose-300 transition-all duration-200 relative cursor-pointer flex items-center justify-center rounded-full shadow-xs hover:shadow-sm active:scale-95"
                title="Danh sách yêu thích"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-[10px] min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none shadow-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart with Badge (Skeleton hình tròn khi chưa mounted / đang tải) */}
            {!mounted ? (
              <div
                className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gray-100/90 animate-pulse flex items-center justify-center border border-gray-200/60 shrink-0"
                aria-label="Đang tải giỏ hàng"
              >
                <div className="w-4 h-4 rounded-full bg-gray-200/90" />
              </div>
            ) : (
              <Link
                href="/cart"
                className="w-9 sm:w-10 h-9 sm:h-10 hover:text-emerald-600 text-gray-700 bg-gray-50/90 hover:bg-emerald-50/80 border border-gray-200/80 hover:border-emerald-300 transition-all duration-200 relative cursor-pointer flex items-center justify-center rounded-full shadow-xs hover:shadow-sm active:scale-95"
                title="Giỏ hàng"
              >
                <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[10px] min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Tài khoản / Đăng nhập (Skeleton hình tròn khi chưa mounted hoặc đang tải user) */}
            {!mounted || (isAuthenticated && isLoadingUser && !user) ? (
              <div
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-gray-50/80 border border-gray-200/60 shrink-0"
                aria-label="Đang tải thông tin tài khoản"
              >
                {/* Vòng tròn Avatar skeleton */}
                <div className="w-8 h-8 rounded-full bg-gray-200/90 animate-pulse shrink-0 ring-2 ring-emerald-500/10 border border-white/80" />
                {/* 2 dòng chữ tên & vai trò skeleton với bo góc tròn */}
                <div className="hidden sm:flex flex-col gap-1.5 text-left">
                  <div className="w-20 h-3 rounded-full bg-gray-200/90 animate-pulse" />
                  <div className="w-14 h-2 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            ) : isAuthenticated ? (
              <Link
                href="/profile"
                className="group flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-gray-50/90 hover:bg-emerald-50/90 border border-gray-200/80 hover:border-emerald-300/90 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.99]"
                title="Tài khoản của tôi"
              >
                <UserAvatar
                  src={user?.avatarUrl}
                  name={user?.fullName}
                  size="sm"
                  showOnlineStatus
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 max-w-[125px] truncate leading-tight tracking-tight">
                    {user?.fullName || 'Tài khoản'}
                  </span>
                  <span className="text-[11px] text-gray-500 group-hover:text-emerald-700 font-semibold leading-tight mt-0.5">
                    Hồ sơ cá nhân
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition text-xs shadow-xs hover:shadow-sm active:scale-95"
                title="Đăng nhập"
              >
                <User className="w-4 h-4 text-white" strokeWidth={2.2} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Subnav with Suspense boundary */}
        <Suspense fallback={<HeaderSubNavFallback />}>
          <HeaderSubNav />
        </Suspense>
      </div>
    </header>
  );
}

function HeaderSubNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && Boolean(user?.roles?.includes('ADMIN'));

  return (
    <nav className="flex items-center gap-5 sm:gap-7 mt-3 pt-2.5 border-t border-gray-100/80 text-xs font-semibold text-gray-700 relative">
      <Link
        href="/"
        className={`pb-1 border-b-2 transition whitespace-nowrap shrink-0 ${
          isHome
            ? 'text-emerald-700 font-semibold border-emerald-600'
            : 'border-transparent hover:text-emerald-700 text-gray-700'
        }`}
      >
        Trang chủ
      </Link>

      {/* 2-Column Category Dropdown with Hover & Spacious Layout */}
      <CategoryDropdown variant="bento" />

      <Link
        href="/products?filter=promotions"
        className="pb-1 border-b-2 border-transparent text-xs font-semibold text-gray-700 hover:text-emerald-700 transition whitespace-nowrap shrink-0"
      >
        Khuyến mãi
      </Link>
      <Link
        href="/products?filter=bestseller"
        className="pb-1 border-b-2 border-transparent text-xs font-semibold text-gray-700 hover:text-emerald-700 transition whitespace-nowrap shrink-0"
      >
        Bán chạy
      </Link>

      {/* Nhóm lối tắt Kênh người bán & Quản trị Admin */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        {isAdmin && (
          <Link
            href="/admin"
            className="pb-1 text-xs font-bold text-rose-700 hover:text-rose-800 transition whitespace-nowrap flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 shadow-2xs"
            title="Bảng điều khiển Quản trị viên"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Quản trị sàn</span>
          </Link>
        )}

        <Link
          href="/seller"
          className="pb-1 border-b-2 border-transparent hover:text-emerald-700 text-emerald-600 text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 pl-1"
        >
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kênh người bán</span>
        </Link>
      </div>
    </nav>
  );
}

function HeaderSubNavFallback() {
  return (
    <nav className="flex items-center gap-5 sm:gap-7 mt-3 pt-2.5 border-t border-gray-100/80 text-xs font-semibold text-gray-700 relative">
      <Link
        href="/"
        className="pb-1 transition whitespace-nowrap shrink-0 hover:text-emerald-700 text-gray-700"
      >
        Trang chủ
      </Link>
      <div className="flex items-center gap-1.5 pb-1 text-gray-700 hover:text-emerald-700 text-xs font-semibold cursor-pointer">
        <span>Danh mục</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <Link
        href="/products?filter=promotions"
        className="pb-1 text-xs font-semibold text-gray-700 hover:text-emerald-700 transition whitespace-nowrap shrink-0"
      >
        Khuyến mãi
      </Link>
      <Link
        href="/products?filter=bestseller"
        className="pb-1 text-xs font-semibold text-gray-700 hover:text-emerald-700 transition whitespace-nowrap shrink-0"
      >
        Bán chạy
      </Link>
      <Link
        href="/seller"
        className="ml-auto pb-1 hover:text-emerald-700 text-emerald-600 text-xs font-semibold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 pl-2"
      >
        <span>Kênh người bán</span>
      </Link>
    </nav>
  );
}
