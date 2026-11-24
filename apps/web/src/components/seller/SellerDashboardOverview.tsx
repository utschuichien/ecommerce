'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Wallet,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Trophy,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useSellerOverview } from '@/features/seller';
import {
  SellerMetricCard,
  SellerTopProduct,
  SellerRecentOrder,
  SellerRevenuePoint,
} from './seller-types';

interface SellerDashboardOverviewProps {
  userName?: string;
  onNavigateTab?: (tab: string) => void;
}

// 3 Chỉ số KPI kinh doanh chính (Doanh thu, Đơn hàng, Sản phẩm)
const DEFAULT_METRICS: SellerMetricCard[] = [
  {
    id: 'revenue',
    title: 'Doanh thu',
    value: '0đ',
    changePercent: '0%',
    isPositive: true,
    type: 'revenue',
  },
  {
    id: 'orders',
    title: 'Đơn hàng',
    value: '0',
    changePercent: '0%',
    isPositive: true,
    type: 'orders',
  },
  {
    id: 'products',
    title: 'Sản phẩm',
    value: '0',
    changePercent: '0%',
    isPositive: true,
    type: 'products',
  },
];


// -------------------------------------------------------------
// BACKGROUND CHO KHUNG CHÀO MỪNG (Khớp 100% lớp sóng hữu cơ, đồi, bệ sàn & mây theo Image 1)
// -------------------------------------------------------------
function WelcomeBannerBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-2xl">
      <svg
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Nền gradient chuyển mềm mượt từ xanh mint nhạt sang tươi sáng */}
          <linearGradient id="heroBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3faf6" />
            <stop offset="40%" stopColor="#eaf6f0" />
            <stop offset="100%" stopColor="#ddf3e6" />
          </linearGradient>

          {/* Ánh sáng mint phát quang toả ra từ khu vực cửa hàng */}
          <radialGradient id="heroGlow" cx="76%" cy="50%" r="48%">
            <stop offset="0%" stopColor="#bcf2d7" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#d9f6e7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#eaf6f0" stopOpacity="0" />
          </radialGradient>

          {/* Lớp sóng hữu cơ phía sau (Đồi thoai thoải tạo chiều sâu) */}
          <linearGradient id="heroWaveBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8e8cf" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a2e4c1" stopOpacity="0.35" />
          </linearGradient>

          {/* Lớp sóng hữu cơ chính (Uốn lượn mềm mại từ giữa card sang phải) */}
          <linearGradient id="heroWaveMainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8eed9" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#b2e8cd" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#c2ecd6" stopOpacity="0.9" />
          </linearGradient>

          {/* Bệ sàn phẳng / gò đồi nâng đỡ cửa hàng, giỏ quà và cột biểu đồ */}
          <linearGradient id="heroPodiumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b4e6cd" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#a4e1bf" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#b6e8cf" stopOpacity="0.9" />
          </linearGradient>

          {/* Gradient cho đám mây trắng mềm */}
          <linearGradient id="heroCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* 1. Nền chuyển màu cơ bản */}
        <rect width="1000" height="160" fill="url(#heroBaseGrad)" />

        {/* 2. Ánh hào quang mint toả ra */}
        <rect width="1000" height="160" fill="url(#heroGlow)" />

        {/* 3. Đám mây trắng bồng bềnh phía trên góc phải */}
        <g opacity="0.8">
          <path
            d="M 570 34 C 570 24 582 16 595 16 C 603 16 610 20 614 26 C 618 22 624 20 630 20 C 640 20 648 26 648 34 Z"
            fill="url(#heroCloudGrad)"
          />
          <path
            d="M 680 26 C 680 18 690 12 702 12 C 709 12 715 15 719 20 C 723 17 728 15 734 15 C 743 15 750 20 750 26 Z"
            fill="url(#heroCloudGrad)"
          />
          <ellipse cx="875" cy="18" rx="48" ry="11" fill="#ffffff" opacity="0.45" />
        </g>

        {/* 4. Lớp sóng hữu cơ tầng 1 (Uốn lượn mềm mại từ giữa sang phải) */}
        <path
          d="M 220 160 C 310 115 390 75 490 85 C 590 95 640 55 740 62 C 840 69 910 100 1000 110 L 1000 160 Z"
          fill="url(#heroWaveBackGrad)"
        />

        {/* 5. Lớp sóng hữu cơ tầng 2 (Đường cong gợn sóng chính) */}
        <path
          d="M 280 160 C 360 125 430 95 520 108 C 610 120 660 88 770 95 C 870 102 930 130 1000 138 L 1000 160 Z"
          fill="url(#heroWaveMainGrad)"
        />

        {/* 6. Bệ sàn phẳng nằm ngang nâng đỡ toàn bộ cửa hàng, giỏ hàng & các cột biểu đồ */}
        <path
          d="M 470 160 C 505 142 545 136 595 136 L 1000 136 L 1000 160 Z"
          fill="url(#heroPodiumGrad)"
        />
        <path
          d="M 515 138 C 555 136 595 136 635 136 L 1000 136"
          stroke="#d7f5e5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 7. Các ngôi sao 4 cánh lấp lánh (Sparkles ✦) theo đúng vị trí Image 1 */}
        {/* Ngôi sao 1: Giữa văn bản và mái che (x: 590, y: 54) */}
        <g transform="translate(590, 54)">
          <path d="M 0 -8.5 Q 0 0 -8.5 0 Q 0 0 0 8.5 Q 0 0 8.5 0 Q 0 0 0 -8.5 Z" fill="#22c55e" opacity="0.85" />
        </g>
        {/* Ngôi sao 2: Phía trên bên phải mái che (x: 690, y: 28) */}
        <g transform="translate(690, 28)">
          <path d="M 0 -10.5 Q 0 0 -10.5 0 Q 0 0 0 10.5 Q 0 0 10.5 0 Q 0 0 0 -10.5 Z" fill="#10b981" />
        </g>
        {/* Ngôi sao 3: Phía trên mũi tên tăng trưởng xanh (x: 888, y: 24) */}
        <g transform="translate(888, 24)">
          <path d="M 0 -9.5 Q 0 0 -9.5 0 Q 0 0 0 9.5 Q 0 0 9.5 0 Q 0 0 0 -9.5 Z" fill="#22c55e" opacity="0.9" />
        </g>
        {/* Ngôi sao 4: Nhỏ hơn bên trái (x: 536, y: 82) */}
        <g transform="translate(536, 82)">
          <path d="M 0 -5.5 Q 0 0 -5.5 0 Q 0 0 0 5.5 Q 0 0 5.5 0 Q 0 0 0 -5.5 Z" fill="#6ee7b7" />
        </g>
        {/* Ngôi sao 5: Nhỏ trên cao (x: 792, y: 22) */}
        <g transform="translate(792, 22)">
          <path d="M 0 -6.5 Q 0 0 -6.5 0 Q 0 0 0 6.5 Q 0 0 6.5 0 Q 0 0 0 -6.5 Z" fill="#34d399" />
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// ĐỒ HOẠ MINH HOẠ 1: CỬA HÀNG + TÚI MUA SẮM + BIỂU ĐỒ TĂNG TRƯỞNG (Khớp 1:1 Image 1)
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
        {/* 1. Túi mua hàng màu xanh + Hộp quà trắng bên trái */}
        <g transform="translate(30, 42)">
          {/* Bóng đổ nhẹ dưới đáy */}
          <ellipse cx="26" cy="68" rx="22" ry="4" fill="#047857" opacity="0.18" />

          {/* Hộp quà trắng phía sau túi */}
          <rect x="-6" y="38" width="18" height="26" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M-6 48 H12" stroke="#e2e8f0" strokeWidth="1" />

          {/* Thân túi mua sắm xanh ngọc lục bảo */}
          <rect x="8" y="16" width="38" height="48" rx="4" fill="#009b60" />
          {/* Mảng đổ bóng bên trái túi */}
          <rect x="8" y="16" width="9" height="48" rx="2" fill="#047857" opacity="0.35" />
          {/* Điểm nhấn sáng ở mặt trước túi */}
          <circle cx="27" cy="40" r="2" fill="#ffffff" opacity="0.4" />

          {/* Quai túi xách hình chữ U uốn cong */}
          <path
            d="M19 16 V6.5 C19 2 33 2 33 6.5 V16"
            stroke="#047857"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 2. Cửa hàng 3D chính giữa (Awning sọc xanh/trắng, 2 cửa sổ mint đối xứng) */}
        <g transform="translate(86, 12)">
          {/* Bóng đổ đáy nhà */}
          <ellipse cx="56" cy="104" rx="50" ry="4" fill="#047857" opacity="0.15" />

          {/* Khối nhà chính màu trắng sữa */}
          <rect x="14" y="34" width="84" height="66" rx="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
          {/* Bệ móng nhà màu xám nhạt */}
          <rect x="10" y="98" width="92" height="5" rx="1.5" fill="#cbd5e1" />

          {/* Cửa sổ 1 bên trái (Kính màu xanh mint + khung chia 4 ô chữ thập trắng) */}
          <g transform="translate(24, 48)">
            <rect width="26" height="34" rx="2.5" fill="#a7f3d0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="13" y1="0" x2="13" y2="34" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="17" x2="26" y2="17" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Cửa sổ 2 bên phải (Kính màu xanh mint + khung chia 4 ô chữ thập trắng) */}
          <g transform="translate(62, 48)">
            <rect width="26" height="34" rx="2.5" fill="#a7f3d0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="13" y1="0" x2="13" y2="34" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="17" x2="26" y2="17" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Mái che sọc xanh lá / trắng (Awning có rèm lượn sóng) */}
          {/* Lớp nền mái che */}
          <path d="M5 34 L12 18 L100 18 L107 34 Z" fill="#009b60" />

          {/* Các dải sọc trắng & xanh xen kẽ */}
          <path d="M12 18 L6 34 L18 34 L24 18 Z" fill="#00804f" />
          <path d="M24 18 L18 34 L31 34 L37 18 Z" fill="#ffffff" />
          <path d="M37 18 L31 34 L44 34 L50 18 Z" fill="#009b60" />
          <path d="M50 18 L44 34 L57 34 L63 18 Z" fill="#ffffff" />
          <path d="M63 18 L57 34 L70 34 L76 18 Z" fill="#009b60" />
          <path d="M76 18 L70 34 L83 34 L89 18 Z" fill="#ffffff" />
          <path d="M89 18 L83 34 L96 34 L101 18 Z" fill="#009b60" />
          <path d="M101 18 L96 34 L107 34 L100 18 Z" fill="#00804f" />

          {/* Rèm lượn sóng đáy mái che (Scalloped fringe) */}
          <path
            d="M5 34 Q11.5 40 18 34 Q24.5 40 31 34 Q37.5 40 44 34 Q50.5 40 57 34 Q63.5 40 70 34 Q76.5 40 83 34 Q89.5 40 96 34 Q101.5 40 107 34"
            fill="none"
            stroke="#00804f"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>

        {/* 3. Biểu đồ 4 cột và mũi tên tăng trưởng xanh ngọc bên phải */}
        <g transform="translate(222, 18)">
          {/* Cột 1: Thấp nhất (Mint nhạt) */}
          <rect x="0" y="66" width="13" height="31" rx="3" fill="#a7f3d0" />
          {/* Cột 2 (Xanh lá sáng) */}
          <rect x="18" y="49" width="13" height="48" rx="3" fill="#6ee7b7" />
          {/* Cột 3 (Xanh ngọc vừa) */}
          <rect x="36" y="33" width="13" height="64" rx="3" fill="#34d399" />
          {/* Cột 4: Cao nhất (Xanh ngọc đậm) */}
          <rect x="54" y="15" width="13" height="82" rx="3" fill="#009b60" />

          {/* Mũi tên tăng trưởng zíc zắc nổi bật */}
          <path
            d="M-5 50 L14 36 L30 46 L60 8"
            fill="none"
            stroke="#00804f"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Đầu mũi tên */}
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
// BACKGROUND CHO THẺ PROMO PHÁT TRIỂN CỬA HÀNG (Khớp 100% Image 2)
// -------------------------------------------------------------
function PromoCardBackground() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-2xl">
      <svg
        viewBox="0 0 400 190"
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Nền gradient tươi sáng nhẹ nhàng */}
          <linearGradient id="promoBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3faf6" />
            <stop offset="45%" stopColor="#e8f6ef" />
            <stop offset="100%" stopColor="#d8f2e4" />
          </linearGradient>

          {/* Vầng sáng mint toả ra ở bệ laptop */}
          <radialGradient id="promoGlow" cx="75%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#bcf1d6" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#dbf5e7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#edf8f2" stopOpacity="0" />
          </radialGradient>

          {/* Gò đồi hữu cơ phía sau laptop */}
          <linearGradient id="promoHillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5edd7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b0e5c9" stopOpacity="0.7" />
          </linearGradient>

          {/* Bệ sàn oval nâng đỡ laptop và túi mua hàng */}
          <linearGradient id="promoPodiumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c6edd6" />
            <stop offset="100%" stopColor="#a9e1c1" />
          </linearGradient>
        </defs>

        {/* 1. Nền chuyển sắc cơ bản */}
        <rect width="400" height="190" fill="url(#promoBaseGrad)" />
        <rect width="400" height="190" fill="url(#promoGlow)" />

        {/* 2. Đám mây trắng bồng bềnh phía trên bầu trời */}
        <g opacity="0.85">
          <ellipse cx="265" cy="42" rx="35" ry="16" fill="#ffffff" opacity="0.65" />
          <ellipse cx="295" cy="32" rx="26" ry="14" fill="#ffffff" opacity="0.8" />
          <ellipse cx="320" cy="38" rx="20" ry="11" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Vệt khói bay mờ ảo lượn vòng trên trời (Airplane vapor trail) */}
        <path
          d="M 230 52 C 270 38, 320 32, 370 36"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          opacity="0.65"
        />

        {/* 3. Khối gò đồi xanh uốn lượn sau laptop */}
        <path
          d="M 180 190 C 205 120, 245 60, 315 54 C 365 48, 390 70, 400 95 L 400 190 Z"
          fill="url(#promoHillGrad)"
        />

        {/* 4. Bệ sàn oval lớn nâng đỡ laptop và túi */}
        <ellipse cx="295" cy="162" rx="95" ry="22" fill="url(#promoPodiumGrad)" />
        <ellipse cx="295" cy="161" rx="78" ry="14" fill="#d3f4e2" opacity="0.7" />

        {/* 5. Các ngôi sao 4 cánh lấp lánh (Sparkle ✦) theo Image 2 */}
        <g transform="translate(276, 26)">
          <path d="M 0 -8.5 Q 0 0 -8.5 0 Q 0 0 0 8.5 Q 0 0 8.5 0 Q 0 0 0 -8.5 Z" fill="#10b981" />
        </g>
        <g transform="translate(372, 68)">
          <path d="M 0 -6.5 Q 0 0 -6.5 0 Q 0 0 0 6.5 Q 0 0 6.5 0 Q 0 0 0 -6.5 Z" fill="#34d399" />
        </g>
        <g transform="translate(225, 78)">
          <path d="M 0 -4.5 Q 0 0 -4.5 0 Q 0 0 0 4.5 Q 0 0 4.5 0 Q 0 0 0 -4.5 Z" fill="#6ee7b7" />
        </g>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------
// ĐỒ HOẠ MINH HOẠ 2: LAPTOP MÀN HÌNH CỬA HÀNG + TÚI MUA SẮM (Khớp 1:1 Image 2)
// -------------------------------------------------------------
function PromoCardIllustration() {
  return (
    <div className="relative w-52 h-38 select-none pointer-events-none flex items-end justify-end">
      <svg
        viewBox="0 0 215 140"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Túi mua hàng màu xanh đặt trước góc trái của laptop */}
        <g transform="translate(64, 62)">
          {/* Bóng đổ dưới túi */}
          <ellipse cx="18" cy="48" rx="15" ry="3.5" fill="#047857" opacity="0.25" />
          {/* Thân túi xanh */}
          <rect x="2" y="12" width="32" height="38" rx="3.5" fill="#009b60" />
          {/* Đổ bóng cạnh bên */}
          <rect x="2" y="12" width="7" height="38" rx="2" fill="#00804f" opacity="0.4" />
          {/* Quai xách */}
          <path
            d="M12 12 V4.5 C12 1.5, 24 1.5, 24 4.5 V12"
            stroke="#00804f"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Laptop mở nắp hiển thị giao diện storefront với mái che */}
        <g transform="translate(94, 20)">
          {/* Bóng đổ bàn phím */}
          <ellipse cx="50" cy="98" rx="55" ry="5" fill="#047857" opacity="0.2" />

          {/* Mái che sọc xanh/trắng treo phía trên màn hình laptop */}
          <path d="M7 24 L13 9 L83 9 L89 24 Z" fill="#009b60" />
          <path d="M17 9 L11 24 L22 24 L28 9 Z" fill="#00804f" />
          <path d="M28 9 L22 24 L33 24 L39 9 Z" fill="#ffffff" />
          <path d="M39 9 L33 24 L44 24 L50 9 Z" fill="#009b60" />
          <path d="M50 9 L44 24 L55 24 L61 9 Z" fill="#ffffff" />
          <path d="M61 9 L55 24 L66 24 L72 9 Z" fill="#009b60" />
          <path d="M72 9 L66 24 L77 24 L83 9 Z" fill="#ffffff" />
          <path d="M83 9 L77 24 L89 24 L83 9 Z" fill="#00804f" />
          {/* Rèm lượn sóng đáy mái che */}
          <path
            d="M7 24 Q14 29 21 24 Q28 29 35 24 Q42 29 49 24 Q56 29 63 24 Q70 29 77 24 Q83 29 89 24"
            fill="none"
            stroke="#00804f"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Màn hình laptop (Thân cửa hàng) */}
          <rect x="13" y="24" width="70" height="54" rx="3.5" fill="#ffffff" stroke="#00804f" strokeWidth="1.8" />
          {/* 3 Cửa sổ trưng bày bên trong màn hình theo đúng Image 2 */}
          <rect x="18" y="32" width="17" height="26" rx="2" fill="#a7f3d0" opacity="0.9" stroke="#ffffff" strokeWidth="1" />
          <rect x="40" y="32" width="17" height="26" rx="2" fill="#a7f3d0" opacity="0.9" stroke="#ffffff" strokeWidth="1" />
          <rect x="62" y="32" width="17" height="26" rx="2" fill="#a7f3d0" opacity="0.9" stroke="#ffffff" strokeWidth="1" />
          {/* Bệ trưng bày phía dưới */}
          <rect x="18" y="62" width="61" height="9" rx="1.5" fill="#d1fae5" />

          {/* Thân bàn phím laptop nằm vát góc 3D */}
          <path d="M-6 82 L104 82 L95 94 L3 94 Z" fill="#334155" />
          <rect x="36" y="85" width="26" height="2.5" rx="1" fill="#64748b" />
          <rect x="4" y="93" width="90" height="2.5" rx="0.5" fill="#1e293b" />
        </g>
      </svg>
    </div>
  );
}

export function SellerDashboardOverview({
  userName = 'Nguyễn Văn A',
  onNavigateTab,
}: SellerDashboardOverviewProps) {
  const [chartRange, setChartRange] = useState<'7' | '30' | '90'>('7');
  const { data: overviewData } = useSellerOverview(chartRange);

  const metrics = overviewData?.metrics || DEFAULT_METRICS;
  const topProducts = overviewData?.topProducts || [];
  const recentOrders = overviewData?.recentOrders || [];
  const revenuePoints = overviewData?.revenuePoints || [];

  // Tính toán biểu đồ doanh thu động từ revenuePoints thực tế
  const maxRevenueVal = revenuePoints.length > 0 ? Math.max(...revenuePoints.map((p) => p.value), 0) : 0;
  const yMax = maxRevenueVal > 0 ? Math.ceil(maxRevenueVal * 1.25) : 50;

  const chartYLabels = [
    `${yMax}tr`,
    `${Math.round(yMax * 0.8)}tr`,
    `${Math.round(yMax * 0.6)}tr`,
    `${Math.round(yMax * 0.4)}tr`,
    `${Math.round(yMax * 0.2)}tr`,
    '0tr',
  ];

  const svgPoints = revenuePoints.map((pt, idx) => {
    const x = revenuePoints.length > 1 ? 20 + (idx / (revenuePoints.length - 1)) * 480 : 260;
    const y = 165 - (yMax > 0 ? (pt.value / yMax) * 140 : 0);
    return { ...pt, x, y };
  });

  const linePath =
    svgPoints.length > 0
      ? svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';

  const areaPath =
    svgPoints.length > 0
      ? `${linePath} L ${svgPoints[svgPoints.length - 1].x.toFixed(1)} 170 L ${svgPoints[0].x.toFixed(1)} 170 Z`
      : '';

  const latestPoint = svgPoints.length > 0 ? svgPoints[svgPoints.length - 1] : null;

  return (
    <div className="space-y-3.5 pb-2">
      {/* 1. HERO BANNER CHÀO MỪNG */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-100/70 p-4 sm:p-5 shadow-2xs flex items-center justify-between">
        <WelcomeBannerBackground />

        <div className="relative z-10 max-w-lg">
          <h1 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight flex items-center gap-1.5">
            <span>Chào mừng trở lại, {userName}!</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1 font-normal">
            Cùng phát triển cửa hàng của bạn với CommerceOS nhé!
          </p>
          <div className="pt-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab?.('products')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#009b60] hover:bg-[#008650] px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
            >
              <span>Quản lý sản phẩm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Đồ hoạ minh hoạ Cửa hàng + Túi xách + Mũi tên tăng trưởng xanh */}
        <div className="hidden md:block shrink-0 relative z-10">
          <WelcomeBannerIllustration />
        </div>
      </div>

      {/* 2. 3 THẺ CHỈ SỐ KINH DOANH CHÍNH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((metric) => {
          let iconBg = 'bg-emerald-100 text-emerald-600';
          let IconComp = Wallet;

          if (metric.type === 'orders') {
            iconBg = 'bg-blue-100 text-blue-600';
            IconComp = ShoppingCart;
          } else if (metric.type === 'products') {
            iconBg = 'bg-purple-100 text-purple-600';
            IconComp = Package;
          }

          return (
            <div
              key={metric.id}
              className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition"
            >
              <div
                className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
              >
                <IconComp className="w-4 h-4 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[11px] text-gray-500 font-medium block">
                  {metric.title}
                </span>
                <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
                  {metric.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BIỂU ĐỒ DOANH THU & SẢN PHẨM BÁN CHẠY (2 CỘT COMPACT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
        {/* Cột trái (2 phần): Biểu đồ doanh thu */}
        <div className="lg:col-span-2 bg-white border border-gray-100/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-950">Biểu đồ doanh thu</h3>
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
                    <span className="w-8 text-right pr-2 shrink-0">{val}</span>
                    <div className="flex-1 border-b border-gray-100" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 pl-8">
                {svgPoints.length > 0 ? (
                  <svg
                    viewBox="0 0 540 180"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {areaPath && <path d={areaPath} fill="url(#revenueFill)" />}
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
                  <div className="absolute right-2 top-0 -translate-y-4 bg-white border border-gray-100 rounded-xl px-2.5 py-1 shadow-md flex flex-col text-left select-none pointer-events-none">
                    <span className="text-[9px] text-gray-400 font-medium leading-none">{latestPoint.date}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-950 leading-none">{latestPoint.formattedValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pl-8 pt-2 text-[10px] text-gray-500 font-medium">
              {revenuePoints.map((pt) => (
                <span key={pt.date} className="text-center">
                  {pt.date}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải (1 phần): Sản phẩm bán chạy */}
        <div className="bg-white border border-gray-100/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-950">Sản phẩm bán chạy</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab?.('products')}
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
                      className="flex items-center justify-between gap-2.5 p-1.5 rounded-xl hover:bg-gray-50/80 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs ${badgeStyle}`}
                        >
                          {prod.rank}
                        </span>

                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-0.5 shrink-0 relative overflow-hidden flex items-center justify-center">
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              sizes="40px"
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">
                            Đã bán {prod.soldCount} sản phẩm
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                        {prod.revenueText}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-1.5">
                  <Package className="w-6 h-6 text-gray-300" />
                  <span>Chưa có sản phẩm nào</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ĐƠN HÀNG GẦN ĐÂY & THẺ PHÁT TRIỂN CỬA HÀNG (2 CỘT COMPACT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
        {/* Cột trái (2 phần): Bảng đơn hàng gần đây */}
        <div className="lg:col-span-2 bg-white border border-gray-100/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-950">Đơn hàng gần đây</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab?.('orders')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto mt-1">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="py-2 px-2.5">Mã đơn hàng</th>
                    <th className="py-2 px-2.5">Khách hàng</th>
                    <th className="py-2 px-2.5">Tổng tiền</th>
                    <th className="py-2 px-2.5">Trạng thái</th>
                    <th className="py-2 px-2.5 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => {
                      let badgeColor = 'bg-amber-100 text-amber-800';
                      if (order.statusColor === 'green') badgeColor = 'bg-emerald-100 text-emerald-800';
                      if (order.statusColor === 'blue') badgeColor = 'bg-blue-100 text-blue-800';
                      if (order.statusColor === 'teal') badgeColor = 'bg-teal-100 text-teal-800';

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/60 transition">
                          <td className="py-2 px-2.5 font-bold text-gray-950">
                            {order.orderNumber}
                          </td>
                          <td className="py-2 px-2.5 text-gray-700 font-medium">
                            {order.customerName}
                          </td>
                          <td className="py-2 px-2.5 font-semibold text-gray-900">
                            {order.totalAmount.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-2 px-2.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}`}
                            >
                              {order.statusLabel}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-right text-gray-500 text-[10px]">
                            {order.createdAt}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                        Chưa có đơn hàng nào phát sinh
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cột phải (1 phần): Thẻ Phát triển cửa hàng cùng CommerceOS (Có background đồi mây, bệ sàn oval khớp 1:1 Image 2) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100/80 p-4 flex flex-col justify-between shadow-2xs">
          <PromoCardBackground />

          <div className="relative z-10 space-y-1.5 max-w-[195px]">
            {/* Icon 3 cột + mũi tên tăng trưởng trực tiếp không dùng hộp nền theo Image 2 */}
            <div className="text-[#009b60] mb-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="14" width="3.5" height="8" rx="1" fill="#009b60" />
                <rect x="7.5" y="10" width="3.5" height="12" rx="1" fill="#009b60" />
                <rect x="13" y="6" width="3.5" height="16" rx="1" fill="#009b60" />
                <path
                  d="M13 3 H21 V11"
                  stroke="#009b60"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 3 L14 10"
                  stroke="#009b60"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-gray-950 leading-snug">
              Phát triển cửa hàng cùng CommerceOS
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Khám phá các công cụ và tính năng hỗ trợ bán hàng hiệu quả hơn.
            </p>
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#009b60] hover:bg-[#008650] px-4 py-2 text-[11px] font-semibold text-white shadow-xs transition active:scale-95"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 pointer-events-none z-10">
            <PromoCardIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}
