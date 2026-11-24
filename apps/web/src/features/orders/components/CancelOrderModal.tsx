'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useCancelOrder } from '../hooks/useOrders';
import { toast } from 'sonner';

interface CancelOrderModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CANCEL_REASONS = [
  'Muốn thay đổi địa chỉ giao hàng',
  'Muốn thay đổi sản phẩm trong đơn (kích thước, màu sắc, số lượng)',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Đổi ý không có nhu cầu mua nữa',
  'Thời gian giao hàng dự kiến quá lâu',
  'Lý do khác',
];

export function CancelOrderModal({
  isOpen,
  orderId,
  orderNumber,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const cancelMutation = useCancelOrder();

  if (!isOpen) return null;

  const handleConfirmCancel = async () => {
    const finalReason =
      selectedReason === 'Lý do khác'
        ? customReason.trim() || 'Lý do khác'
        : selectedReason;

    try {
      await cancelMutation.mutateAsync({
        orderId,
        reason: finalReason,
      });

      toast.success('Hủy đơn hàng thành công');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Không thể hủy đơn hàng này. Vui lòng thử lại sau.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-base">Xác nhận hủy đơn hàng</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Bạn có chắc chắn muốn hủy đơn hàng{' '}
            <strong className="text-gray-900 font-semibold">
              #{orderNumber}
            </strong>
            ? Sau khi hủy, đơn hàng sẽ không thể phục hồi.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Vui lòng chọn lý do hủy:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition ${
                    selectedReason === reason
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 font-medium'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Lý do khác' && (
            <div>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập chi tiết lý do của bạn..."
                className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 text-xs sm:text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {cancelMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Xác nhận hủy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

