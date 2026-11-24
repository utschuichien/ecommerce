'use client';

import React from 'react';
import {
  LayoutGrid,
  User,
  MapPin,
  Package,
  Heart,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { ProfileTabType, UserProfile } from './profile-types';
import { UserAvatar } from '../common/UserAvatar';

interface ProfileSidebarProps {
  user: UserProfile;
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  onLogout?: () => void;
}

const MENU_ITEMS: {
  id: ProfileTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutGrid },
  { id: 'personal-info', label: 'Thông tin cá nhân', icon: User },
  { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
  { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
  { id: 'wishlist', label: 'Danh sách yêu thích', icon: Heart },
  { id: 'security', label: 'Bảo mật tài khoản', icon: ShieldCheck },
];

export function ProfileSidebar({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-3.5">
      {/* 1. KHỐI THÔNG TIN NGƯỜI DÙNG (TOP) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        {/* Avatar với gradient và status indicator */}
        <UserAvatar
          src={user.avatar}
          name={user.name}
          size="lg"
          showOnlineStatus
        />

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-gray-950 truncate">
            {user.name}
          </h2>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {user.email}
          </p>
        </div>
      </div>

      {/* 2. KHỐI MENU ĐIỀU HƯỚNG */}
      <nav aria-label="Menu tài khoản" className="bg-white border border-gray-100 rounded-2xl p-2 shadow-xs space-y-0.5">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-600' : 'text-gray-800'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {!isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-800 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Nút Đăng xuất */}
        <div className="pt-1 mt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Đăng xuất</span>
            </div>
          </button>
        </div>
      </nav>

      {/* 3. KHỐI NÂNG CẤP TÀI KHOẢN (BOTTOM) */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-xs space-y-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Crown className="w-4 h-4" />
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-950">
            Nâng cấp tài khoản
          </h3>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
            Tận hưởng nhiều ưu đãi đặc quyền và trải nghiệm mua sắm tốt hơn!
          </p>
        </div>

        <button
          type="button"
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-3 rounded-md transition shadow-xs cursor-pointer"
        >
          <span>Nâng cấp ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
