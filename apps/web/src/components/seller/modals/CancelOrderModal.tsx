'use client';

import React from 'react';
import { X, AlertTriangle, Ban, Loader2, RotateCcw } from 'lucide-react';
import { SellerOrderRecord } from './OrderDetailModal';

interface CancelOrderModalProps {
  isOpen: boolean;
  order: SellerOrderRecord | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void> | void;
}

export function CancelOrderModal({
  isOpen,
  order,
  isLoading = false,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || isLoading) return;
    onConfirm(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Mã đơn: #{order.orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-600">
            <span>Khách hàng:</span>
            <span className="font-semibold text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Tổng giá trị đơn:</span>
            <span className="font-semibold text-rose-600">
              {Number(order.totalAmount).toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Số sản phẩm:</span>
            <span className="text-gray-700 font-medium">
              {order.items?.length || 0} sản phẩm ({order.items?.reduce((s, it) => s + it.quantity, 0) || 0} món)
            </span>
          </div>
        </div>

        {/* Cảnh báo hoàn trả kho */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <RotateCcw className="w-3.5 h-3.5 shrink-0 text-amber-700" />
            Hoàn lại hàng vào kho
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi xác nhận, toàn bộ số lượng đang giữ sẽ được tự động trả lại kho khả dụng để khách hàng khác có thể đặt mua.
          </p>
        </div>

        {/* Footer Actions */}
        <form onSubmit={handleSubmit} className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Không hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                Xác nhận hủy đơn
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
