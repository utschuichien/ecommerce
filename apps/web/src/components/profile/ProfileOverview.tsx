'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  Heart,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MapPin,
  CreditCard,
  Wallet,
  Crown,
  Mail,
  Phone,
} from 'lucide-react';
import {
  ProfileAddress,
  ProfileOrder,
  ProfilePaymentMethod,
  ProfileTabType,
  ProfileWishlistItem,
  UserProfile,
} from './profile-types';
import { formatVND } from '../../lib/api-client';
import { ORDER_STATUS_CONFIG } from '@/features/orders/types/order-status';
import { UserAvatar } from '../common/UserAvatar';

interface ProfileOverviewProps {
  user: UserProfile;
  orders: ProfileOrder[];
  defaultAddress?: ProfileAddress | null;
  paymentMethods: ProfilePaymentMethod[];
  wishlist: ProfileWishlistItem[];
  onNavigateTab: (tab: ProfileTabType) => void;
  onViewOrderDetails?: (order: ProfileOrder) => void;
}

export function ProfileOverview({
  user,
  orders,
  defaultAddress,
  paymentMethods,
  wishlist,
  onNavigateTab,
  onViewOrderDetails,
}: ProfileOverviewProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. LỜI CHÀO ĐẦU TRANG */}
      {/* Giữ nguyên các import hiện có: UserAvatar, Mail, Phone, ShoppingBag, Heart, ShieldCheck, ChevronRight */}

      {/* 1. LỜI CHÀO */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-950 tracking-tight">
          Xin chào, {user.name}
        </h1>
        <p className="text-xs text-gray-500">
          Chào mừng bạn quay trở lại CommerceOS. Cùng khám phá những sản phẩm tuyệt vời nhé!
        </p>
      </div>

      {/* 2. HÀNG THẺ THỐNG KÊ: hồ sơ rộng hơn, 3 thẻ còn lại bằng nhau và cao bằng thẻ hồ sơ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-[1.7fr_1fr_1fr_1fr] gap-3">
        {/* THẺ 1: Hồ sơ */}
        <div className="sm:col-span-3 xl:col-span-1 bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
          <UserAvatar
            src={user.avatar}
            name={user.name}
            size="lg"
            className="w-12 h-12 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-gray-950 truncate">{user.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold shrink-0">
                {user.membershipTier}
              </span>
            </div>

            <div className="mt-1 space-y-0.5 text-[11px] text-gray-500">
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                <span>{user.phone}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('personal-info')}
              className="mt-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-600/60 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>

        {/* THẺ 2: Đơn hàng */}
        <button
          type="button"
          onClick={() => onNavigateTab('orders')}
          className="group bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between gap-3 text-left hover:border-emerald-200 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
          </div>
          <div>
            <p className="h-7 flex items-center text-xl font-bold text-gray-950 leading-none">
              {user.ordersCount}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Đơn hàng</p>
          </div>
        </button>

        {/* THẺ 3: Yêu thích */}
        <button
          type="button"
          onClick={() => onNavigateTab('wishlist')}
          className="group bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between gap-3 text-left hover:border-emerald-200 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
          </div>
          <div>
            <p className="h-7 flex items-center text-xl font-bold text-gray-950 leading-none">
              {user.wishlistCount}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Sản phẩm yêu thích</p>
          </div>
        </button>

        {/* THẺ 4: Trạng thái tài khoản */}
        <button
          type="button"
          onClick={() => onNavigateTab('security')}
          className="group bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between gap-3 text-left hover:border-emerald-200 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
          </div>
          <div>
            <p className="h-7 flex items-center gap-1.5 text-sm font-semibold text-gray-950 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Đang hoạt động
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Tài khoản</p>
          </div>
        </button>
      </div>

      {/* 3. KHU VỰC GIỮA (2 CỘT: ĐƠN HÀNG GẦN ĐÂY vs ĐỊA CHỈ & PHƯƠNG THỨC THANH TOÁN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI (7 cột): Đơn hàng gần đây */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-gray-50">
            <h2 className="text-sm sm:text-base font-bold text-gray-950">
              Đơn hàng gần đây
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 divide-y divide-gray-50">
            {orders.slice(0, 4).map((order) => {
              // Màu sắc badge trạng thái
              const statusBadgeStyles =
                order.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                  : order.status === 'shipping'
                    ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/60';

              return (
                <div
                  key={order.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-3 min-w-0 group hover:opacity-95 transition"
                  >
                    {/* Ảnh sản phẩm thumbnail */}
                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 p-1 shrink-0 relative overflow-hidden flex items-center justify-center">
                      <Image
                        src={order.image}
                        alt={order.productName}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-950 truncate group-hover:text-emerald-700 transition">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {order.date}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Badge trạng thái */}
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusBadgeStyles}`}
                    >
                      {order.statusLabel}
                    </span>

                    {/* Số tiền */}
                    <span className="text-xs font-bold text-gray-950 text-right min-w-[80px]">
                      {formatVND(order.totalAmount)}
                    </span>

                    {/* Nút xem chi tiết */}
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 bg-white rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI (5 cột): 2 khối xếp chồng (Địa chỉ mặc định & Ví/Thanh toán) */}
        <div className="lg:col-span-5 space-y-4">
          {/* KHỐI 1: Địa chỉ giao hàng mặc định */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-gray-950">
                Địa chỉ giao hàng mặc định
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('addresses')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {defaultAddress ? (
              <div
                onClick={() => onNavigateTab('addresses')}
                className="border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-3 bg-gray-50/40 hover:bg-gray-50/80 transition cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-950">
                        {defaultAddress.recipientName}
                      </span>
                      {defaultAddress.phone && (
                        <>
                          <span className="text-gray-300 text-xs">|</span>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {defaultAddress.phone}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {defaultAddress.address}
                    </p>
                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Mặc định
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition shrink-0 mt-2" />
              </div>
            ) : (
              <div
                onClick={() => onNavigateTab('addresses')}
                className="border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center bg-gray-50/30 hover:bg-emerald-50/30 hover:border-emerald-200 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Chưa có địa chỉ mặc định</p>
                  <p className="text-[11px] text-gray-500">Bấm để thêm địa chỉ giao hàng ngay</p>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI 2: Ví & phương thức thanh toán */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-gray-950">
                Ví & phương thức thanh toán
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('security')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => onNavigateTab('security')}
                  className="border border-gray-100 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-gray-200 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center shrink-0">
                      {pm.type === 'card' ? (
                        <CreditCard className="w-4 h-4" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {pm.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {pm.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {pm.provider === 'VISA' && (
                      <span className="text-[11px] font-black italic text-blue-800">
                        VISA
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. KHU VỰC CUỐI (2 CỘT: DANH SÁCH YÊU THÍCH vs BANNER ƯU ĐÃI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* CỘT TRÁI (7 cột): Danh sách yêu thích */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          {/* Giữ nguyên các import hiện có: Heart, ArrowRight (có thể đổi sang ChevronRight cho đồng bộ với các thẻ thống kê) */}

          <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-950 leading-tight truncate">
                  Danh sách yêu thích
                </h2>
                <p className="mt-0.5 text-[11px] text-gray-500 leading-tight truncate">
                  Sản phẩm bạn đã lưu để xem sau
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('wishlist')}
              className="group shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform" />
            </button>
          </div>

          {/* Lưới 5 sản phẩm yêu thích */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {wishlist.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="group border border-gray-100 hover:border-gray-200 rounded-xl p-2 bg-white transition hover:shadow-xs flex flex-col justify-between relative cursor-pointer"
              >
                {/* Icon trái tim ở góc trên bên phải */}
                <button
                  type="button"
                  className="absolute top-2 right-2 z-10 p-0.5 transition"
                  title="Yêu thích"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${item.isFavorite
                        ? 'text-emerald-600 fill-emerald-600'
                        : 'text-gray-300 hover:text-gray-500'
                      }`}
                  />
                </button>

                {/* Ảnh sản phẩm */}
                <div className="w-full aspect-square rounded-lg bg-gray-50/70 p-1 relative overflow-hidden mb-2 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="100px"
                    className="object-contain p-1 group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Thông tin tên & giá */}
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition">
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold text-gray-950 pt-0.5">
                    {formatVND(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI (5 cột): Banner ưu đãi dành riêng cho bạn */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-emerald-100/50 border border-emerald-100/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-[280px]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-gray-950">
                Ưu đãi dành riêng cho bạn
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              Khám phá các chương trình khuyến mãi, giảm giá độc quyền và tích điểm thành viên.
            </p>

            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-4 rounded-lg transition shadow-xs cursor-pointer"
            >
              <span>Xem ưu đãi ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minh họa túi mua sắm & hộp quà 3D ở góc dưới bên phải */}
          <div className="absolute -bottom-2 -right-2 pointer-events-none opacity-90 sm:opacity-100">
            <svg
              width="140"
              height="130"
              viewBox="0 0 140 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Túi mua sắm màu xanh ngọc */}
              <rect
                x="45"
                y="35"
                width="65"
                height="80"
                rx="10"
                fill="#009b66"
                fillOpacity="0.85"
              />
              <path
                d="M62 35V26C62 20.4772 66.4772 16 72 16H83C88.5228 16 93 20.4772 93 26V35"
                stroke="#007a50"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Hộp quà trắng thắt nơ xanh */}
              <rect
                x="15"
                y="65"
                width="45"
                height="50"
                rx="6"
                fill="#FFFFFF"
                stroke="#E5E7EB"
              />
              <rect x="35" y="65" width="6" height="50" fill="#009b66" />
              <rect x="15" y="85" width="45" height="6" fill="#009b66" />
              {/* Nơ quà */}
              <circle cx="34" cy="62" r="5" fill="#009b66" />
              <circle cx="42" cy="62" r="5" fill="#009b66" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
