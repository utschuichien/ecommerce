'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Tag,
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  PauseCircle,
} from 'lucide-react';
import {
  useAdminVouchers,
  useCreateVoucher,
  useToggleVoucherStatus,
  useDeleteVoucher,
} from '@/features/admin';
import { AdminDropdown, AdminDropdownOption } from './AdminDropdown';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { formatVND } from '@/lib/api-client';

export function AdminVouchersTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetVoucher, setDeleteTargetVoucher] = useState<{ id: string; code: string } | null>(null);
  const [toggleTargetVoucher, setToggleTargetVoucher] = useState<{
    id: string;
    code: string;
    nextActive: boolean;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'FIXED_AMOUNT' as 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING',
    discountValue: 20000,
    maxDiscountAmount: 50000,
    minOrderValue: 100000,
    usageLimit: 500,
    usagePerUser: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: vouchersData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminVouchers({
    page,
    limit: 10,
    search: searchTerm || undefined,
    scope: scopeFilter !== 'ALL' ? scopeFilter : undefined,
  });

  const createMutation = useCreateVoucher();
  const toggleMutation = useToggleVoucherStatus();
  const deleteMutation = useDeleteVoucher();

  const vouchers = vouchersData?.items || [];
  const pagination = vouchersData?.pagination || { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    createMutation.mutate(
      {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        type: formData.type,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount:
          formData.type === 'PERCENTAGE' ? Number(formData.maxDiscountAmount) : undefined,
        minOrderValue: Number(formData.minOrderValue || 0),
        usageLimit: Number(formData.usageLimit || 1000),
        usagePerUser: Number(formData.usagePerUser || 1),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({
            code: '',
            name: '',
            description: '',
            type: 'FIXED_AMOUNT',
            discountValue: 20000,
            maxDiscountAmount: 50000,
            minOrderValue: 100000,
            usageLimit: 500,
            usagePerUser: 1,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo mã voucher hoặc tên khuyến mãi..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Nút lọc & Tạo voucher */}
        <div className="flex items-center gap-2">
          <AdminDropdown
            value={scopeFilter}
            onChange={(val) => setScopeFilter(val)}
            options={[
              { value: 'ALL', label: 'Tất cả voucher' },
              { value: 'GLOBAL', label: 'Voucher toàn sàn' },
              { value: 'SHOP', label: 'Voucher gian hàng' },
            ]}
            menuWidth="w-44"
          />

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200/60 text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo mã giảm giá sàn</span>
          </button>
        </div>
      </div>

      {/* 2. Danh sách Voucher */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs">Đang tải danh sách mã giảm giá...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Ticket className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Chưa có mã giảm giá nào</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Nhấn &quot;Tạo mã giảm giá sàn&quot; để thiết lập mã ưu đãi kích cầu tiêu dùng cho toàn bộ người dùng trên hệ thống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Voucher</th>
                  <th className="py-3 px-4">Tên chương trình</th>
                  <th className="py-3 px-4">Phạm vi</th>
                  <th className="py-3 px-4">Mức giảm</th>
                  <th className="py-3 px-4">Đơn tối thiểu</th>
                  <th className="py-3 px-4">Đã dùng / Giới hạn</th>
                  <th className="py-3 px-4">Thời hạn</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {v.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-xs truncate" title={v.name}>
                      {v.name}
                      {v.description && (
                        <span className="block text-[10px] text-gray-400 font-normal truncate">
                          {v.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {v.scope === 'GLOBAL' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Toàn sàn
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {v.shopName || 'Shop'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {v.type === 'PERCENTAGE'
                        ? `${v.discountValue}% (tối đa ${formatVND(v.maxDiscountAmount || 0)})`
                        : v.type === 'FREE_SHIPPING'
                        ? 'Miễn phí ship'
                        : formatVND(v.discountValue)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {v.minOrderValue > 0 ? formatVND(v.minOrderValue) : '0đ'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-gray-700">
                          {v.usedCount} / {v.usageLimit}
                        </span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (v.usedCount / Math.max(1, v.usageLimit)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[10px]">
                      {new Date(v.startDate).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(v.endDate).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (v.isActive) {
                            setToggleTargetVoucher({ id: v.id, code: v.code, nextActive: false });
                          } else {
                            toggleMutation.mutate({ voucherId: v.id, isActive: true });
                          }
                        }}
                        disabled={toggleMutation.isPending}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {v.isActive ? 'Đang bật' : 'Tạm dừng'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetVoucher({ id: v.id, code: v.code })}
                        disabled={deleteMutation.isPending || v.usedCount > 0}
                        title={v.usedCount > 0 ? 'Không thể xóa voucher đã có người dùng' : 'Xóa voucher'}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang căn giữa */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              limit={pagination.limit}
              onPageChange={(p) => setPage(p)}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </div>

      {/* 3. Modal Tạo Voucher Sàn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-gray-950">Tạo Mã Giảm Giá Sàn Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Mã voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TECHFEST50K"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:bg-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition uppercase font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Loại giảm giá *</label>
                  <AdminDropdown
                    value={formData.type}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        type: val as 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING',
                      })
                    }
                    options={[
                      { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' },
                      { value: 'PERCENTAGE', label: 'Phần trăm chiết khấu (%)' },
                      { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển (Freeship)' },
                    ]}
                    className="w-full"
                    menuWidth="w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Tên chương trình voucher *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giảm ngay 50.000đ cho đơn hàng công nghệ từ 200k"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:bg-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">
                    {formData.type === 'PERCENTAGE' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Tổng số lượt dùng toàn sàn</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Lượt dùng trên mỗi khách</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.usagePerUser}
                    onChange={(e) => setFormData({ ...formData, usagePerUser: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50/60 border border-gray-200/50 hover:border-gray-300 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2 -mx-4 -mb-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tạo mã ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal xác nhận Tạm dừng Voucher - Dùng ConfirmDeleteModal */}
      <ConfirmDeleteModal
        isOpen={!!toggleTargetVoucher}
        title="Tạm dừng mã voucher?"
        itemName={toggleTargetVoucher?.code}
        description="Mã voucher này sẽ tạm thời không thể áp dụng khi khách hàng đặt đơn hàng mới cho đến khi bạn kích hoạt trở lại."
        itemInfo={
          toggleTargetVoucher
            ? `Mã: ${toggleTargetVoucher.code} (ID: ${toggleTargetVoucher.id})`
            : undefined
        }
        confirmText="Tạm dừng voucher"
        cancelText="Hủy bỏ"
        variant="warning"
        icon={<PauseCircle className="w-6 h-6 stroke-[2.2]" />}
        confirmIcon={<PauseCircle className="w-3.5 h-3.5" />}
        isLoading={toggleMutation.isPending}
        onClose={() => setToggleTargetVoucher(null)}
        onConfirm={() => {
          if (!toggleTargetVoucher) return;
          toggleMutation.mutate(
            { voucherId: toggleTargetVoucher.id, isActive: false },
            { onSettled: () => setToggleTargetVoucher(null) },
          );
        }}
      />

      {/* 5. Modal xác nhận Xóa vĩnh viễn Voucher - Dùng ConfirmDeleteModal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTargetVoucher}
        title="Xóa vĩnh viễn voucher?"
        itemName={deleteTargetVoucher?.code}
        description="Bạn có chắc chắn muốn xóa mã giảm giá này khỏi hệ thống? Thao tác này không thể hoàn tác."
        itemInfo={
          deleteTargetVoucher
            ? `Mã voucher: ${deleteTargetVoucher.code} (ID: ${deleteTargetVoucher.id})`
            : undefined
        }
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteTargetVoucher(null)}
        onConfirm={() => {
          if (!deleteTargetVoucher) return;
          deleteMutation.mutate(deleteTargetVoucher.id, {
            onSettled: () => setDeleteTargetVoucher(null),
          });
        }}
      />
    </div>
  );
}
