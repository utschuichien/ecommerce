'use client';

import React from 'react';
import Image from 'next/image';
import { Package, ArrowRight, Gift, Sparkles } from 'lucide-react';
import { ShopInfo, ShopProduct, ShopVoucher } from './shop-types';
import { ShopProductCard } from './ShopProductCard';

interface ShopHomeTabProps {
  products: ShopProduct[];
  shop: ShopInfo;
  vouchers?: ShopVoucher[];
  savedVouchers?: Record<string, boolean>;
  onSaveVoucher?: (id: string) => void;
  onAddToCart: (product: ShopProduct) => void;
  onViewAllProducts?: () => void;
}

export function ShopHomeTab({
  products,
  shop,
  vouchers = [],
  savedVouchers = {},
  onSaveVoucher,
  onAddToCart,
  onViewAllProducts,
}: ShopHomeTabProps) {
  // Lấy top voucher giảm giá cao nhất nếu có
  const primaryVoucher = vouchers[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. MỤC "SẢN PHẨM NỔI BẬT" - LƯỚI 4 CỘT CHUẨN MẪU THIẾT KẾ */}
      <section className="space-y-4">
        {/* Header mục: Tiêu đề + Xem tất cả */}
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Sản phẩm nổi bật
          </h2>

          <button
            type="button"
            onClick={onViewAllProducts}
            className="text-xs sm:text-[13px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Lưới sản phẩm */}
        {products.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-14 text-center space-y-2.5 shadow-2xs">
            <Package className="w-8 h-8 text-gray-300 mx-auto" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-gray-800">
              Gian hàng đang cập nhật sản phẩm
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Vui lòng quay lại sau hoặc liên hệ nhân viên tư vấn của gian hàng qua nút Nhắn tin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {products.slice(0, 8).map((p) => (
              <ShopProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. DÃY MÃ GIẢM GIÁ NHANH (NẾU CỬA HÀNG CÓ VOUCHER) */}
      {vouchers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Mã giảm giá độc quyền
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vouchers.slice(0, 3).map((v) => {
              const isSaved = !!savedVouchers[v.id];

              return (
                <div
                  key={v.id}
                  onClick={() => onSaveVoucher?.(v.id)}
                  className={`border rounded-xl p-3.5 bg-white transition cursor-pointer select-none flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] ${
                    isSaved
                      ? 'border-emerald-500/80 bg-emerald-50/20'
                      : 'border-gray-200/80 hover:border-emerald-400'
                  }`}
                  title="Nhấp để lưu mã giảm giá"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-emerald-700 block truncate">
                      {v.discountText}
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate mt-0.5">
                      {v.minSpendText}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-lg shrink-0 transition ${
                      isSaved
                        ? 'bg-emerald-100/70 text-emerald-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSaved ? 'Đã lưu ✓' : 'Lưu mã'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. BANNER KHUYẾN MÃI DƯỚI ĐÁY: "ƯU ĐÃI ĐỘC QUYỀN TỪ SHOP" BO GÓC NHẸ */}
      <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-rose-50/80 via-orange-50/40 to-slate-100/90 border border-rose-100/70 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Cụm thông tin ưu đãi */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Icon hộp quà nổi bật */}
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-white shadow-xs border border-rose-100/80 flex items-center justify-center shrink-0 text-rose-500">
              <Gift className="w-6 h-6" strokeWidth={1.8} />
            </div>

            <div className="space-y-0.5 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Ưu đãi độc quyền từ {shop.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1">
                {primaryVoucher
                  ? `${primaryVoucher.discountText} cho ${primaryVoucher.minSpendText.toLowerCase()}`
                  : 'Giảm thêm 10% cho đơn từ 1.000.000₫ · Áp dụng hôm nay'}
              </p>
            </div>
          </div>

          {/* Nút Mua ngay bo góc nhẹ theo màu chủ đạo Emerald */}
          <button
            type="button"
            onClick={onViewAllProducts}
            className="w-full sm:w-auto h-9.5 px-5 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 shadow-xs shrink-0"
          >
            <span>Mua ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
