'use client';

import React, { useState } from 'react';
import { ShieldCheck, Truck, Headphones, TicketPercent, Check, ArrowRight, Loader2, X } from 'lucide-react';
import { formatVND, extractErrorMessage } from '../../lib/api-client';
import { useValidateVoucher } from '../../features/vouchers';

interface CartOrderSummaryProps {
  selectedCount: number;
  totalQuantity: number;
  shopCount: number;
  originalTotal: number;
  productDiscount: number;
  finalTotal: number;
  onCheckout: () => void;
}

export function CartOrderSummary({
  selectedCount,
  totalQuantity,
  shopCount,
  originalTotal,
  productDiscount,
  finalTotal,
  onCheckout,
}: CartOrderSummaryProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [voucherStatus, setVoucherStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateVoucherMutation = useValidateVoucher();

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherCode.trim().toUpperCase();
    if (!code) return;

    if (selectedCount === 0) {
      setVoucherMessage('Vui lòng chọn sản phẩm trong giỏ hàng để áp dụng mã giảm giá.');
      setVoucherStatus('error');
      return;
    }

    try {
      const res = await validateVoucherMutation.mutateAsync({ code });
      if (res && res.valid) {
        setAppliedVoucher(res.voucher.code);
        setVoucherDiscount(res.discountAmount);
        setVoucherMessage(res.message);
        setVoucherStatus('success');
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      const errMsg = extractErrorMessage(err, 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện.');
      setVoucherMessage(errMsg);
      setVoucherStatus('error');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherMessage(null);
    setVoucherStatus('idle');
    setVoucherCode('');
  };

  const grandTotal = Math.max(0, finalTotal - voucherDiscount);
  const totalSaved = productDiscount + voucherDiscount;

  return (
    <div className="space-y-4 w-full lg:sticky lg:top-24">
      {/* 1. Hộp Tóm tắt đơn hàng chính */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Tiêu đề & số shop / số kiện hàng */}
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-gray-900">
            Tóm tắt đơn hàng
          </h3>
          <p className="text-xs text-gray-500">
            Từ {shopCount} shop · sẽ giao thành {shopCount} kiện hàng
          </p>
        </div>

        {/* Form nhập Mã giảm giá */}
        {appliedVoucher ? (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <TicketPercent className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Mã: <strong className="font-semibold">{appliedVoucher}</strong> (-{formatVND(voucherDiscount)})
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveVoucher}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
            >
              Hủy mã
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyVoucher} className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Mã giảm giá"
                  className="w-full text-xs sm:text-sm py-2 px-3 border border-gray-200/80 rounded-lg focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={validateVoucherMutation.isPending || !voucherCode.trim()}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-emerald-500/70 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 transition cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {validateVoucherMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Kiểm tra...</span>
                  </>
                ) : (
                  'Áp dụng'
                )}
              </button>
            </div>

            {/* Thông báo voucher */}
            {voucherMessage && (
              <div
                className={`text-xs font-medium pt-0.5 ${
                  voucherStatus === 'error' ? 'text-rose-500' : 'text-emerald-600'
                }`}
              >
                {voucherMessage}
              </div>
            )}
          </form>
        )}

        {/* Danh sách các dòng tính tiền */}
        <div className="space-y-2.5 pt-2.5 text-xs sm:text-sm text-gray-600 border-t border-gray-100/80">
          <div className="flex items-center justify-between">
            <span>Tạm tính ({totalQuantity} sản phẩm)</span>
            <span className="font-semibold text-gray-900">
              {formatVND(originalTotal)}
            </span>
          </div>

          {productDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Giảm giá sản phẩm</span>
              <span className="font-semibold">
                -{formatVND(productDiscount)}
              </span>
            </div>
          )}

          {voucherDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Voucher CommerceOS</span>
              <span className="font-semibold">
                -{formatVND(voucherDiscount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Phí vận chuyển ({shopCount} shop)</span>
            <span className="font-semibold text-emerald-600">
              Miễn phí
            </span>
          </div>
        </div>

        {/* Đường gạch phân cách */}
        <div className="h-px bg-gray-100/80 w-full" />

        {/* Khối Tổng cộng */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-sm font-bold text-gray-900 block">
              Tổng cộng
            </span>
            <span className="text-xs text-gray-400 block pt-0.5">
              Đã bao gồm VAT
            </span>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-bold text-emerald-600 tracking-tight block">
              {formatVND(grandTotal)}
            </span>
          </div>
        </div>

        {/* Khung Tiết kiệm màu xanh ngọc nhạt */}
        {totalSaved > 0 && (
          <div className="py-2 px-3 bg-emerald-50/70 rounded-xl text-center">
            <span className="text-xs font-semibold text-emerald-800">
              Bạn đã tiết kiệm {formatVND(totalSaved)}
            </span>
          </div>
        )}

        {/* Nút Tiến hành thanh toán (Signature Primary CTA) */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={selectedCount === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm py-3 px-5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Tiến hành thanh toán</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Dòng Cam kết an tâm dưới cùng */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-gray-500 py-1">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo hành chính hãng</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Giao hàng nhanh</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <Headphones className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hỗ trợ 24/7</span>
        </div>
      </div>
    </div>
  );
}
