'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  RotateCcw,
  Shield,
  Headphones,
  ChevronRight,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

interface ProductSellerCardProps {
  brand?: string;
  shop?: {
    name: string;
    slug: string;
    logoKey?: string | null;
    enableFreeShipping?: boolean;
    freeShippingThreshold?: number | null;
    holidayMode?: boolean;
    holidayMessage?: string | null;
    enableReturn?: boolean;
    returnPeriodDays?: number;
    requireUnboxVideo?: boolean;
    warrantyType?: string | null;
    warrantyPeriodMonths?: number | null;
  } | null;
}

export function ProductSellerCard({ brand, shop }: ProductSellerCardProps) {
  const shopName = shop?.name || brand || 'Gian hàng chính hãng';
  const shopHref = shop?.slug ? `/shop/${shop.slug}` : '/shop';
  const logoText = shop?.name ? shop.name.charAt(0).toUpperCase() : (brand === 'Apple' ? '' : (brand?.charAt(0) || 'S'));

  const returnText =
    shop?.enableReturn !== false
      ? `Đổi trả trong ${shop?.returnPeriodDays ?? 7} ngày`
      : 'Cam kết chất lượng 100%';

  let warrantyText = 'Bảo hành chính hãng';
  if (shop?.warrantyPeriodMonths && shop?.warrantyType !== 'NONE') {
    const typeLabel =
      shop.warrantyType === 'OFFICIAL'
        ? 'chính hãng'
        : shop.warrantyType === 'SHOP'
        ? 'tại shop'
        : shop.warrantyType === 'ELECTRONIC'
        ? 'điện tử'
        : '';
    warrantyText = `Bảo hành ${shop.warrantyPeriodMonths} tháng ${typeLabel}`.trim();
  } else if (shop?.warrantyPeriodMonths) {
    warrantyText = `Bảo hành ${shop.warrantyPeriodMonths} tháng`;
  }

  const shippingText = shop?.enableFreeShipping
    ? shop.freeShippingThreshold
      ? `Freeship từ ${Number(shop.freeShippingThreshold).toLocaleString('vi-VN')}₫`
      : 'Miễn phí vận chuyển'
    : 'Hỗ trợ kỹ thuật 24/7';

  return (
    <div className="space-y-4 w-full">
      {/* 1. Hộp Thông tin Gian hàng & Cam kết chính hãng */}
      <div className="bg-white border border-gray-200/80 rounded-lg p-4 shadow-2xs space-y-3.5">
        {/* Tiêu đề gian hàng */}
        <Link
          href={shopHref}
          className="flex items-center justify-between pb-3.5 border-b border-gray-100/80 cursor-pointer group"
          title="Xem trang gian hàng"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo gian hàng / thương hiệu */}
            {shop?.logoKey ? (
              <img
                src={shop.logoKey}
                alt={shopName}
                className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {logoText}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition truncate">
                  {shopName}
                </h4>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                  Gian hàng chính hãng
                </span>
                {shop?.holidayMode && (
                  <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-0.5">
                    Tạm nghỉ bán
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition shrink-0" />
        </Link>

        {/* Danh sách 4 cam kết chất lượng */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.8} />
            <span className="font-normal truncate">100% hàng chính hãng</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.8} />
            <span className="font-normal truncate">{returnText}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.8} />
            <span className="font-normal truncate">{warrantyText}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Headphones className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.8} />
            <span className="font-normal truncate">{shippingText}</span>
          </div>
        </div>
      </div>

      {/* 2. Banner khuyến mãi "Mua kèm phụ kiện" */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#eff8f3] to-[#e6f4ec] rounded-lg p-4 flex items-center justify-between group cursor-pointer shadow-2xs">
        <div className="space-y-1 z-10">
          <span className="text-[11px] font-medium text-emerald-700">
            Mua kèm phụ kiện
          </span>
          <h5 className="text-sm font-semibold text-gray-850 leading-snug">
            Giảm thêm đến 20%
          </h5>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 group-hover:text-emerald-800 transition">
              <span>Xem ngay</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Ảnh thumbnail phụ kiện (Ốp lưng + AirPods) */}
        <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80"
            alt="Phụ kiện ưu đãi"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
