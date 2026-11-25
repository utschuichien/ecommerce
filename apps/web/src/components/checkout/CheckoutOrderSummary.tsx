'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/common/ProductImage';
import { Ticket, X, Plus, Minus, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { CheckoutItem } from './checkout-types';
import { formatVND } from '../../lib/api-client';

interface CheckoutOrderSummaryProps {
  items: CheckoutItem[];
  shippingFee: number;
  discount: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onApplyVoucher: (code: string) => void;
  onRemoveVoucher?: () => void;
  appliedVoucherCode?: string | null;
  voucherMessage: string | null;
  voucherStatus?: 'idle' | 'success' | 'error';
  isApplyingVoucher?: boolean;
  onSubmitOrder: () => void;
  submitButtonText?: string;
  submitButtonIcon?: React.ReactNode;
  isLoading?: boolean;
}

export function CheckoutOrderSummary({
  items,
  shippingFee,
  discount,
  onUpdateQuantity,
  onRemoveItem,
  onApplyVoucher,
  onRemoveVoucher,
  appliedVoucherCode,
  voucherMessage,
  voucherStatus = 'idle',
  isApplyingVoucher = false,
  onSubmitOrder,
  submitButtonText = 'Tiếp tục thanh toán',
  submitButtonIcon = <ArrowRight className="w-4 h-4" />,
  isLoading = false,
}: CheckoutOrderSummaryProps) {
  const [voucherCode, setVoucherCode] = useState('');

  // Tính tổng tạm tính
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleSubmitVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    onApplyVoucher(voucherCode.trim());
  };

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* 1. Header tóm tắt & Link Sửa giỏ hàng */}
      <div className="flex items-center justify-between pb-0.5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">
          Đơn hàng của bạn{' '}
          <span className="font-normal text-xs text-gray-500">
            ({totalCount} sản phẩm)
          </span>
        </h3>
        <Link
          href="/cart"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          Sửa
        </Link>
      </div>

      {/* 2. Danh sách sản phẩm trong đơn */}
      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-0.5 scrollbar-none divide-y divide-gray-100/80">
        {items.map((item) => (
          <div key={item.id} className="pt-2.5 first:pt-0 relative group">
            {/* Nút xóa sản phẩm góc trên bên phải */}
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="absolute cursor-pointer right-0 top-2.5 text-gray-300 hover:text-gray-600 transition p-0.5"
              title="Xóa sản phẩm"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              {/* Ảnh sản phẩm vuông viền nhẹ */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-50/80 p-1 shrink-0 relative overflow-hidden flex items-center justify-center">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>

              {/* Thông tin sản phẩm & Tăng giảm số lượng */}
              <div className="flex-1 min-w-0 pr-5">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.variant}
                </p>
                {item.shopName && (
                  <p className="text-[11px] font-medium text-emerald-700 truncate">
                    Shop: {item.shopName}
                  </p>
                )}
                <p className="text-xs font-semibold text-gray-900 mt-0.5">
                  {formatVND(item.price)}
                </p>

                {/* Bộ đếm số lượng & Thành tiền trên 1 hàng */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200/80 rounded-lg bg-gray-50/50">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Ô nhập mã giảm giá */}
      <div className="space-y-1.5 pt-0.5">
        {appliedVoucherCode ? (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Mã: <strong className="font-semibold">{appliedVoucherCode}</strong> (-{formatVND(discount)})
              </span>
            </div>
            {onRemoveVoucher && (
              <button
                type="button"
                onClick={onRemoveVoucher}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
              >
                Hủy mã
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitVoucher} className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Mã giảm giá (Sàn hoặc Shop)"
                className="w-full pl-8 pr-2.5 py-2 bg-white border border-gray-200/80 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isApplyingVoucher || !voucherCode.trim()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {isApplyingVoucher ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Kiểm tra...</span>
                </>
              ) : (
                'Áp dụng'
              )}
            </button>
          </form>
        )}

        {voucherMessage && (
          <p
            className={`text-xs font-medium pt-0.5 ${
              voucherStatus === 'error' ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {voucherMessage}
          </p>
        )}
      </div>

      {/* 4. Chi tiết tính tiền */}
      <div className="space-y-1.5 pt-2 border-t border-gray-100/80 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Tạm tính ({totalCount} sản phẩm)</span>
          <span className="font-semibold text-gray-900">{formatVND(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-gray-900">{formatVND(shippingFee)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-gray-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Giảm giá</span>
          </span>
          <span className="font-semibold text-emerald-600">
            {discount > 0 ? `- ${formatVND(discount)}` : '- 0₫'}
          </span>
        </div>
      </div>

      {/* 5. Khối Tổng cộng */}
      <div className="pt-2 border-t border-gray-100/80 flex items-baseline justify-between">
        <span className="text-sm font-bold text-gray-900">
          Tổng cộng
        </span>
        <span className="text-lg sm:text-xl font-bold text-emerald-600 tracking-tight">
          {formatVND(grandTotal)}
        </span>
      </div>

      {/* 6. Điều khoản dịch vụ */}
      <p className="text-[11px] text-gray-400 text-center leading-relaxed">
        Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của CommerceOS.
      </p>

      {/* 7. Nút CTA Chính */}
      <button
        type="button"
        disabled={isLoading}
        onClick={onSubmitOrder}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white font-semibold text-sm py-3 px-5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            <span>Đang xử lý đơn hàng...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 shrink-0" />
            <span>{submitButtonText}</span>
            {submitButtonIcon}
          </>
        )}
      </button>
    </div>
  );
}
