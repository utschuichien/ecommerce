'use client';

import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: React.ReactNode;
  itemInfo?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Component Modal Xác nhận Xóa chung (Reusable Confirm Delete Modal)
 * Dùng chung cho toàn bộ dự án: Sản phẩm, Đơn hàng, Danh mục, Người dùng, Giỏ hàng...
 */
export function ConfirmDeleteModal({
  isOpen,
  title = 'Xác nhận xóa?',
  itemName,
  description,
  itemInfo,
  confirmText = 'Xóa vĩnh viễn',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  variant = 'danger',
  icon,
  confirmIcon,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const colorStyles = {
    danger: {
      badge: 'bg-rose-100 text-rose-600',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      infoBg: 'bg-rose-50/60 border-rose-100 text-rose-700',
      defaultIcon: <Trash2 className="w-6 h-6 stroke-[2.2]" />,
    },
    warning: {
      badge: 'bg-amber-100 text-amber-600',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      infoBg: 'bg-amber-50/60 border-amber-100 text-amber-700',
      defaultIcon: <AlertTriangle className="w-6 h-6 stroke-[2.2]" />,
    },
    info: {
      badge: 'bg-emerald-100 text-emerald-600',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      infoBg: 'bg-emerald-50/60 border-emerald-100 text-emerald-700',
      defaultIcon: <AlertTriangle className="w-6 h-6 stroke-[2.2]" />,
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 text-center relative">
        {/* Nút đóng góc trên */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-3.5 top-3.5 w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon cảnh báo nổi bật */}
        <div className={`w-12 h-12 rounded-full ${colorStyles.badge} flex items-center justify-center mx-auto shadow-xs`}>
          {icon || colorStyles.defaultIcon}
        </div>

        {/* Nội dung thông báo */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-sm font-bold text-gray-950">{title}</h3>

          {description ? (
            <div className="text-xs text-gray-500 leading-relaxed px-1">
              {description}
            </div>
          ) : (
            <p className="text-xs text-gray-500 leading-relaxed px-1">
              Bạn có chắc chắn muốn xóa{' '}
              {itemName && (
                <span className="font-semibold text-gray-900 block truncate mt-0.5">
                  &ldquo;{itemName}&rdquo;
                </span>
              )}
              ? Thao tác này sẽ xóa vĩnh viễn và không thể khôi phục.
            </p>
          )}
        </div>

        {/* Khối thông tin chi tiết / cảnh báo mở rộng (nếu có) */}
        {itemInfo && (
          <div className={`border rounded-lg p-2 text-[11px] font-medium flex items-center justify-center gap-1.5 ${colorStyles.infoBg}`}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <div className="truncate">{itemInfo}</div>
          </div>
        )}

        {/* Các nút hành động */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-2 px-3 rounded-lg ${colorStyles.confirmBtn} text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : confirmIcon !== undefined ? (
              confirmIcon
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
