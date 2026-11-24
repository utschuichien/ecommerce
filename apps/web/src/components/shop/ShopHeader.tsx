'use client';

import React from 'react';
import Image from 'next/image';
import {
  Star,
  Check,
  Plus,
  MessageCircle,
  Store,
  BadgeCheck,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { ShopInfo } from './shop-types';
import { DEFAULT_SELLER_AVATAR, DEFAULT_SHOP_BANNER } from '@/constants/default-images';

interface ShopHeaderProps {
  shop: ShopInfo;
  isFollowed: boolean;
  onToggleFollow: () => void;
  onOpenChat: () => void;
}

export function ShopHeader({
  shop,
  isFollowed,
  onToggleFollow,
  onOpenChat,
}: ShopHeaderProps) {
  // Banner mặc định tối giản nếu shop chưa tải banner riêng
  const bannerImage =
    shop.banner ||
    (shop as any).bannerUrl ||
    DEFAULT_SHOP_BANNER;

  const shopBio =
    shop.description && !shop.description.startsWith('{')
      ? shop.description
      : 'Cửa hàng chính hãng Apple Authorized Reseller';

  const ratingScore = shop.ratingScore ? Number(shop.ratingScore).toFixed(1) : '4.8';
  const reviewsText = shop.reviewsCount ? `${shop.reviewsCount} đánh giá` : '1.2k đánh giá';
  const followersText = shop.followersCount || '2.4k';

  return (
    <div className="space-y-4">
      {/* 1. KHU VỰC HERO BANNER BO GÓC NHẸ */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/7] min-h-[160px] max-h-[260px] rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shadow-2xs">
        <Image
          src={bannerImage}
          alt={shop.name}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />

        {/* Lớp phủ gradient nhẹ & Slogan bên phải */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/30 flex items-center justify-end pr-6 sm:pr-12 pointer-events-none">
          <div className="hidden md:flex flex-col items-end text-right text-white drop-shadow-md">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {shop.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-100 italic mt-1 max-w-xs">
              {shop.slogan || 'Công nghệ kiến tạo tương lai'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CỤM PROFILE (CHỈ CÓ AVATAR ĐÈ LÊN BANNER, CHỮ Ở DƯỚI NỀN TRẮNG) */}
      <div className="px-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Bên trái: Avatar tròn thuần trắng đè lên banner + Cụm thông tin trên nền trắng */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* Avatar tròn tràn viền full có viền trắng tinh tế (border) đè lên chân banner */}
          <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-full bg-white border-2 sm:border-[3px] border-white ring-1 ring-black/5 shadow-md -mt-12 sm:-mt-16 shrink-0 overflow-hidden z-10">
            <Image
              src={shop.logo || DEFAULT_SELLER_AVATAR}
              alt={shop.name}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>

          {/* Cụm thông tin chi tiết: NẰM HOÀN TOÀN TRÊN NỀN TRẮNG, KHÔNG ĐÈ BANNER */}
          <div className="space-y-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight truncate">
                {shop.name}
              </h1>
              <BadgeCheck
                className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 fill-sky-500 text-white shrink-0"
                aria-label="Gian hàng chính hãng đã xác minh"
              />
            </div>

            <p className="text-xs sm:text-[13px] text-gray-500 font-normal line-clamp-1 leading-snug">
              {shopBio}
            </p>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-gray-500 pt-0.5 flex-wrap">
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                <span>{ratingScore}</span>
              </span>
              <span className="text-gray-400 font-normal text-xs">
                ({reviewsText})
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-600 font-medium">
                <strong className="text-gray-900 font-semibold">{followersText}</strong> người theo dõi
              </span>
            </div>
          </div>
        </div>

        {/* Bên phải: Cụm 2 nút hành động bo góc chuẩn web tông Emerald */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={onToggleFollow}
            className={`h-9 sm:h-9.5 px-4.5 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs ${
              isFollowed
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isFollowed ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đang theo dõi</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Theo dõi</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="h-9 sm:h-9.5 px-4.5 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer border border-gray-300/90 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition active:scale-95 shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>Nhắn tin</span>
          </button>
        </div>
      </div>

      {/* 3. DÃY 4 TIÊU CHÍ CAM KẾT & DỊCH VỤ (VALUE PROPOSITION BAR) BO GÓC NHẸ */}
      <div className="bg-[#fbfcfd] border border-gray-100 rounded-xl py-3 px-4 sm:px-8 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Mục 1: Miễn phí vận chuyển */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs">
              <Truck className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
                Miễn phí vận chuyển
              </h4>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                cho đơn từ 300K
              </p>
            </div>
          </div>

          {/* Mục 2: Cam kết chính hãng */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
                Cam kết chính hãng
              </h4>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                100% nguyên seal
              </p>
            </div>
          </div>

          {/* Mục 3: Đổi trả trong 7 ngày */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs">
              <RotateCcw className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
                Đổi trả trong
              </h4>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                7 ngày miễn phí
              </p>
            </div>
          </div>

          {/* Mục 4: Hỗ trợ 24/7 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs">
              <Headphones className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-900 leading-tight truncate">
                Hỗ trợ 24/7
              </h4>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                Tư vấn tận tâm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
