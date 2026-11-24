'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  ShoppingCart,
  Calendar,
  ChevronDown,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ArrowRight,
  MoreHorizontal,
  Printer,
  Ban,
  Check,
} from 'lucide-react';
import { Pagination } from '@/components/common';
import { toast } from 'sonner';
import {
  useSellerOrders,
  useSellerOrderStats,
  useUpdateSellerOrderStatus,
} from '@/features/seller';
import {
  OrderDetailModal,
  CancelOrderModal,
  SellerOrderRecord,
} from './modals';
import { SellerDropdown, SellerFilterPopover } from './common/SellerDropdown';

export function SellerOrdersTab() {
  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<SellerOrderRecord | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<SellerOrderRecord | null>(null);

  // Bộ lọc nâng cao: Thời gian, Mức giá, Sắp xếp
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [amountRange, setAmountRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('NEWEST');

  // Custom Hooks (React Query)
  const { data: statsData } = useSellerOrderStats();
  const { data: ordersData, isLoading } = useSellerOrders({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    search: searchQuery || undefined,
    timeRange: timeRange === 'all' ? undefined : timeRange,
    amountRange: amountRange === 'all' ? undefined : amountRange,
    sortBy,
    page,
    limit: 6,
  });
  const updateStatusMutation = useUpdateSellerOrderStatus();

  // Dữ liệu đơn hàng thực tế từ DB
  const orders: SellerOrderRecord[] = ordersData?.items || [];

  const totalItems = ordersData?.pagination?.totalItems ?? 0;
  const totalPages = ordersData?.pagination?.totalPages ?? 1;

  const stats = statsData || {
    total: 0,
    pending: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  };

  const counts = ordersData?.counts || {
    ALL: stats.total,
    PENDING: stats.pending,
    SHIPPING: stats.shipping,
    DELIVERED: stats.delivered,
    CANCELLED: stats.cancelled,
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        selectedStatus === 'ALL' || order.status === selectedStatus;
      const matchSearch =
        !searchQuery.trim() ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Checkbox chọn tất cả
  const isAllSelected =
    filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Cập nhật trạng thái đơn hàng qua custom hook mutation
  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: SellerOrderRecord['status']
  ) => {
    const statusLabels: Record<
      SellerOrderRecord['status'],
      { label: string; color: SellerOrderRecord['statusColor'] }
    > = {
      PENDING: { label: 'Đang xử lý', color: 'amber' },
      SHIPPING: { label: 'Đang giao', color: 'blue' },
      DELIVERED: { label: 'Hoàn thành', color: 'green' },
      CANCELLED: { label: 'Đã hủy', color: 'gray' },
    };

    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: nextStatus,
      });
      toast.success('Cập nhật trạng thái', {
        description: `Đơn hàng chuyển sang: ${statusLabels[nextStatus].label}.`,
      });
      if (viewingOrder?.id === orderId) {
        setViewingOrder((prev) =>
          prev
            ? {
                ...prev,
                status: nextStatus,
                statusLabel: statusLabels[nextStatus].label,
                statusColor: statusLabels[nextStatus].color,
              }
            : null
        );
      }
    } catch (err: any) {
      toast.error('Cập nhật thất bại', {
        description: err?.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.',
      });
    }
    setActiveMenuId(null);
  };

  // Xác nhận hủy đơn hàng qua modal (tự động hoàn trả kho)
  const handleConfirmCancel = async (orderId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: 'CANCELLED',
      });
      toast.success('Hủy đơn hàng thành công', {
        description: `Đơn hàng đã được hủy. Số lượng giữ đã được tự động hoàn lại kho.`,
      });
      if (viewingOrder?.id === orderId) {
        setViewingOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'CANCELLED',
                statusLabel: 'Đã hủy',
                statusColor: 'gray',
              }
            : null
        );
      }
      setCancellingOrder(null);
    } catch (err: any) {
      toast.error('Hủy đơn thất bại', {
        description: err?.response?.data?.message || 'Không thể hủy đơn hàng.',
      });
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* 2. TIÊU ĐỀ TRANG + DATE PICKER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
            <h1 className="text-xl font-bold text-gray-950 tracking-tight">
              Quản lý đơn hàng
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi và quản lý tất cả đơn hàng của cửa hàng
          </p>
        </div>

        {/* Nút chọn thời gian đồng bộ */}
        <div className="flex items-center gap-2">
          <SellerDropdown
            value={timeRange}
            onChange={(val) => {
              setTimeRange(val);
              setPage(1);
            }}
            icon={<Calendar className="w-3.5 h-3.5" />}
            align="right"
            menuWidth="w-40"
            options={[
              { value: 'today', label: 'Hôm nay' },
              { value: '7d', label: '7 ngày qua' },
              { value: '30d', label: '30 ngày qua' },
              { value: 'month', label: 'Tháng này' },
              { value: 'all', label: 'Tất cả thời gian' },
            ]}
          />
        </div>
      </div>

      {/* 3. BỐN THẺ CHỈ SỐ THỐNG KÊ (ĐỒNG BỘ HIỂN THỊ SỐ CHUẨN XÁC) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ô 1: Tổng đơn hàng */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Tổng đơn hàng
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.total ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 2: Đang xử lý */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Đang xử lý
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.pending ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 3: Đang giao */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Đang giao
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.shipping ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 4: Hoàn thành */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Hoàn thành
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.delivered ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 4. THANH BỘ LỌC TRẠNG THÁI (PILLS) VÀ Ô TÌM KIẾM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Pills lọc trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'ALL', label: 'Tất cả', count: counts.ALL },
              { key: 'PENDING', label: 'Đang xử lý', count: counts.PENDING },
              { key: 'SHIPPING', label: 'Đang giao', count: counts.SHIPPING },
              { key: 'DELIVERED', label: 'Hoàn thành', count: counts.DELIVERED },
              { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED },
            ] as const
          ).map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 shadow-2xs'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] ${
                    isActive ? 'text-emerald-100 font-semibold' : 'text-gray-400'
                  }`}
                >
                  ({tab.count || 0})
                </span>
              </button>
            );
          })}
        </div>

        {/* Ô Tìm kiếm và Nút Bộ lọc */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200/90 rounded-lg text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 shadow-2xs transition"
            />
          </div>

          {/* Nút Bộ lọc nâng cao đồng bộ */}
          <SellerFilterPopover
            activeCount={(amountRange !== 'all' ? 1 : 0) + (sortBy !== 'NEWEST' ? 1 : 0)}
            onReset={() => {
              setAmountRange('all');
              setSortBy('NEWEST');
              setPage(1);
            }}
            sections={[
              {
                id: 'sortBy',
                title: 'Sắp xếp theo',
                currentValue: sortBy,
                onChange: (val) => {
                  setSortBy(val);
                  setPage(1);
                },
                options: [
                  { value: 'NEWEST', label: 'Mới nhất' },
                  { value: 'OLDEST', label: 'Cũ nhất' },
                  { value: 'TOTAL_DESC', label: 'Giá trị cao nhất' },
                  { value: 'TOTAL_ASC', label: 'Giá trị thấp nhất' },
                ],
              },
              {
                id: 'amountRange',
                title: 'Khoảng giá trị đơn hàng',
                currentValue: amountRange,
                onChange: (val) => {
                  setAmountRange(val);
                  setPage(1);
                },
                options: [
                  { value: 'all', label: 'Tất cả mức giá' },
                  { value: 'under_500k', label: 'Dưới 500k' },
                  { value: '500k_2m', label: '500k - 2 triệu' },
                  { value: 'over_2m', label: 'Trên 2 triệu' },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* 5. BẢNG DANH SÁCH ĐƠN HÀNG */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-600 font-semibold select-none">
                <th className="py-3.5 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th className="py-3.5 px-3 min-w-[150px]">Mã đơn hàng</th>
                <th className="py-3.5 px-3 min-w-[190px]">Khách hàng</th>
                <th className="py-3.5 px-3 min-w-[120px]">Sản phẩm</th>
                <th className="py-3.5 px-3 min-w-[130px]">Tổng tiền</th>
                <th className="py-3.5 px-3 min-w-[130px]">Trạng thái</th>
                <th className="py-3.5 px-3 min-w-[130px]">Thời gian đặt</th>
                <th className="py-3.5 px-3 min-w-[140px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                const firstItem = order.items[0];
                const moreCount = order.items.length - 1;

                // Chữ cái đầu cho Avatar
                const initialLetter = order.customerName.charAt(0).toUpperCase();

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50/60 transition ${
                      isSelected ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(order.id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                    </td>

                    {/* Mã đơn hàng */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-gray-950 font-mono text-xs">
                        {order.orderNumber}
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {initialLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {order.customerEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Sản phẩm */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {firstItem && (
                          <div className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                            <img
                              src={firstItem.image}
                              alt={firstItem.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {moreCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200/80">
                            +{moreCount}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tổng tiền */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-gray-950 text-xs">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                          order.statusColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : order.statusColor === 'blue'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : order.statusColor === 'green'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-gray-100 text-gray-600 border border-gray-200/80'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            order.statusColor === 'amber'
                              ? 'bg-amber-500'
                              : order.statusColor === 'blue'
                              ? 'bg-blue-500'
                              : order.statusColor === 'green'
                              ? 'bg-emerald-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        <span>{order.statusLabel}</span>
                      </span>
                    </td>

                    {/* Thời gian đặt */}
                    <td className="py-3.5 px-3 text-gray-700 font-medium">
                      <span className="whitespace-pre-line leading-relaxed">
                        {order.createdAt}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-md transition cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                        >
                          <span>Xem chi tiết</span>
                          <span className="text-gray-400">&rarr;</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === order.id ? null : order.id)
                          }
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center transition cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Menu thao tác nhanh */}
                        {activeMenuId === order.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-40 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingOrder(order);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <span>Xem toàn bộ chi tiết</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info(`Đang tạo file in hóa đơn ${order.orderNumber}...`);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-gray-500" />
                                <span>In phiếu giao hàng</span>
                              </button>
                              {order.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Giao cho bưu tá</span>
                                </button>
                              )}
                              {order.status === 'SHIPPING' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Đã giao thành công</span>
                                </button>
                              )}
                              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setCancellingOrder(order);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 cursor-pointer border-t border-gray-100"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Hủy đơn này</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        {searchQuery || selectedStatus !== 'ALL' || amountRange !== 'all' || sortBy !== 'NEWEST'
                          ? 'Không tìm thấy đơn hàng nào phù hợp'
                          : 'Chưa có đơn hàng nào trong cửa hàng'}
                      </span>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        {searchQuery || selectedStatus !== 'ALL' || amountRange !== 'all' || sortBy !== 'NEWEST'
                          ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc'
                          : 'Các đơn hàng mới của khách sẽ xuất hiện tại đây khi được đặt mua'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


        <div className="p-4 border-t border-gray-100 bg-white">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={6}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      <OrderDetailModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onUpdateStatus={(orderId, nextStatus) => {
          if (nextStatus === 'CANCELLED') {
            const target = orders.find((o) => o.id === orderId) || viewingOrder;
            setCancellingOrder(target);
          } else {
            handleUpdateStatus(orderId, nextStatus);
          }
        }}
      />

      <CancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        order={cancellingOrder}
        isLoading={updateStatusMutation.isPending}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
