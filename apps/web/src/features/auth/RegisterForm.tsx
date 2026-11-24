'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import { registerSchema } from './schemas/auth.schema';
import { toast } from 'sonner';
import { extractErrorMessage } from '../../lib/api-client';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSubmitSuccess?: () => void;
}

export function RegisterForm({ onSwitchToLogin, onSubmitSuccess }: RegisterFormProps) {
  const router = useRouter();
  const { register, isRegistering } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    // Validate bằng Zod
    const validation = registerSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
      agreeTerms,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await register(validation.data);
      toast.success('Đăng ký thành công', {
        description: 'Chào mừng bạn đến với CommerceOS!',
      });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const msg = extractErrorMessage(
        err,
        'Đăng ký tài khoản không thành công. Vui lòng thử lại.',
      );
      setServerError(msg);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Tạo tài khoản CommerceOS
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Chỉ mất vài phút để bắt đầu mua sắm cùng hàng ngàn ưu đãi.
        </p>
      </div>

      {serverError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
        {/* Họ và tên */}
        <div className="space-y-1">
          <label className="block font-medium text-gray-700 text-xs">Họ và tên</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="Nhập họ và tên của bạn"
              className={`w-full pl-9 pr-3.5 py-2 bg-white border rounded-lg text-xs placeholder:text-gray-400 focus:outline-none transition ${
                fieldErrors.fullName
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-gray-200/70 hover:border-gray-300/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              }`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block font-medium text-gray-700 text-xs">Địa chỉ email</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="name@example.com"
              className={`w-full pl-9 pr-3.5 py-2 bg-white border rounded-lg text-xs placeholder:text-gray-400 focus:outline-none transition ${
                fieldErrors.email
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-gray-200/70 hover:border-gray-300/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-1">
          <label className="block font-medium text-gray-700 text-xs">Số điện thoại</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="0912345678"
              className={`w-full pl-9 pr-3.5 py-2 bg-white border rounded-lg text-xs placeholder:text-gray-400 focus:outline-none transition ${
                fieldErrors.phone
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-gray-200/70 hover:border-gray-300/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              }`}
            />
          </div>
          {fieldErrors.phone && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1">
          <label className="block font-medium text-gray-700 text-xs">Mật khẩu</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Tối thiểu 8 ký tự"
              className={`w-full pl-9 pr-10 py-2 bg-white border rounded-lg text-xs placeholder:text-gray-400 focus:outline-none transition ${
                fieldErrors.password
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-gray-200/70 hover:border-gray-300/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-1">
          <label className="block font-medium text-gray-700 text-xs">Xác nhận mật khẩu</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Nhập lại mật khẩu"
              className={`w-full pl-9 pr-10 py-2 bg-white border rounded-lg text-xs placeholder:text-gray-400 focus:outline-none transition ${
                fieldErrors.confirmPassword
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-gray-200/70 hover:border-gray-300/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Checkbox điều khoản */}
        <div className="pt-0.5 space-y-1">
          <label className="flex items-start gap-2 cursor-pointer text-gray-600 select-none text-[11px] leading-snug">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (fieldErrors.agreeTerms) setFieldErrors((prev) => ({ ...prev, agreeTerms: undefined }));
              }}
              className="rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5 w-3.5 h-3.5 border-gray-200/80 cursor-pointer"
            />
            <span>
              Tôi đồng ý với{' '}
              <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Chính sách bảo mật
              </a>
            </span>
          </label>
          {fieldErrors.agreeTerms && (
            <p className="text-[11px] text-rose-500 font-medium pl-5">{fieldErrors.agreeTerms}</p>
          )}
        </div>

        {/* Nút Đăng ký */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-700 disabled:opacity-85 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg shadow-2xs transition flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          {isRegistering ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Đang tạo tài khoản...</span>
            </div>
          ) : (
            <>
              <span>Đăng ký</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-1">
        <div className="border-t border-gray-100 w-full"></div>
        <span className="bg-white px-3 text-[11px] text-gray-400 font-medium absolute">
          Hoặc đăng ký bằng
        </span>
      </div>

      {/* Google Login */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => alert('Đăng ký với Google')}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-200/70 hover:border-gray-300/70 hover:bg-gray-50/50 rounded-lg transition text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      {/* Switch to Login */}
      <div className="text-center text-xs text-gray-500 pt-0.5">
        <span>Đã có tài khoản? </span>
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        ) : (
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
          >
            Đăng nhập ngay
          </Link>
        )}
      </div>
    </div>
  );
}
