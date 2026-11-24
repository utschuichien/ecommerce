'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useUnreadCount } from '../hooks/useNotifications';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
  badgeClassName?: string;
}

export function NotificationBell({
  className,
  badgeClassName,
}: NotificationBellProps = {}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);

  // Kích hoạt kết nối WebSocket và cơ chế Delta Catch-up on reconnect
  useNotificationSocket();

  // Lấy số lượng thông báo chưa đọc
  const { data: unreadData } = useUnreadCount();
  const unreadCount =
    unreadData?.unreadCount ?? (unreadData as any)?.data?.unreadCount ?? 0;

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          className ||
          'w-9 sm:w-10 h-9 sm:h-10 text-gray-700 hover:text-emerald-600 bg-gray-50/90 hover:bg-emerald-50/80 border border-gray-200/80 hover:border-emerald-300 rounded-full transition-all duration-200 relative cursor-pointer flex items-center justify-center shadow-xs hover:shadow-sm active:scale-95'
        }
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={2} />

        {/* Badge số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span
            className={
              badgeClassName ||
              'absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-[10px] min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center border-2 border-white leading-none shadow-xs animate-in zoom-in-75'
            }
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover danh sách thông báo */}
      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

