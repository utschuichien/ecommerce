'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Box,
  ShoppingCart,
  Package,
  TrendingUp,
  Settings,
  Ticket,
  ChevronRight,
  Headphones,
  ArrowRight,
  LogOut,
  BadgeCheck,
} from 'lucide-react';
import { SellerTabType } from './seller-types';

interface SellerSidebarProps {
  activeTab: SellerTabType;
  onTabChange: (tab: SellerTabType) => void;
  storeName?: string;
}

export function SellerSidebar({
  activeTab,
  onTabChange,
  storeName = 'My Store',
}: SellerSidebarProps) {
  const navItems: {
    id: SellerTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Tổng quan', icon: Home },
    { id: 'products', label: 'Quản lý sản phẩm', icon: Box },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
    { id: 'inventory', label: 'Quản lý kho hàng', icon: Package },
    { id: 'vouchers', label: 'Mã giảm giá', icon: Ticket },
    { id: 'analytics', label: 'Thống kê & Doanh thu', icon: TrendingUp },
    { id: 'settings', label: 'Cài đặt cửa hàng', icon: Settings },
  ];

  return (
    <aside className="w-60 xl:w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col justify-between p-3.5 h-screen sticky top-0 select-none overflow-y-auto overflow-x-hidden">
      {/* KHỐI TRÊN: LOGO + MENU ĐIỀU HƯỚNG */}
      <div className="space-y-4">
        {/* Logo CommerceOS + Badge Seller */}
        <Link href="/" className="flex items-center gap-2.5 px-1.5 pt-0.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight block leading-tight">
              CommerceOS
            </span>
            <span className="inline-block px-1.5 py-0.2 rounded-full border border-gray-200 text-[9px] font-semibold text-gray-500">
              Seller
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng (Có thanh chỉ báo xanh ở mép trái mục active) */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md  text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-2xs before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3.5px] before:bg-emerald-600 before:rounded-r-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* KHỐI DƯỚI: THẺ MY STORE + CẦN HỖ TRỢ + ĐĂNG XUẤT */}
      <div className="space-y-3 pt-2 relative">
        {/* Nền sóng lượn mờ ở chân sidebar */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-50/40 to-transparent pointer-events-none -z-10 rounded-b-xl" />

        {/* Thẻ cửa hàng: My Store (Đặt bên dưới menu, phía trên card hỗ trợ) */}
        <div className="p-2 rounded-md border border-gray-100 bg-white hover:bg-gray-50/80 shadow-2xs transition cursor-pointer flex items-center justify-between gap-2 group">
          <div className="flex items-center gap-2 min-w-0">
            {/* Ảnh đại diện shop */}
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-2xs text-base">
              🏪
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-950 truncate">
                  {storeName}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 fill-emerald-100" />
              </div>
              <p className="text-[10px] text-gray-400 truncate">Cửa hàng của bạn</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>

        {/* Card Cần hỗ trợ? */}
        <div className="rounded-xl p-3 text-center bg-gradient-to-b from-[#eaf7f1] to-[#f4faf6] border border-emerald-100/70 shadow-2xs">
          <div className="w-8 h-8 mx-auto rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xs mb-1.5">
            <Headphones className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-gray-900">Cần hỗ trợ?</h4>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
            Đội ngũ CommerceOS luôn sẵn sàng hỗ trợ bạn!
          </p>
          <button
            type="button"
            className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
          >
            <span>Liên hệ ngay</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
