'use client';

import React from 'react';
import { ShopVoucher } from './shop-types';

interface ShopVouchersProps {
  vouchers: ShopVoucher[];
  savedVouchers: Record<string, boolean>;
  onSaveVoucher: (id: string) => void;
}

export function ShopVouchers({
  vouchers,
  savedVouchers,
  onSaveVoucher,
}: ShopVouchersProps) {
  if (vouchers.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
          Mã giảm giá của shop
        </h3>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          {vouchers.length} mã có thể sử dụng
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vouchers.map((v) => {
          const isSaved = !!savedVouchers[v.id];

          // Tạo nhãn lớn ở cạnh trái (VD: 50K, 10%, FREE)
          let leftBadgeText = v.code.slice(0, 4);
          let leftSubText = 'GIẢM';
          if (v.discountText.includes('%')) {
            const match = v.discountText.match(/\d+%/);
            leftBadgeText = match ? match[0] : v.code.slice(0, 4);
          } else if (v.type === 'shipping') {
            leftBadgeText = 'FREE';
            leftSubText = 'SHIP';
          } else if (v.discountText.includes('000')) {
            const match = v.discountText.match(/\d+/);
            leftBadgeText = match ? `${Math.round(Number(match[0]))}K` : v.code.slice(0, 4);
          }

          return (
            <div
              key={v.id}
              className="relative flex bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition"
            >
              {/* Cạnh trái: Khối màu nhận diện */}
              <div className="w-[84px] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex flex-col items-center justify-center py-2.5 shrink-0 select-none">
                <b className="text-lg sm:text-xl font-black tracking-tight leading-none">
                  {leftBadgeText}
                </b>
                <span className="text-[10px] font-semibold opacity-90 tracking-wider mt-1">
                  {leftSubText}
                </span>
              </div>

              {/* 2 Notch tròn khuyết ở tiếp giáp (chuẩn CSS .v:before, .v:after) */}
              <div className="absolute left-[78px] -top-1.5 w-3 h-3 rounded-full bg-[#f6f8f8] border border-gray-200/90 z-10 pointer-events-none" />
              <div className="absolute left-[78px] -bottom-1.5 w-3 h-3 rounded-full bg-[#f6f8f8] border border-gray-200/90 z-10 pointer-events-none" />

              {/* Cạnh phải: Chi tiết ưu đãi & Nút lưu */}
              <div className="flex-1 p-3 pl-3.5 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 pr-1">
                  <p className="text-xs sm:text-[12.5px] font-bold text-gray-900 leading-snug truncate">
                    {v.discountText}
                  </p>
                  <small className="block text-[11px] text-gray-500 mt-0.5 line-clamp-1 font-normal">
                    {v.minSpendText} · {v.expiryText.replace('HSD: ', '')}
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => onSaveVoucher(v.id)}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer active:scale-95 ${
                    isSaved
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isSaved ? 'Đã lưu' : 'Lưu'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
