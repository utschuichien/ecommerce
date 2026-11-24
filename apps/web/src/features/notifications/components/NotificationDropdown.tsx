'use client';

import React, { useState } from 'react';
import { CheckCheck, BellOff, Loader2 } from 'lucide-react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const [filterUnread, setFilterUnread] = useState(false);

  const { data, isLoading } = useNotifications({
    unreadOnly: filterUnread,
    limit: 30,
  });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  if (!isOpen) return null;

  // Trích xuất mảng an toàn để chống lỗi TypeError nếu API trả về lồng object
  const rawPayload: any = data?.data ?? data;
  const notifications = Array.isArray(rawPayload?.data)
    ? rawPayload.data
    : Array.isArray(rawPayload)
    ? rawPayload
    : Array.isArray(data)
    ? data
    : [];

  const unreadCount =
    data?.pagination?.unreadCount ??
    (data as any)?.data?.pagination?.unreadCount ??
    rawPayload?.pagination?.unreadCount ??
    0;

  return (
    <>
      {/* Overlay vô hình bắt click-outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Menu Container */}
      <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-xl shadow-xl border border-gray-100/90 z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">
              Thông báo
            </span>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              title="Đánh dấu đã đọc tất cả"
            >
              {isMarkingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span>Đã đọc tất cả</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b border-gray-100 flex gap-2 text-xs bg-white">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
              !filterUnread
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
              filterUnread
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {/* Notification List Body */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 overscroll-contain">
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Đang tải thông báo...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <BellOff className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-600">
                {filterUnread
                  ? 'Bạn không có thông báo chưa đọc nào'
                  : 'Chưa có thông báo nào'}
              </p>
              <p className="text-[11px] text-gray-400">
                Mọi thông tin đơn hàng và cập nhật sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            notifications.map((item: any) => (
              <NotificationItem
                key={item.publicId || item.id}
                item={item}
                onRead={(id) => markAsRead(id)}
                onCloseDropdown={onClose}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

