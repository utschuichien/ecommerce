'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { CheckoutItem, RecipientInfo, ShippingMethod } from './checkout-types';
import { formatVND } from '../../lib/api-client';

interface CheckoutSuccessViewProps {
  orderId: string;
  recipient: RecipientInfo;
  items: CheckoutItem[];
  shipping: ShippingMethod;
  totalAmount: number;
}

export function CheckoutSuccessView({
  orderId,
  recipient,
  items,
  shipping,
  totalAmount,
}: CheckoutSuccessViewProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-center space-y-4">
      {/* Icon thành công */}
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
        <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
      </div>

      {/* Tiêu đề & Mã đơn */}
      <div className="space-y-1.5">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Đặt hàng thành công!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Cảm ơn bạn đã tin tưởng mua sắm tại CommerceOS. Chúng tôi đã gửi email xác nhận đến bạn.
        </p>
        <div className="inline-block bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-lg mt-2">
          Mã đơn hàng: #{orderId}
        </div>
      </div>

      {/* Khung tóm tắt chi tiết đơn hàng */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-6 shadow-xs text-left space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100/80">
          <PackageCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900">
            Thông tin nhận hàng
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div>
            <span className="text-gray-400 block">Người nhận:</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">
              {recipient.fullName} · {recipient.phone}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Dự kiến giao:</span>
            <span className="font-semibold text-emerald-700 mt-0.5 block">
              {shipping.estimate}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-400 block">Địa chỉ:</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">
              {[
                recipient.line1 || recipient.address,
                recipient.ward,
                recipient.district,
                recipient.province,
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        </div>

        {/* Danh sách vắn tắt sản phẩm */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <span className="text-xs text-gray-400 block">
            Sản phẩm đã mua ({items.length}):
          </span>
          {items.map((it) => (
            <div key={it.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-700 truncate pr-4">
                {it.name} <span className="text-gray-400">x{it.quantity}</span>
              </span>
              <span className="font-semibold text-gray-900 shrink-0">
                {formatVND(it.price * it.quantity)}
              </span>
            </div>
          ))}

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
            <span className="text-gray-900">Tổng thanh toán:</span>
            <span className="text-emerald-600 text-base">
              {formatVND(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Các nút hành động */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/profile?tab=orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-lg transition shadow-xs"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Xem đơn hàng của tôi</span>
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm px-6 py-3 rounded-lg transition border border-emerald-200"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tiếp tục mua sắm</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs sm:text-sm px-6 py-3 rounded-lg transition"
        >
          <span>Về trang chủ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
