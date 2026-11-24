'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAdminShops, useUpdateShopStatus, AdminShopItem } from '@/features/admin';
import { Pagination } from '@/components/common/Pagination';
import { formatVND } from '@/lib/api-client';
import Link from 'next/link';
import { DEFAULT_SELLER_AVATAR } from '@/constants/default-images';

interface AdminShopsTabProps {
  initialSearch?: string;
}

export function AdminShopsTab({ initialSearch = '' }: AdminShopsTabProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Modal xác nhận khóa / mở khóa
  const [selectedShop, setSelectedShop] = useState<AdminShopItem | null>(null);
  const [actionType, setActionType] = useState<'ACTIVE' | 'SUSPENDED' | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminShops({
    page,
    limit: 10,
    status: statusFilter,
    search: searchTerm || undefined,
  });

  // Tự động tìm kiếm tức thì sau 300ms debounce khi người dùng gõ phím
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Đồng bộ nếu initialSearch thay đổi từ ngoài Header
  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchInput) {
      setSearchInput(initialSearch);
      setSearchTerm(initialSearch.trim());
      setPage(1);
    }
  }, [initialSearch]);

  const updateStatusMutation = useUpdateShopStatus();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleResetFilter = () => {
    setStatusFilter('ALL');
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleOpenActionModal = (shop: AdminShopItem, type: 'ACTIVE' | 'SUSPENDED') => {
    setSelectedShop(shop);
    setActionType(type);
    setReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedShop || !actionType) return;
    await updateStatusMutation.mutateAsync({
      shopId: selectedShop.id,
      status: actionType,
      reason: reason.trim() || undefined,
    });
    setSelectedShop(null);
    setActionType(null);
  };

  const filterPills = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Hoạt động' },
    { key: 'SUSPENDED', label: 'Tạm khóa' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'CLOSED', label: 'Đã đóng' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Thanh công cụ & Bộ lọc */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm có debounce thời gian thực */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên shop, slug hoặc chủ shop..."
              className="w-full pl-9 pr-14 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isFetching && (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              )}
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Nút làm mới */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Danh sách Pills lọc trạng thái */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-50 text-xs">
          <span className="text-gray-400 font-medium mr-1 text-[11px]">Trạng thái:</span>
          {filterPills.map((pill) => {
            const isActive = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => {
                  setStatusFilter(pill.key);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bảng danh sách Gian hàng */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          /* Trạng thái Empty */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden mx-auto shadow-xs border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
              <img
                src={DEFAULT_SELLER_AVATAR}
                alt="Gian hàng sàn"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Không tìm thấy gian hàng nào</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Không có gian hàng nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc trạng thái hiện tại.
            </p>
            {(statusFilter !== 'ALL' || searchTerm) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4">Chủ sở hữu</th>
                  <th className="py-3 px-4 text-center">Sản phẩm</th>
                  <th className="py-3 px-4 text-center">Đơn hàng</th>
                  <th className="py-3 px-4 text-right">Doanh thu</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((shop) => {
                  const isSuspended = shop.status === 'SUSPENDED';
                  const isActive = shop.status === 'ACTIVE';

                  return (
                    <tr key={shop.id} className="hover:bg-gray-50/50 transition">
                      {/* Shop Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-100 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                            <img
                              src={(shop as any).logoUrl || DEFAULT_SELLER_AVATAR}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_SELLER_AVATAR;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900 truncate">{shop.name}</span>
                              <Link
                                href={`/shops/${shop.slug}`}
                                target="_blank"
                                className="text-gray-400 hover:text-emerald-600 cursor-pointer"
                                title="Xem trang shop"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <span className="text-[11px] text-gray-400 block truncate">/{shop.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-900 block">{shop.owner.name}</span>
                        <span className="text-[11px] text-gray-400 block">{shop.owner.email || shop.owner.phone}</span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {shop.productsCount}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {shop.ordersCount}
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                        {formatVND(shop.totalRevenue)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : isSuspended
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Hoạt động
                            </>
                          ) : isSuspended ? (
                            <>
                              <ShieldAlert className="w-3 h-3" /> Tạm khóa
                            </>
                          ) : (
                            shop.status
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuspended ? (
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(shop, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Mở khóa</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(shop, 'SUSPENDED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Tạm khóa</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Phân trang căn giữa */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center">
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.totalItems}
              limit={data.pagination.limit}
              onPageChange={(p) => setPage(p)}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </div>

      {/* 4. Modal xác nhận Khóa / Mở khóa Gian hàng */}
      {selectedShop && actionType && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    actionType === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {actionType === 'ACTIVE' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {actionType === 'ACTIVE' ? 'Kích hoạt gian hàng' : 'Tạm khóa gian hàng'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {actionType === 'ACTIVE'
                ? `Bạn có chắc chắn muốn kích hoạt lại gian hàng "${selectedShop.name}"? Gian hàng và các sản phẩm sẽ hiển thị lại trên sàn.`
                : `Gian hàng "${selectedShop.name}" sẽ bị tạm ẩn khỏi sàn và người bán sẽ không thể nhận đơn hàng mới.`}
            </p>

            {actionType === 'SUSPENDED' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-700">Lý do khóa gian hàng:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Vi phạm chính sách chất lượng, khiếu nại chưa xử lý..."
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/60 hover:border-gray-300/80 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition placeholder-gray-400"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={updateStatusMutation.isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'ACTIVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {updateStatusMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
