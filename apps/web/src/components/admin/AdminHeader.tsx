'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  LogOut,
  Store,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { NotificationBell } from '@/features/notifications';
import { AdminTabType } from './admin-types';

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onNavigateTab?: (tab: AdminTabType) => void;
}

export function AdminHeader({
  userName = 'Quản trị viên',
  userEmail,
  avatarUrl,
  onSearch,
  onLogout,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Phím tắt Ctrl + K để focus nhanh vào ô tìm kiếm
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
    searchInputRef.current?.focus();
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 select-none">
      {/* Ô tìm kiếm toàn hệ thống kèm phím tắt Ctrl + K */}
      <div className="relative w-80 sm:w-96 max-w-full">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Tìm nhanh shop, người dùng, đơn hàng..."
          className="w-full pl-9 pr-16 py-2 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/40 hover:border-gray-200/70 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-xs text-gray-800 placeholder-gray-400 outline-none transition"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100/80 border border-gray-200/50 rounded-md select-none pointer-events-none">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Góc phải: Thông báo Realtime & Hồ sơ Quản trị viên */}
      <div className="flex items-center gap-3">
        {/* Nút Chuông Thông Báo */}
        <NotificationBell
          className="relative w-9 h-9 rounded-lg border border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/80 text-gray-600 shadow-2xs flex items-center justify-center transition cursor-pointer active:scale-95"
          badgeClassName="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none shadow-xs animate-in zoom-in-75"
        />

        {/* Profile Pill Admin (Custom Pill) */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
            }}
            className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition cursor-pointer group ${
              isProfileOpen
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                : 'bg-white border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 shadow-2xs'
            }`}
          >
            <UserAvatar
              src={avatarUrl}
              name={userName}
              size="sm"
              showOnlineStatus
            />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition block leading-tight max-w-[120px] truncate">
                {userName}
              </span>
              <span className="text-[10px] text-purple-600 font-semibold block leading-none mt-0.5">
                Quản trị viên
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${
                isProfileOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {/* Menu Dropdown Tài khoản Admin */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              {/* Header card tài khoản */}
              <div className="px-3.5 py-2.5 flex items-center gap-3 border-b border-gray-100 bg-gray-50/40 rounded-t-lg">
                <UserAvatar
                  src={avatarUrl}
                  name={userName}
                  size="md"
                  showOnlineStatus
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-xs truncate">
                    {userName}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {userEmail}
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Admin Portal
                  </span>
                </div>
              </div>

              {/* Các liên kết chuyển đổi */}
              <div className="p-1 space-y-0.5">
                <Link
                  href="/seller"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-emerald-700 font-medium transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                    <span>Kênh Người Bán</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                <Link
                  href="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-emerald-700 font-medium transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-gray-500" />
                    <span>Xem trang mua sắm</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </div>

              {/* Đăng xuất */}
              {onLogout && (
                <div className="pt-1 mt-1 border-t border-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50/70 font-semibold transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
