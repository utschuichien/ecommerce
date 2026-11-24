'use client';

import React, { useState } from 'react';
import { MapPin, AlertCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAddress } from '@/features/auth/hooks/useAuth';
import { createAddressSchema } from '@/features/auth/schemas/auth.schema';
import { extractErrorMessage } from '@/lib/api-client';
import { useVietnamLocations } from '@/hooks/useVietnamLocations';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
  const createAddressMutation = useCreateAddress();

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    line1: '',
    isDefault: false,
  });

  const { provinces, districts, wards } = useVietnamLocations(
    formData.province,
    formData.district,
  );

  const [fieldErrors, setFieldErrors] = useState<{
    recipientName?: string;
    phone?: string;
    province?: string;
    district?: string;
    ward?: string;
    line1?: string;
  }>({});

  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      recipientName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      line1: '',
      isDefault: false,
    });
    setFieldErrors({});
    setModalError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setFieldErrors({});

    // 1. Zod Validation
    const validation = createAddressSchema.safeParse({
      recipientName: formData.recipientName.trim(),
      phone: formData.phone.trim(),
      province: formData.province.trim(),
      district: formData.district.trim(),
      ward: formData.ward.trim(),
      line1: formData.line1.trim(),
      isDefault: formData.isDefault,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // 2. Submit to backend API
    try {
      await createAddressMutation.mutateAsync(validation.data);
      toast.success('Thêm địa chỉ thành công', {
        description: 'Địa chỉ nhận hàng mới đã được lưu vào sổ địa chỉ.',
      });
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      setModalError(extractErrorMessage(err) || 'Không thể thêm địa chỉ. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-950">Thêm địa chỉ nhận hàng mới</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto">
          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Họ tên người nhận */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.recipientName}
                onChange={(e) => {
                  setFormData({ ...formData, recipientName: e.target.value });
                  if (fieldErrors.recipientName) setFieldErrors({ ...fieldErrors, recipientName: undefined });
                }}
                className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition ${
                  fieldErrors.recipientName
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
              />
              {fieldErrors.recipientName && (
                <p className="text-[11px] text-red-500">{fieldErrors.recipientName}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0912345678"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
                }}
                className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition ${
                  fieldErrors.phone
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-500">{fieldErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Tỉnh / Thành phố */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Tỉnh / Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.province}
              onChange={(e) => {
                const newProvince = e.target.value;
                setFormData({
                  ...formData,
                  province: newProvince,
                  district: '',
                  ward: '',
                });
                if (fieldErrors.province) setFieldErrors({ ...fieldErrors, province: undefined });
              }}
              className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition bg-white cursor-pointer ${
                fieldErrors.province
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                  : 'border-gray-200 focus:border-emerald-500'
              }`}
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {fieldErrors.province && (
              <p className="text-[11px] text-red-500">{fieldErrors.province}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Quận / Huyện */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!formData.province}
                value={formData.district}
                onChange={(e) => {
                  const newDistrict = e.target.value;
                  setFormData({
                    ...formData,
                    district: newDistrict,
                    ward: '',
                  });
                  if (fieldErrors.district) setFieldErrors({ ...fieldErrors, district: undefined });
                }}
                className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  fieldErrors.district
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
              >
                <option value="">
                  {formData.province ? '-- Chọn Quận / Huyện --' : '-- Chọn Tỉnh trước --'}
                </option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {fieldErrors.district && (
                <p className="text-[11px] text-red-500">{fieldErrors.district}</p>
              )}
            </div>

            {/* Phường / Xã */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Phường / Xã <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!formData.district}
                value={formData.ward}
                onChange={(e) => {
                  setFormData({ ...formData, ward: e.target.value });
                  if (fieldErrors.ward) setFieldErrors({ ...fieldErrors, ward: undefined });
                }}
                className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  fieldErrors.ward
                    ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
              >
                <option value="">
                  {formData.district ? '-- Chọn Phường / Xã --' : '-- Chọn Quận / Huyện trước --'}
                </option>
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {fieldErrors.ward && (
                <p className="text-[11px] text-red-500">{fieldErrors.ward}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Địa chỉ chi tiết (Số nhà, tên tòa nhà, tên đường...) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Số 25 ngõ 123 đường Xuân Thủy"
              value={formData.line1}
              onChange={(e) => {
                setFormData({ ...formData, line1: e.target.value });
                if (fieldErrors.line1) setFieldErrors({ ...fieldErrors, line1: undefined });
              }}
              className={`w-full px-3 py-2 text-xs border rounded-md outline-hidden transition ${
                fieldErrors.line1
                  ? 'border-red-400 bg-red-50/20 focus:border-red-500'
                  : 'border-gray-200 focus:border-emerald-500'
              }`}
            />
            {fieldErrors.line1 && (
              <p className="text-[11px] text-red-500">{fieldErrors.line1}</p>
            )}
          </div>

          {/* Đặt làm mặc định */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-700 font-medium">
                Đặt làm địa chỉ nhận hàng mặc định
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={createAddressMutation.isPending}
              className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold rounded-md transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createAddressMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-md transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAddressMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>{createAddressMutation.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
