'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Check, AlertCircle, Camera, Loader2, UploadCloud, ShieldCheck } from 'lucide-react';
import { UserProfile } from './profile-types';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { updateProfileSchema } from '@/features/auth/schemas/auth.schema';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/api-client';

interface ProfilePersonalInfoTabProps {
  user: UserProfile;
  onSave?: (updated: Partial<UserProfile>) => void;
}

export function ProfilePersonalInfoTab({ user, onSave }: ProfilePersonalInfoTabProps) {
  const { updateProfile, isUpdatingProfile, uploadAvatar, isUploadingAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Định dạng không hợp lệ', {
        description: 'Chỉ chấp nhận file ảnh JPG, PNG hoặc WEBP.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn', {
        description: 'Kích thước ảnh đại diện không được vượt quá 5MB.',
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const updatedUser = await uploadAvatar(file);
      onSave?.({ avatar: updatedUser.avatarUrl || previewUrl });
      toast.success('Cập nhật thành công', {
        description: 'Ảnh đại diện của bạn đã được thay đổi.',
      });
    } catch (err: any) {
      setAvatarPreview(null);
      toast.error('Tải ảnh thất bại', {
        description: extractErrorMessage(err) || 'Không thể tải ảnh đại diện lên máy chủ.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user.name, user.email, user.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setFieldErrors({});

    // 1. Validate bằng Zod
    const validation = updateProfileSchema.safeParse({
      fullName: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
    });

    if (!validation.success) {
      const errors: { fullName?: string; phone?: string } = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as 'fullName' | 'phone';
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // 2. Gửi request cập nhật lên API
    try {
      await updateProfile({
        fullName: validation.data.fullName,
        phone: validation.data.phone,
      });

      onSave?.({
        name: validation.data.fullName,
        phone: validation.data.phone || '',
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      const msg = extractErrorMessage(
        err,
        'Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.',
      );
      setServerError(msg);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-950">
          Thông tin cá nhân
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Quản lý thông tin hồ sơ để bảo mật và tối ưu trải nghiệm mua sắm
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Thông tin cá nhân đã được lưu thành công vào hệ thống!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
        {/* Avatar hiển thị & Tải lên */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-gray-50/90 via-emerald-50/30 to-white border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-2xs">
          {/* Avatar Container with Floating Camera Button */}
          <div className="relative group shrink-0">
            <UserAvatar
              src={avatarPreview || user.avatar}
              name={formData.name}
              size="2xl"
              className="ring-4 ring-emerald-500/20 shadow-md"
            />

            {/* Loading Spinner Overlay */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              </div>
            )}

            {/* Hover overlay on desktop */}
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer disabled:pointer-events-none"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Thay đổi</span>
            </button>

            {/* Floating Camera Button (always visible, easy touch on mobile) */}
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
              title="Tải ảnh mới"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info & Action Buttons */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-gray-950">
                {formData.name || 'Người dùng CommerceOS'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/50">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Tài khoản xác thực
              </span>
            </div>

            <p className="text-xs text-gray-500 max-w-md leading-relaxed">
              Khuyến nghị sử dụng ảnh vuông (1:1), định dạng JPG, PNG hoặc WEBP với kích thước không quá 5MB.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Tải ảnh mới</span>
                  </>
                )}
              </button>

              {(avatarPreview || user.avatar) && (
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => {
                    setAvatarPreview(null);
                    onSave?.({ avatar: '' });
                    toast.info('Đã gỡ ảnh đại diện xem trước.');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />
          </div>
        </div>

        {/* Các trường thông tin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Họ và tên */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-xs sm:text-sm text-gray-900 focus:outline-none transition ${
                fieldErrors.fullName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
              }`}
              placeholder="Nhập họ và tên"
            />
            {fieldErrors.fullName && (
              <p className="text-[11px] text-rose-500 font-medium pl-1">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-xs sm:text-sm text-gray-900 focus:outline-none transition ${
                fieldErrors.phone
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-gray-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
              }`}
              placeholder="0912345678"
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-rose-500 font-medium pl-1">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Email (Read-only / Tài khoản đăng nhập) */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-gray-700">
                Email
              </label>
              <span className="text-[11px] text-gray-400">
                Email dùng để đăng nhập, không thể thay đổi
              </span>
            </div>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs sm:text-sm text-gray-500 cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Nút lưu thay đổi */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-xs sm:text-sm rounded-md transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            {isUpdatingProfile ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
