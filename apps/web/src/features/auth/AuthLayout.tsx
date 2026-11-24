'use client';

import React from 'react';
import Link from 'next/link';
import { User, Store, ShieldCheck, ShoppingBag, KeyRound, Clock, ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

interface AuthLayoutProps {
  mode: 'login' | 'register' | 'forgot-password';
  children: React.ReactNode;
}

export function AuthLayout({ mode, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-3 sm:p-5 md:p-6 py-6 sm:py-8">
      {/* Centered Auth Card - Responsive, compact & balanced proportions */}
      <div className="w-full max-w-[940px] bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-auto md:min-h-[540px]">
        {/* Left Side: Dark Forest Green Panel with Tech Dot Pattern */}
        <div className="bg-[#05241b] p-6 sm:p-7 md:p-8 lg:p-9 text-white flex flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle Tech Dot Pattern in Background */}
          <div
            className="absolute inset-0 opacity-[0.14] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* Ambient Glowing Highlights */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Brand Logo */}
          <div className="z-10">
            <Link href="/" className="inline-block">
              <Logo
                iconClassName="h-8 w-8 shrink-0 shadow-xs"
                textClassName="text-base font-semibold tracking-tight text-white"
              />
            </Link>
          </div>

          {/* Center: Title & 3 Distinct Audience/Feature Cards */}
          <div className="py-5 sm:py-6 space-y-5 sm:space-y-6 z-10">
            {mode === 'forgot-password' ? (
              <>
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    Khôi phục tài khoản
                  </h1>
                  <p className="text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-sm">
                    Thiết lập lại mật khẩu an toàn và nhanh chóng với quy trình xác thực OTP email bảo mật đa lớp.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <KeyRound className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Xác thực OTP 2 lớp</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Mã xác thực số bảo mật gửi qua email</p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Chống tấn công Brute-force</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Tự hủy sau 5 lần nhập sai hoặc 5 phút</p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Giới hạn thời gian (Rate Limit)</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Chống spam gửi mã với cooldown 60s</p>
                    </div>
                  </div>
                </div>
              </>
            ) : mode === 'login' ? (
              <>
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    Chào mừng trở lại!
                  </h1>
                  <p className="text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-sm">
                    Đăng nhập để tiếp tục mua sắm, quản lý cửa hàng hoặc truy cập vào hệ thống quản trị.
                  </p>
                </div>

                {/* 3 Audience Cards matching user's visual style */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Card 1: Khách hàng */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Khách hàng</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Mua sắm và theo dõi đơn hàng</p>
                    </div>
                  </div>

                  {/* Card 2: Người bán */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Store className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Người bán</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Quản lý cửa hàng và sản phẩm</p>
                    </div>
                  </div>

                  {/* Card 3: Quản trị viên */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Quản trị viên</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Điều hành và giám sát hệ thống</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    Khám phá CommerceOS
                  </h1>
                  <p className="text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-sm">
                    Tạo tài khoản để mở khóa trải nghiệm mua sắm thông minh và giải pháp kinh doanh toàn diện.
                  </p>
                </div>

                {/* 3 Value Cards for Register */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Card 1: Mua sắm thông minh */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Mua sắm thông minh</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Hàng ngàn ưu đãi và voucher hấp dẫn</p>
                    </div>
                  </div>

                  {/* Card 2: Kinh doanh đa kênh */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Store className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">Kinh doanh đa kênh</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Mở gian hàng và tiếp cận khách hàng tiềm năng</p>
                    </div>
                  </div>

                  {/* Card 3: An toàn & Bảo mật */}
                  <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white tracking-tight">An toàn & Bảo mật</h3>
                      <p className="text-xs text-emerald-200/70 leading-relaxed mt-0.5">Bảo vệ tài khoản và dữ liệu giao dịch 100%</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Footer note */}
          <div className="text-[11px] text-emerald-200/40 z-10 pt-3">
            CommerceOS © 2026
          </div>
        </div>

        {/* Right Side: Form Area (50% on md+) */}
        <div className="py-6 sm:py-8 px-5 sm:px-8 md:px-10 flex flex-col justify-between bg-white">
          <div className="w-full max-w-full sm:max-w-[360px] mx-auto flex flex-col justify-between h-full">
            {/* Top Switcher Tabs or Back to Login */}
            {mode === 'forgot-password' ? (
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Quay lại đăng nhập
                </Link>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Khôi phục mật khẩu
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 border-b border-gray-100 mb-5">
                <Link
                  href="/login"
                  className={`pb-3 text-center text-xs font-medium transition relative ${
                    mode === 'login'
                      ? 'text-emerald-700 font-semibold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Đăng nhập
                  {mode === 'login' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
                <Link
                  href="/register"
                  className={`pb-3 text-center text-xs font-medium transition relative ${
                    mode === 'register'
                      ? 'text-emerald-700 font-semibold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Đăng ký
                  {mode === 'register' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
