'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  MessageSquare,
  Wallet,
  Receipt,
  Ticket,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { AdminTabType } from './admin-types';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

interface NavChildItem {
  id: AdminTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  children: NavChildItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'business',
    title: 'Kinh doanh',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-50 text-emerald-600',
    iconColor: 'text-emerald-600',
    children: [
      { id: 'shops', label: 'Quản lý Gian hàng', icon: Store },
      { id: 'products', label: 'Quản lý Sản phẩm', icon: Package },
      { id: 'orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
    ],
  },
  {
    id: 'users',
    title: 'Người dùng',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
    iconColor: 'text-blue-600',
    children: [
      { id: 'users', label: 'Quản lý Người dùng', icon: UserCheck },
      { id: 'reviews', label: 'Đánh giá & Khiếu nại', icon: MessageSquare },
    ],
  },
  {
    id: 'finance',
    title: 'Tài chính',
    icon: Wallet,
    iconBg: 'bg-amber-50 text-amber-600',
    iconColor: 'text-amber-600',
    children: [
      { id: 'payouts', label: 'Lịch sử Giải ngân', icon: Receipt },
      { id: 'vouchers', label: 'Quản lý Voucher', icon: Ticket },
    ],
  },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  // Trạng thái đóng/mở của các nhóm cha (mặc định mở tất cả)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    business: true,
    users: true,
    finance: true,
  });

  // Tự động mở nhóm cha nếu mục con đang được chọn
  useEffect(() => {
    const parentGroup = navGroups.find((g) =>
      g.children.some((c) => c.id === activeTab),
    );
    if (parentGroup) {
      setOpenGroups((prev) => ({ ...prev, [parentGroup.id]: true }));
    }
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside className="w-60 xl:w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col justify-between p-3.5 h-screen sticky top-0 select-none overflow-y-auto overflow-x-hidden">
      {/* KHỐI TRÊN: LOGO + MENU ĐIỀU HƯỚNG HIỆN ĐẠI */}
      <div className="space-y-4">
        {/* Logo CommerceOS + Badge Admin */}
        <Link href="/" className="flex items-center gap-2.5 px-1.5 pt-0.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight block leading-tight">
              CommerceOS
            </span>
            <span className="inline-block px-1.5 py-0.2 rounded-full border border-purple-200 bg-purple-50 text-[9px] font-semibold text-purple-700">
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng */}
        <nav className="space-y-3.5 pt-1">
          {/* 1. Mục đơn độc lập: Tổng quan sàn */}
          <div>
            <button
              type="button"
              onClick={() => onTabChange('overview')}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs border border-emerald-100/80 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-emerald-600 before:rounded-r-md'
                  : 'text-gray-700 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 ${
                  activeTab === 'overview' ? 'text-emerald-600' : 'text-gray-400'
                }`}
              />
              <span className="truncate">Tổng quan sàn</span>
            </button>
          </div>

          {/* 2. Các nhóm cha collapsible với khoảng cách thoáng đãng */}
          {navGroups.map((group) => {
            const isOpen = openGroups[group.id] ?? true;
            const hasActiveChild = group.children.some((c) => c.id === activeTab);
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="space-y-1.5">
                {/* Header nhóm cha: icon + tiêu đề + mũi tên đóng mở */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition cursor-pointer select-none group ${
                    hasActiveChild ? 'bg-gray-50/70' : 'hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${group.iconBg}`}
                    >
                      <GroupIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 group-hover:text-gray-900 truncate">
                      {group.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Danh sách mục con lùi dòng với khoảng cách rộng rãi, thoáng hơn */}
                {isOpen && (
                  <div className="border-l-2 border-gray-100/90 ml-5 pl-2.5 pt-1 pb-0.5 space-y-1.5 animate-in fade-in duration-150">
                    {group.children.map((child) => {
                      const isActive = activeTab === child.id;
                      const ChildIcon = child.icon;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => onTabChange(child.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition cursor-pointer text-left group ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/90 font-medium'
                          }`}
                        >
                          <ChildIcon
                            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                              isActive
                                ? 'text-emerald-600'
                                : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                          />
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* KHỐI DƯỚI: TRẠNG THÁI HỆ THỐNG + LIÊN KẾT NHANH */}
      <div className="space-y-3 pt-2 relative">
        {/* Nền sóng lượn mờ ở chân sidebar */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-50/40 to-transparent pointer-events-none -z-10 rounded-b-lg" />

        {/* Thẻ trạng thái vận hành sàn */}
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sàn vận hành
            </span>
            <span className="text-[10px] text-gray-400 font-mono">v1.0.0</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-tight">
            Tất cả dịch vụ API, CSDL và Queue hoạt động ổn định.
          </p>
        </div>

        {/* Lối tắt chuyển trang */}
        <div className="space-y-1">
          <Link
            href="/seller"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <span>Kênh Người Bán</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
              <span>Trang Mua Sắm</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
