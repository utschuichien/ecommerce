'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Check, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddresses,
  useSetDefaultAddress,
  useDeleteAddress,
} from '@/features/auth/hooks/useAuth';
import { extractErrorMessage } from '@/lib/api-client';
import { AddAddressModal } from './AddAddressModal';

interface ProfileAddressesTabProps {
  addresses?: any[];
}

export function ProfileAddressesTab({}: ProfileAddressesTabProps = {}) {
  const { data: addresses = [], isLoading, isError } = useAddresses();
  const setDefaultMutation = useSetDefaultAddress();
  const deleteMutation = useDeleteAddress();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      await setDefaultMutation.mutateAsync(id);
      toast.success('Đã đổi địa chỉ mặc định', {
        description: 'Địa chỉ này sẽ được ưu tiên khi giao hàng.',
      });
    } catch (err: any) {
      toast.error('Thiết lập thất bại', {
        description: extractErrorMessage(err) || 'Không thể đặt làm địa chỉ mặc định.',
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa địa chỉ', {
        description: 'Địa chỉ nhận hàng đã được xóa thành công.',
      });
    } catch (err: any) {
      toast.error('Xóa thất bại', {
        description: extractErrorMessage(err) || 'Không thể xóa địa chỉ này.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-950 flex items-center gap-2">
            <span>Địa chỉ nhận hàng</span>
            {!isLoading && (
              <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                {addresses.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý danh sách địa chỉ nhận hàng để thanh toán thuận tiện và nhanh chóng hơn
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-100 rounded"></div>
              </div>
              <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Không thể tải danh sách địa chỉ. Vui lòng tải lại trang.</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-950">Chưa có địa chỉ nhận hàng</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Bạn chưa lưu địa chỉ nào. Hãy thêm địa chỉ để tiết kiệm thời gian khi đặt mua sản phẩm.
            </p>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const fullAddress =
              addr.address ||
              [addr.line1, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');

            return (
              <div
                key={addr.id}
                className={`border rounded-2xl p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  addr.isDefault
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-gray-950">
                      {addr.recipientName}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 font-mono">{addr.phone}</span>

                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                        <Check className="w-3 h-3" />
                        <span>Mặc định</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                    {fullAddress}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center text-xs">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      disabled={settingDefaultId === addr.id}
                      onClick={() => handleSetDefault(addr.id)}
                      className="px-3 py-1.5 border border-gray-200 hover:border-emerald-500 rounded-xl font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {settingDefaultId === addr.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Thiết lập mặc định</span>
                    </button>
                  )}

                  {!addr.isDefault && (
                    <button
                      type="button"
                      disabled={deletingId === addr.id}
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                      title="Xóa địa chỉ"
                    >
                      {deletingId === addr.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm địa chỉ mới được tách thành component riêng */}
      <AddAddressModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
