'use client';

import React, { useState } from 'react';
import { Key, Smartphone, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Laptop, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth, useSessions, useRevokeSession, useRevokeAllOtherSessions } from '@/features/auth/hooks/useAuth';
import { changePasswordSchema } from '@/features/auth/schemas/auth.schema';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/api-client';

export function ProfileSecurityTab() {
  const { changePassword, isChangingPassword } = useAuth();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [serverError, setServerError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const toggleShow = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Hàm validate từng trường riêng lẻ bằng Zod
  const validateField = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    value: string,
    currentValues = passwords
  ) => {
    const dataToValidate = { ...currentValues, [field]: value };
    const result = changePasswordSchema.safeParse(dataToValidate);

    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      return issue ? issue.message : undefined;
    }
    return undefined;
  };

  const handleInputChange = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ) => {
    const updated = { ...passwords, [field]: value };
    setPasswords(updated);

    if (serverError) setServerError('');
    if (passwordSuccess) setPasswordSuccess(false);

    // Nếu đang có lỗi ở trường này, tự động validate lại bằng Zod khi gõ
    if (fieldErrors[field]) {
      const errorMsg = validateField(field, value, updated);
      setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword'
  ) => {
    // Validate bằng Zod ngay khi người dùng rời khỏi ô input
    const errorMsg = validateField(field, passwords[field]);
    if (errorMsg) {
      setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    // 1. Validate toàn bộ form bằng Zod Schema
    const validation = changePasswordSchema.safeParse(passwords);

    if (!validation.success) {
      const errors: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      } = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as
          | 'currentPassword'
          | 'newPassword'
          | 'confirmPassword';
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await changePassword({
        currentPassword: validation.data.currentPassword,
        newPassword: validation.data.newPassword,
      });

      setPasswordSuccess(true);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      const msg = extractErrorMessage(
        err,
        'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.',
      );
      setServerError(msg);
    }
  };

  const handleToggle2FA = () => {
    toast.info('Tính năng Xác thực 2 bước (2FA) đang được hoàn thiện và sẽ sớm ra mắt!');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-950">
          Bảo mật tài khoản
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Cập nhật mật khẩu và kích hoạt các phương thức bảo vệ nâng cao
        </p>
      </div>

      {/* Thông báo lỗi từ server */}
      {serverError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Thông báo cập nhật thành công */}
      {passwordSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Mật khẩu đã được thay đổi thành công!</span>
        </div>
      )}

      {/* Form Đổi mật khẩu: thêm noValidate để tắt tooltip HTML mặc định của browser */}
      <form onSubmit={handleChangePassword} noValidate className="space-y-4 max-w-md">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs sm:text-sm font-bold text-gray-900">
            Đổi mật khẩu
          </h3>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Mật khẩu hiện tại */}
          <div className="space-y-1">
            <label htmlFor="currentPassword" className="block font-semibold text-gray-700">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                onBlur={() => handleBlur('currentPassword')}
                className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  fieldErrors.currentPassword
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => toggleShow('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-[11px] text-rose-500 font-medium">
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-1">
            <label htmlFor="newPassword" className="block font-semibold text-gray-700">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  fieldErrors.newPassword
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder="Tối thiểu 8 ký tự"
              />
              <button
                type="button"
                onClick={() => toggleShow('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-[11px] text-rose-500 font-medium">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block font-semibold text-gray-700">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition ${
                  fieldErrors.confirmPassword
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Gợi ý bảo mật */}
        <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed space-y-1">
          <p className="font-semibold text-gray-700">Yêu cầu về mật khẩu an toàn:</p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-600">
            <li>Độ dài tối thiểu 8 ký tự</li>
            <li>Khác với mật khẩu hiện tại đang sử dụng</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            <span>Cập nhật mật khẩu</span>
          )}
        </button>
      </form>

      {/* Xác thực 2 bước */}
      <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-950">
              Xác thực 2 yếu tố (2FA)
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold">
              Chưa kích hoạt
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Tăng cường bảo mật với mã OTP gửi qua SMS hoặc ứng dụng Authenticator khi đăng nhập.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.info('Tính năng xác thực 2 bước qua SMS/Authenticator đang được phát triển.')}
          className="px-4 py-2 border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-center"
        >
          Kích hoạt
        </button>
      </div>

      {/* Danh sách thiết bị và phiên đăng nhập */}
      <ActiveSessionsSection />
    </div>
  );
}

function ActiveSessionsSection() {
  const { data: sessions = [], isLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllOtherSessions();

  const handleRevokeOne = async (id: string) => {
    try {
      await revokeSessionMutation.mutateAsync(id);
      toast.success('Đã đăng xuất thiết bị', {
        description: 'Phiên làm việc trên thiết bị này đã kết thúc.',
      });
    } catch {
      toast.error('Thu hồi thất bại', {
        description: 'Không thể thu hồi phiên đăng nhập lúc này.',
      });
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?')) return;
    try {
      await revokeAllMutation.mutateAsync();
      toast.success('Đã đăng xuất các thiết bị', {
        description: 'Tất cả các phiên làm việc khác đã được đóng an toàn.',
      });
    } catch {
      toast.error('Đăng xuất thất bại', {
        description: 'Không thể đăng xuất các thiết bị lúc này.',
      });
    }
  };

  return (
    <div className="pt-6 border-t border-gray-100 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-950">
              Thiết bị & Phiên đăng nhập
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Quản lý các thiết bị đang đăng nhập tài khoản của bạn
          </p>
        </div>

        {sessions.length > 1 && (
          <button
            type="button"
            disabled={revokeAllMutation.isPending}
            onClick={handleRevokeAllOther}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer self-start sm:self-center disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất thiết bị khác</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 bg-gray-200 rounded" />
                  <div className="h-2.5 w-48 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-4 text-center text-xs text-gray-400">Chưa có thông tin phiên đăng nhập</div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-950">{sess.deviceName}</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Thiết bị này
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {sess.browser} · IP: {sess.ip}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  disabled={revokeSessionMutation.isPending}
                  onClick={() => handleRevokeOne(sess.id)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-gray-200 transition cursor-pointer disabled:opacity-50"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
