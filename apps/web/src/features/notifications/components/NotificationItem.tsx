'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Star, Ticket, Bell, Check } from 'lucide-react';
import { NotificationItem as INotificationItem } from '../types/notification.types';

interface NotificationItemProps {
  item: INotificationItem;
  onRead: (publicId: string) => void;
  onCloseDropdown?: () => void;
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

export function NotificationItem({
  item,
  onRead,
  onCloseDropdown,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!item.isRead) {
      onRead(item.publicId);
    }
    if (onCloseDropdown) {
      onCloseDropdown();
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case 'ORDER':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
            <Package className="w-4 h-4" />
          </div>
        );
      case 'REVIEW':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-500">
            <Star className="w-4 h-4" />
          </div>
        );
      case 'VOUCHER':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-500">
            <Ticket className="w-4 h-4" />
          </div>
        );
      case 'SYSTEM':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-500">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 p-3 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 ${
        item.isRead
          ? 'bg-white hover:bg-gray-50/70 text-gray-700'
          : 'bg-emerald-50/30 hover:bg-emerald-50/60 text-gray-900'
      }`}
    >
      {/* Icon theo loại thông báo */}
      {getIcon()}

      {/* Nội dung thông báo */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4
            className={`text-xs sm:text-sm truncate ${
              item.isRead ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'
            }`}
          >
            {item.title}
          </h4>
          <span className="text-[10px] text-gray-400 shrink-0">
            {formatTimeAgo(item.createdAt)}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {item.message}
        </p>
      </div>

      {/* Chấm tròn chưa đọc */}
      {!item.isRead && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center"
          title="Chưa đọc"
        />
      )}
    </div>
  );

  if (item.link) {
    return (
      <Link href={item.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

