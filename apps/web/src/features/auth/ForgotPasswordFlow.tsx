'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { authApi } from './api/auth.api';
import { extractErrorMessage } from '../../lib/api-client';

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export function ForgotPasswordFlow() {
  const router = useRouter();

  // Current Step
  const [step, setStep] = useState<Step>('EMAIL');

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // OTP Input Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Mask email for privacy (e.g. vo***@gmail.com)
  const maskEmail = (raw: string) => {
    if (!raw.includes('@')) return raw;
    const [name, domain] = raw.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  // --- Step 1: Send OTP to Email ---
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(cleanEmail);
      setCooldown(res.cooldownSeconds || 60);
      setStep('OTP');
      // Clear previous OTP digits
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err, 'Không thể gửi mã xác thực. Vui lòng thử lại.'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Handle OTP Input & Verification ---
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    if (cleanVal.length > 1) {
      // User pasted or typed multiple digits
      const digits = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Vui lòng nhập đầy đủ 6 chữ số mã xác thực OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), fullOtp);
      setResetToken(res.resetToken);
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err, 'Mã OTP không chính xác hoặc đã hết hạn.'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 3: Handle Reset Password ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không khớp với mật khẩu mới.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: 'Yếu', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, text: 'Trung bình', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Khá mạnh', color: 'bg-emerald-500' };
    return { score: 4, text: 'Rất mạnh', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="w-full">
      {/* 3-Step Progress Indicator */}
      {step !== 'SUCCESS' && (
        <div className="mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-100 -z-0" />

            {/* Step 1 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step === 'EMAIL'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-sm'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {step !== 'EMAIL' ? '✓' : '1'}
              </div>
              <span className="text-[10px] font-medium text-gray-500 mt-1">Email</span>
            </div>

            {/* Step 2 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step === 'OTP'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-sm'
                    : step === 'NEW_PASSWORD'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step === 'NEW_PASSWORD' ? '✓' : '2'}
              </div>
              <span className="text-[10px] font-medium text-gray-500 mt-1">Mã OTP</span>
            </div>

            {/* Step 3 Indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step === 'NEW_PASSWORD'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 shadow-sm'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                3
              </div>
              <span className="text-[10px] font-medium text-gray-500 mt-1">Mật khẩu</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: ENTER EMAIL */}
      {step === 'EMAIL' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Quên mật khẩu?
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nhập email liên kết với tài khoản của bạn để nhận mã xác thực OTP 6 số.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-gray-700">Địa chỉ Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoFocus
                placeholder="tenban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <>
                  <span>Gửi mã xác thực OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-medium text-gray-500 hover:text-emerald-700 transition"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: ENTER OTP */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Nhập mã xác thực OTP
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mã gồm 6 chữ số đã được gửi tới{' '}
              <strong className="text-gray-800 font-semibold">{maskEmail(email)}</strong>. Mã có hiệu lực trong 5 phút.
            </p>
          </div>

          {/* 6-box OTP input */}
          <div className="pt-2 pb-1">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  className="w-10 sm:w-11 h-12 text-center text-lg sm:text-xl font-bold font-mono bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 focus:bg-white transition text-gray-900"
                />
              ))}
            </div>
          </div>

          {/* Resend Cooldown Button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('EMAIL');
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Đổi email khác
            </button>

            {cooldown > 0 ? (
              <span className="text-gray-400 text-[11px] font-medium">
                Gửi lại sau <strong className="text-emerald-700 font-semibold">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestOtp()}
                disabled={isLoading}
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] transition disabled:opacity-50"
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận mã OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: ENTER NEW PASSWORD */}
      {step === 'NEW_PASSWORD' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Tạo mật khẩu mới
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vui lòng thiết lập mật khẩu mới có ít nhất 6 ký tự để bảo vệ tài khoản.
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-gray-700">Mật khẩu mới</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Độ mạnh:</span>
                  <span className="font-semibold text-gray-700">{strength.text}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full rounded-full transition-all ${
                        level <= strength.score ? strength.color : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500">Mật khẩu xác nhận chưa khớp.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isLoading ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <>
                  <span>Lưu mật khẩu mới</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 'SUCCESS' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
              Mật khẩu mới của bạn đã được cập nhật. Toàn bộ các phiên đăng nhập cũ đã được vô hiệu hóa để đảm bảo an toàn.
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

