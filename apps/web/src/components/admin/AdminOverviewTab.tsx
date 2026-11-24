'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ShoppingCart,
  Package,
  Store,
  TrendingUp,
  Trophy,
  ArrowRight,
  Download,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAdminOverview, AdminTopProduct } from '@/features/admin';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatVND } from '@/lib/api-client';
import Link from 'next/link';
import { UserAvatar } from '@/components/common/UserAvatar';
import { DEFAULT_SELLER_AVATAR } from '@/constants/default-images';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: 'shops' | 'users' | 'categories') => void;
}

// -------------------------------------------------------------
// BACKGROUND CHO KHUNG CHÀO MỪNG (Khớp 100% lớp sóng hữu cơ & ánh sáng mint)
// -------------------------------------------------------------
function WelcomeBannerBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-lg">
      <svg
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="adminHeroBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3faf6" />
            <stop offset="40%" stopColor="#eaf6f0" />
            <stop offset="100%" stopColor="#ddf3e6" />
          </linearGradient>

          <radialGradient id="adminHeroGlow" cx="76%" cy="50%" r="48%">
            <stop offset="0%" stopColor="#bcf2d7" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#d9f6e7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#eaf6f0" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="adminHeroWaveBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8e8cf" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a2e4c1" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="adminHeroWaveMainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8eed9" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#b2e8cd" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#c2ecd6" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="adminHeroPodiumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b4e6cd" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#a4e1bf" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#b6e8cf" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="adminHeroCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <rect width="1000" height="160" fill="url(#adminHeroBaseGrad)" />
        <rect width="1000" height="160" fill="url(#adminHeroGlow)" />

        <g opacity="0.8">
          <path
            d="M 570 34 C 570 24 582 16 595 16 C 603 16 610 20 614 26 C 618 22 624 20 630 20 C 640 20 648 26 648 34 Z"
            fill="url(#adminHeroCloudGrad)"
          />
          <path
            d="M 680 26 C 680 18 690 12 702 12 C 709 12 715 15 719 20 C 723 17 728 15 734 15 C 743 15 750 20 750 26 Z"
            fill="url(#adminHeroCloudGrad)"
          />
          <ellipse cx="875" cy="18" rx="48" ry="11" fill="#ffffff" opacity="0.45" />
        </g>

        <path
          d="M 220 160 C 310 115 390 75 490 85 C 590 95 640 55 740 62 C 840 69 910 100 1000 110 L 1000 160 Z"
          fill="url(#adminHeroWaveBackGrad)"
        />

        <path
          d="M 280 160 C 360 125 430 95 520 108 C 610 120 660 88 770 95 C 870 102 930 130 1000 138 L 1000 160 Z"
          fill="url(#adminHeroWaveMainGrad)"
        />

        <path
          d="M 470 160 C 505 142 545 136 595 136 L 1000 136 L 1000 160 Z"
          fill="url(#adminHeroPodiumGrad)"
        />
        <path
          d="M 515 138 C 555 136 595 136 635 136 L 1000 136"
          stroke="#d7f5e5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <g transform="translate(590, 54)">
          <path d="M 0 -8.5 Q 0 0 -8.5 0 Q 0 0 0 8.5 Q 0 0 8.5 0 Q 0 0 0 -8.5 Z" fill="#22c55e" opacity="0.85" />
        </g>
        <g transform="translate(690, 28)">
          <path d="M 0 -10.5 Q 0 0 -10.5 0 Q 0 0 0 10.5 Q 0 0 10.5 0 Q 0 0 0 -10.5 Z" fill="#10b981" />
        </g>
        <g transform="translate(888, 24)">
          <path d="M 0 -9.5 Q 0 0 -9.5 0 Q 0 0 0 9.5 Q 0 0 9.5 0 Q 0 0 0 -9.5 Z" fill="#22c55e" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// ĐỒ HOẠ MINH HOẠ CỬA HÀNG + TÚI MUA SẮM + BIỂU ĐỒ TĂNG TRƯỞNG
// -------------------------------------------------------------
function WelcomeBannerIllustration() {
  return (
    <div className="relative w-76 sm:w-84 h-28 select-none pointer-events-none flex items-end justify-end">
      <svg
        viewBox="0 0 330 120"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(30, 42)">
          <ellipse cx="26" cy="68" rx="22" ry="4" fill="#047857" opacity="0.18" />
          <rect x="-6" y="38" width="18" height="26" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M-6 48 H12" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="8" y="16" width="38" height="48" rx="4" fill="#009b60" />
          <rect x="8" y="16" width="9" height="48" rx="2" fill="#047857" opacity="0.35" />
          <circle cx="27" cy="40" r="2" fill="#ffffff" opacity="0.4" />
          <path
            d="M19 16 V6.5 C19 2 33 2 33 6.5 V16"
            stroke="#047857"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        <g transform="translate(86, 12)">
          <ellipse cx="56" cy="104" rx="50" ry="4" fill="#047857" opacity="0.15" />
          <rect x="14" y="34" width="84" height="66" rx="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
          <rect x="10" y="98" width="92" height="5" rx="1.5" fill="#cbd5e1" />

          <g transform="translate(24, 48)">
            <rect width="26" height="34" rx="2.5" fill="#a7f3d0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="13" y1="0" x2="13" y2="34" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="17" x2="26" y2="17" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          <g transform="translate(62, 48)">
            <rect width="26" height="34" rx="2.5" fill="#a7f3d0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="13" y1="0" x2="13" y2="34" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="17" x2="26" y2="17" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          <path d="M5 34 L12 18 L100 18 L107 34 Z" fill="#009b60" />
          <path d="M12 18 L6 34 L18 34 L24 18 Z" fill="#00804f" />
          <path d="M24 18 L18 34 L31 34 L37 18 Z" fill="#ffffff" />
          <path d="M37 18 L31 34 L44 34 L50 18 Z" fill="#009b60" />
          <path d="M50 18 L44 34 L57 34 L63 18 Z" fill="#ffffff" />
          <path d="M63 18 L57 34 L70 34 L76 18 Z" fill="#009b60" />
          <path d="M76 18 L70 34 L83 34 L89 18 Z" fill="#ffffff" />
          <path d="M89 18 L83 34 L96 34 L101 18 Z" fill="#009b60" />
          <path d="M101 18 L96 34 L107 34 L100 18 Z" fill="#00804f" />

          <path
            d="M5 34 Q11.5 40 18 34 Q24.5 40 31 34 Q37.5 40 44 34 Q50.5 40 57 34 Q63.5 40 70 34 Q76.5 40 83 34 Q89.5 40 96 34 Q101.5 40 107 34"
            fill="none"
            stroke="#00804f"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>

        <g transform="translate(222, 18)">
          <rect x="0" y="66" width="13" height="31" rx="3" fill="#a7f3d0" />
          <rect x="18" y="49" width="13" height="48" rx="3" fill="#6ee7b7" />
          <rect x="36" y="33" width="13" height="64" rx="3" fill="#34d399" />
          <rect x="54" y="15" width="13" height="82" rx="3" fill="#009b60" />

          <path
            d="M-5 50 L14 36 L30 46 L60 8"
            fill="none"
            stroke="#00804f"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M45 8 H60 V23"
            fill="none"
            stroke="#00804f"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// BẢNG MAP TRẠNG THÁI ĐƠN HÀNG SANG TIẾNG VIỆT CHUẨN MỰC
// -------------------------------------------------------------
const ORDER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    className: 'bg-sky-50 text-sky-700 border border-sky-200/80',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    className: 'bg-sky-50 text-sky-700 border border-sky-200/80',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  EXPIRED: {
    label: 'Hết hạn',
    className: 'bg-gray-100 text-gray-600 border border-gray-200/80',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-purple-50 text-purple-700 border border-purple-200/80',
  },
};

function getOrderStatusBadge(status?: string | null) {
  if (!status) {
    return {
      label: 'Chưa rõ',
      className: 'bg-gray-100 text-gray-600 border border-gray-200/80',
    };
  }
  const key = status.toUpperCase();
  return (
    ORDER_STATUS_MAP[key] || {
      label: status,
      className: 'bg-gray-100 text-gray-700 border border-gray-200/80',
    }
  );
}

export function AdminOverviewTab({ onNavigateTab }: AdminOverviewTabProps) {
  const { user } = useAuth();
  const userName = user?.fullName || 'Quản trị viên';
  const [chartRange, setChartRange] = useState<'7' | '30' | '90'>('7');

  const { data: stats, isLoading, isError, refetch } = useAdminOverview(chartRange);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          <div className="lg:col-span-2 h-72 bg-gray-100 rounded-lg" />
          <div className="h-72 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-gray-100 shadow-2xs space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Không thể tải dữ liệu thống kê</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ. Vui lòng thử tải lại trang.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // 4 KPI kinh doanh thực tế toàn sàn
  const metrics = [
    {
      id: 'revenue',
      title: 'Doanh thu toàn sàn (GMV)',
      value: formatVND(stats.totalGMV ?? 0),
      icon: Wallet,
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'orders',
      title: 'Tổng số đơn hàng',
      value: (stats.totalOrders ?? 0).toLocaleString('vi-VN'),
      icon: ShoppingCart,
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'products',
      title: 'Tổng sản phẩm sàn',
      value: (stats.totalProducts ?? 0).toLocaleString('vi-VN'),
      icon: Package,
      iconBg: 'bg-purple-100 text-purple-600',
      action: () => onNavigateTab('categories'),
    },
    {
      id: 'shops',
      title: 'Gian hàng hoạt động',
      value: `${stats.activeShops ?? 0} / ${stats.totalShops ?? 0}`,
      icon: Store,
      iconBg: 'bg-amber-100 text-amber-600',
      action: () => onNavigateTab('shops'),
    },
  ];

  // Tính toán toạ độ SVG cho biểu đồ doanh thu
  const revenuePoints = stats.revenuePoints || [];
  const maxRevenue = Math.max(...revenuePoints.map((p) => p.value), 1000000);
  const minRevenue = 0;

  const chartYLabels = [
    formatVND(maxRevenue),
    formatVND(maxRevenue * 0.66),
    formatVND(maxRevenue * 0.33),
    '0đ',
  ];

  const svgPoints = revenuePoints.map((pt, idx) => {
    const x =
      revenuePoints.length > 1
        ? (idx / (revenuePoints.length - 1)) * 520 + 10
        : 270;
    const ratio = (pt.value - minRevenue) / (maxRevenue - minRevenue || 1);
    const y = 160 - ratio * 135;
    return { x, y, ...pt };
  });

  const linePath =
    svgPoints.length > 0
      ? svgPoints.reduce(
          (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
          '',
        )
      : '';

  const areaPath =
    svgPoints.length > 0
      ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} 170 L ${svgPoints[0].x} 170 Z`
      : '';

  const latestPoint = svgPoints.length > 0 ? svgPoints[svgPoints.length - 1] : null;

  const topProducts = stats.topProducts || [];
  const topShops = stats.topShops || [];
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-3.5 pb-2">
      {/* 1. HERO BANNER CHÀO MỪNG (Khớp 100% layout Seller) */}
      <div className="relative overflow-hidden rounded-lg border border-emerald-100/70 p-4 sm:p-5 shadow-2xs flex items-center justify-between">
        <WelcomeBannerBackground />

        <div className="relative z-10 max-w-lg">
          <h1 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight flex items-center gap-1.5">
            <span>Chào mừng trở lại, {userName}!</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1 font-normal">
            Bảng điều khiển và giám sát toàn bộ hoạt động kinh doanh trên hệ thống CommerceOS.
          </p>
          <div className="pt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('shops')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#009b60] hover:bg-[#008650] px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
            >
              <span>Quản lý gian hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-300 bg-white/80 hover:bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-2xs transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Quản lý người dùng</span>
            </button>
          </div>
        </div>

        {/* Đồ hoạ minh hoạ Cửa hàng + Túi xách + Mũi tên tăng trưởng xanh */}
        <div className="hidden md:block shrink-0 relative z-10">
          <WelcomeBannerIllustration />
        </div>
      </div>

      {/* 2. 4 THẺ CHỈ SỐ KINH DOANH CHÍNH TOÀN SÀN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const IconComp = metric.icon;

          return (
            <div
              key={metric.id}
              onClick={metric.action}
              className={`bg-white border border-gray-100 rounded-lg p-3 shadow-2xs flex items-center gap-3 transition ${
                metric.action ? 'cursor-pointer hover:shadow-xs hover:border-gray-200' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg ${metric.iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComp className="w-4 h-4 stroke-[2.2]" />
              </div>

              <div className="min-w-0">
                <span className="text-[11px] text-gray-500 font-medium block truncate">
                  {metric.title}
                </span>
                <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5 truncate">
                  {metric.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BIỂU ĐỒ DOANH THU & SẢN PHẨM NỔI BẬT (2 CỘT COMPACT GIỐNG HỆT SELLER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
        {/* Cột trái (2 phần): Biểu đồ doanh thu toàn sàn */}
        <div className="lg:col-span-2 bg-white border border-gray-100/90 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-950">Biểu đồ doanh thu toàn sàn</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setChartRange('7')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    chartRange === '7'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange('30')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    chartRange === '30'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  30 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange('90')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    chartRange === '90'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  90 ngày
                </button>
              </div>

              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition cursor-pointer"
                title="Tải xuống báo cáo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative pt-4 pb-1">
            <div className="relative h-44 sm:h-48 w-full">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 font-medium select-none pointer-events-none">
                {chartYLabels.map((val, idx) => (
                  <div key={idx} className="flex items-center w-full">
                    <span className="w-16 text-right pr-2 shrink-0 truncate">{val}</span>
                    <div className="flex-1 border-b border-gray-100" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 pl-16">
                {svgPoints.length > 0 ? (
                  <svg
                    viewBox="0 0 540 180"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {areaPath && <path d={areaPath} fill="url(#adminRevenueFill)" />}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )}

                    {latestPoint && (
                      <line
                        x1={latestPoint.x}
                        y1={latestPoint.y}
                        x2={latestPoint.x}
                        y2="170"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    )}

                    {svgPoints.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#10b981" />
                    ))}

                    {latestPoint && (
                      <>
                        <circle cx={latestPoint.x} cy={latestPoint.y} r="6" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                        <circle cx={latestPoint.x} cy={latestPoint.y} r="2.5" fill="#10b981" />
                      </>
                    )}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Chưa có dữ liệu giao dịch trong khoảng thời gian này
                  </div>
                )}

                {latestPoint && (
                  <div className="absolute right-2 top-0 -translate-y-4 bg-white border border-gray-100 rounded-lg px-2.5 py-1 shadow-md flex flex-col text-left select-none pointer-events-none">
                    <span className="text-[9px] text-gray-400 font-medium leading-none">{latestPoint.date}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-950 leading-none">{latestPoint.formattedValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pl-16 pt-2 text-[10px] text-gray-500 font-medium">
              {revenuePoints.map((pt) => (
                <span key={pt.date} className="text-center">
                  {pt.date}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải (1 phần): Top sản phẩm nổi bật toàn sàn */}
        <div className="bg-white border border-gray-100/90 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-950">Sản phẩm nổi bật sàn</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('categories')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 pt-2.5">
              {topProducts.length > 0 ? (
                topProducts.map((prod) => {
                  let badgeStyle = 'bg-amber-200 text-amber-800';
                  if (prod.rank === 2) badgeStyle = 'bg-gray-200 text-gray-700';
                  if (prod.rank === 3) badgeStyle = 'bg-amber-100 text-amber-900 border border-amber-200/60';

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between gap-2.5 p-1.5 rounded-lg hover:bg-gray-50/80 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${badgeStyle}`}
                        >
                          {prod.rank}
                        </span>

                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 block truncate">
                            {prod.shopName || 'Gian hàng chính hãng'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-gray-900 block">
                          {prod.formattedPrice}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Đang kinh doanh
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  Chưa có sản phẩm nào trên sàn
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BẢNG TOP GIAN HÀNG & ĐƠN HÀNG GẦN ĐÂY TOÀN HỆ THỐNG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Top Gian Hàng Doanh Thu */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-950">Top Gian Hàng Doanh Thu</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('shops')}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {topShops.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Chưa có gian hàng nào phát sinh đơn hàng
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topShops.map((shop, i) => (
                <div key={shop.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 font-bold text-gray-400 text-center">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-100 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={(shop as any).logoUrl || DEFAULT_SELLER_AVATAR}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_SELLER_AVATAR;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/shops/${shop.slug}`}
                        target="_blank"
                        className="font-semibold text-gray-900 truncate hover:text-emerald-600 block cursor-pointer"
                      >
                        {shop.name}
                      </Link>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Chủ: {shop.ownerName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 block">{formatVND(shop.totalRevenue ?? 0)}</span>
                    <span className="text-[10px] text-gray-400">
                      {shop.ordersCount ?? 0} đơn • {shop.productsCount ?? 0} SP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Đơn Hàng Gần Đây Toàn Sàn */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-950">Đơn Hàng Gần Đây Toàn Sàn</h3>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              {recentOrders.length} đơn gần nhất
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Chưa có đơn hàng nào phát sinh
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.status);

                return (
                  <div key={order.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        name={order.customerName}
                        size="xs"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">
                          {order.customerName} • {Array.isArray(order.shops) ? order.shops.join(', ') : 'Cửa hàng'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-gray-900 block">
                        {formatVND(order.grandTotal ?? 0)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
