'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  RotateCcw,
  Copy,
  Check,
  Trash2,
  Percent,
  Coins,
  Truck,
  Layers,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '@/components/common';
import {
  useSellerVouchers,
  useToggleSellerVoucherStatus,
  useDeleteSellerVoucher,
  SellerVoucherRecord,
} from '@/features/seller';
import { VoucherCreateModal } from './modals';

export function SellerVouchersTab() {
  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Queries & Mutations
  const { data: vouchersData, isLoading, refetch } = useSellerVouchers({
    search: searchQuery.trim() || undefined,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    page,
    limit: 6,
  });

  const toggleStatusMutation = useToggleSellerVoucherStatus();
  const deleteMutation = useDeleteSellerVoucher();

  const vouchers = vouchersData?.items || [];
  const stats = vouchersData?.stats || {
    total: 0,
    active: 0,
    upcoming: 0,
    expired: 0,
    disabled: 0,
    totalUsages: 0,
  };
  const totalPages = vouchersData?.pagination?.totalPages || 1;
  const totalItems = vouchersData?.pagination?.totalItems || 0;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Đã sao chép mã voucher', {
      description: `Mã: ${code}`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (voucher: SellerVoucherRecord) => {
    const nextActive = !voucher.isActive;
    try {
      await toggleStatusMutation.mutateAsync({
        id: voucher.id,
        isActive: nextActive,
      });
      toast.success(nextActive ? 'Đã kích hoạt voucher' : 'Đã tạm dừng voucher', {
        description: `Mã ${voucher.code} hiện tại ${nextActive ? 'đang hoạt động' : 'đang tạm dừng'}.`,
      });
    } catch (err: any) {
      toast.error('Cập nhật thất bại', {
        description: err?.response?.data?.message || 'Không thể đổi trạng thái voucher.',
      });
    }
  };

  const handleDelete = async (voucher: SellerVoucherRecord) => {
    const confirmMsg =
      voucher.usedCount > 0
        ? `Voucher "${voucher.code}" đã có ${voucher.usedCount} khách sử dụng. Hệ thống sẽ tạm dừng thay vì xóa vĩnh viễn. Tiếp tục?`
        : `Bạn có chắc chắn muốn xóa vĩnh viễn mã voucher "${voucher.code}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await deleteMutation.mutateAsync(voucher.id);
      toast.success('Thành công', {
        description: res.message || 'Đã xử lý voucher.',
      });
    } catch (err: any) {
      toast.error('Xóa thất bại', {
        description: err?.response?.data?.message || 'Không thể xóa voucher.',
      });
    }
  };

  const statusBadge = (voucher: SellerVoucherRecord) => {
    switch (voucher.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang chạy
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            Sắp diễn ra
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Hết hạn
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Tạm dừng
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* 1. Header & Nút tạo voucher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-emerald-600" />
            Mã giảm giá & Khuyến mãi của Shop
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Tạo voucher riêng cho Shop để tặng khách hàng thân thiết và kích thích doanh số
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo mã Voucher mới
        </button>
      </div>

      {/* 2. 4 Thẻ KPI thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">Tổng mã voucher</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Ticket className="w-3 h-3 text-emerald-600" />
            Đã phát hành
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">Đang hoạt động</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</div>
          <div className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Khách có thể dùng ngay
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">Sắp diễn ra</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming}</div>
          <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Chiến dịch sắp tới
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-medium text-gray-500">Lượt khách đã dùng</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.totalUsages}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-500" />
            Tổng đơn hàng áp mã
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và Tabs lọc */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Tabs trạng thái */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { key: 'ALL', label: 'Tất cả', count: stats.total },
                { key: 'ACTIVE', label: 'Đang chạy', count: stats.active },
                { key: 'UPCOMING', label: 'Sắp tới', count: stats.upcoming },
                { key: 'EXPIRED', label: 'Hết hạn', count: stats.expired },
                { key: 'DISABLED', label: 'Tạm dừng', count: stats.disabled },
              ] as const
            ).map((tab) => {
              const isActive = selectedStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(tab.key);
                    setPage(1);
                  }}
                  className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã hoặc tên voucher..."
              className="w-full pl-8 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-0.5 focus:ring-emerald-500 focus:border-emerald-300 bg-gray-50/50"
            />
          </div>
        </div>

        {/* 4. Danh sách các thẻ Voucher */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gray-100 animate-pulse border border-gray-200"
              />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Chưa có mã voucher nào</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {searchQuery || selectedStatus !== 'ALL'
                  ? 'Không tìm thấy voucher phù hợp với bộ lọc hiện tại.'
                  : 'Hãy tạo mã giảm giá đầu tiên để tăng chuyển đổi đơn hàng cho Shop!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {vouchers.map((voucher) => {
              const usagePercent =
                voucher.usageLimit > 0
                  ? Math.min(100, Math.round((voucher.usedCount / voucher.usageLimit) * 100))
                  : 0;

              const startDateStr = new Date(voucher.startDate).toLocaleDateString('vi-VN');
              const endDateStr = new Date(voucher.endDate).toLocaleDateString('vi-VN');

              return (
                <div
                  key={voucher.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Top card header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            voucher.type === 'PERCENTAGE'
                              ? 'bg-blue-50 text-blue-600'
                              : voucher.type === 'FREE_SHIPPING'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {voucher.type === 'PERCENTAGE' ? (
                            <Percent className="w-4 h-4" />
                          ) : voucher.type === 'FREE_SHIPPING' ? (
                            <Truck className="w-4 h-4" />
                          ) : (
                            <Coins className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1" title={voucher.name}>
                            {voucher.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs font-bold text-emerald-700 tracking-wider">
                              {voucher.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(voucher.code)}
                              className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              title="Sao chép mã"
                            >
                              {copiedCode === voucher.code ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {statusBadge(voucher)}
                    </div>

                    {/* Mức giảm giá lớn */}
                    <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 space-y-1">
                      <div className="text-base font-extrabold text-emerald-600">
                        {voucher.type === 'PERCENTAGE'
                          ? `Giảm ${voucher.discountValue}%`
                          : voucher.type === 'FREE_SHIPPING'
                          ? 'Miễn phí vận chuyển'
                          : `Giảm ${Number(voucher.discountValue).toLocaleString('vi-VN')} đ`}
                        {voucher.maxDiscountAmount && (
                          <span className="text-[11px] font-normal text-gray-500 ml-1">
                            (Tối đa {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-600">
                        Đơn tối thiểu: <strong>{Number(voucher.minOrderValue).toLocaleString('vi-VN')} đ</strong>
                      </div>
                    </div>

                    {/* Tiến độ sử dụng */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-gray-500">
                        <span>Đã dùng</span>
                        <span className="font-semibold text-gray-800">
                          {voucher.usedCount} / {voucher.usageLimit} ({usagePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Ngày áp dụng */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>
                        {startDateStr} - {endDateStr}
                      </span>
                    </div>
                  </div>

                  {/* Bottom card footer actions */}
                  <div className="px-4 py-2.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={voucher.isActive}
                        onChange={() => handleToggleStatus(voucher)}
                        disabled={toggleStatusMutation.isPending}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium text-gray-700">
                        {voucher.isActive ? 'Đang bật' : 'Tạm dừng'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDelete(voucher)}
                      disabled={deleteMutation.isPending}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title={voucher.usedCount > 0 ? 'Vô hiệu hóa voucher' : 'Xóa voucher'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pt-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={6}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Modal tạo voucher mới */}
      <VoucherCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          refetch();
        }}
      />
    </div>
  );
}

