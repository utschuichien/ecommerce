'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Loader2,
  PackageCheck,
  Truck,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { useAdminOrders, useAdminOrderDetail } from '@/features/admin';
import { formatVND } from '@/lib/api-client';

const ORDER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    className: 'bg-sky-50 text-sky-700 border border-sky-200/80',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  EXPIRED: {
    label: 'Hết hạn',
    className: 'bg-gray-100 text-gray-700 border border-gray-200/80',
  },
};

function getStatusBadge(status?: string | null) {
  if (!status) return { label: 'Chưa rõ', className: 'bg-gray-100 text-gray-600 border border-gray-200/80' };
  const key = status.toUpperCase();
  return ORDER_STATUS_MAP[key] || { label: status, className: 'bg-gray-100 text-gray-700 border border-gray-200/80' };
}

export function AdminOrdersTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminOrders({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const { data: orderDetail, isLoading: isLoadingDetail } = useAdminOrderDetail(selectedOrderId);

  const orders = ordersData?.items || [];
  const pagination = ordersData?.pagination || { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

  return (
    <div className="space-y-4">
      {/* 1. Header & Bộ lọc */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã đơn (#ORD-...), người mua, email hoặc gian hàng..."
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

          {/* Nút làm mới & Bộ đếm */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400">
              Tổng số đơn: <strong>{pagination.totalItems}</strong>
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200/60 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs scrollbar-none">
          {[
            { key: 'ALL', label: 'Tất cả đơn hàng' },
            { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
            { key: 'PAID', label: 'Đã thanh toán' },
            { key: 'PROCESSING', label: 'Đang xử lý' },
            { key: 'SHIPPED', label: 'Đang giao hàng' },
            { key: 'DELIVERED', label: 'Đã giao hàng' },
            { key: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Danh sách Đơn hàng */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs">Đang tải danh sách đơn hàng toàn sàn...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-xs">
            Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4 text-center">Số món</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Ngày đặt</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="hover:bg-gray-50/60 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        #{order.orderNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="min-w-0 max-w-xs">
                          <span className="font-semibold text-gray-900 block truncate">
                            {order.customerName}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate block">
                            {order.customerEmail || order.customerPhone || 'Không có liên hệ'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-gray-700 font-medium truncate max-w-[150px]">
                          {order.shops.length > 0 ? order.shops.join(', ') : 'Chưa phân bổ'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                        {order.itemsCount} món
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-gray-950">
                        {formatVND(order.grandTotal)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-500 font-mono text-[11px]">
                        {new Date(order.placedAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang chuẩn căn giữa */}
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

      {/* 3. Modal Chi Tiết Đơn Hàng */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-950 flex items-center gap-2">
                  <span>Chi tiết đơn hàng #{orderDetail?.orderNumber || '...'}</span>
                  {orderDetail && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        getStatusBadge(orderDetail.status).className
                      }`}
                    >
                      {getStatusBadge(orderDetail.status).label}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ID định danh: {selectedOrderId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {isLoadingDetail || !orderDetail ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Đang tải thông tin đơn hàng...</span>
                </div>
              ) : (
                <>
                  {/* Thông tin người mua & Giao nhận */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-200/50 space-y-1.5">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Thông tin người đặt</span>
                      </h4>
                      <p className="text-gray-800 font-medium">{orderDetail.customer.name}</p>
                      <p className="text-gray-500 flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3" /> {orderDetail.customer.email || 'Chưa cung cấp'}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3" /> {orderDetail.customer.phone || 'Chưa cung cấp'}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-200/50 space-y-1.5">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Địa chỉ giao nhận</span>
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-[11px]">
                        {(orderDetail.shippingAddress as any)?.fullAddress ||
                          (orderDetail.shippingAddress as any)?.address ||
                          'Giao hàng theo thông tin liên hệ của khách hàng.'}
                      </p>
                      <p className="text-gray-500 text-[10px]">
                        Ngày đặt: {new Date(orderDetail.placedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Chi tiết từng đơn hàng từ các gian hàng */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-1.5 text-xs">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Danh sách kiện hàng & Sản phẩm</span>
                    </h4>

                    {orderDetail.sellerOrders.map((so) => (
                      <div
                        key={so.id}
                        className="border border-gray-200/70 rounded-lg overflow-hidden bg-white shadow-2xs"
                      >
                        <div className="p-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900">
                            Cửa hàng: {so.shopName}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Trạng thái: <strong>{so.status}</strong>
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {so.items.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <PackageCheck className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                                  <p className="text-[10px] text-gray-400">
                                    Phân loại: {item.variantLabel} • SL: x{item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 font-bold text-gray-900">
                                {formatVND(item.lineTotal)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tổng kết tài chính đơn */}
                  <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Tạm tính hàng hóa:</span>
                      <span>{formatVND(orderDetail.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Phí vận chuyển toàn đơn:</span>
                      <span>{formatVND(orderDetail.shippingTotal)}</span>
                    </div>
                    {orderDetail.discountTotal > 0 && (
                      <div className="flex items-center justify-between text-rose-600 font-semibold">
                        <span>Giảm giá (Voucher {orderDetail.voucherCode}):</span>
                        <span>-{formatVND(orderDetail.discountTotal)}</span>
                      </div>
                    )}
                    <div className="border-t border-emerald-200/60 pt-1.5 flex items-center justify-between text-sm font-bold text-emerald-900">
                      <span>Tổng tiền thanh toán:</span>
                      <span className="text-base text-emerald-700">{formatVND(orderDetail.grandTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
