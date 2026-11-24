'use client';

import React from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react';

export interface OrderItemDetail {
  id: string;
  name: string;
  image: string;
  sku: string;
  price: number;
  quantity: number;
  variantLabel?: string;
}

export interface SellerOrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItemDetail[];
  totalAmount: number;
  shippingFee: number;
  status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  statusLabel: string;
  statusColor: 'amber' | 'blue' | 'green' | 'gray';
  createdAt: string;
  paymentMethod?: string;
}

interface OrderDetailModalProps {
  order: SellerOrderRecord | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, nextStatus: SellerOrderRecord['status']) => void;
}

export function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              Chi tiết đơn hàng
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                {order.orderNumber}
              </span>
            </h3>
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                order.statusColor === 'amber'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : order.statusColor === 'blue'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : order.statusColor === 'green'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  order.statusColor === 'amber'
                    ? 'bg-amber-500'
                    : order.statusColor === 'blue'
                    ? 'bg-blue-500'
                    : order.statusColor === 'green'
                    ? 'bg-emerald-500'
                    : 'bg-gray-400'
                }`}
              />
              {order.statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin khách hàng & địa chỉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 text-xs">
          <div className="space-y-1.5">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              Thông tin người nhận
            </span>
            <p className="font-bold text-gray-900">{order.customerName}</p>
            <p className="text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3 text-gray-400" />
              {order.customerEmail}
            </p>
            {order.customerPhone && (
              <p className="text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" />
                {order.customerPhone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              Địa chỉ nhận hàng
            </span>
            <p className="text-gray-600 leading-relaxed">
              {order.shippingAddress || 'Số 123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh'}
            </p>
            <p className="text-[11px] text-gray-400">
              Thời gian đặt: {order.createdAt}
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm trong đơn */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-800 block">
            Danh sách sản phẩm ({order.items.length})
          </span>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-2 text-center w-16">SL</th>
                  <th className="py-2.5 px-3 text-right w-28">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right w-32">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/40">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono mt-0.5">
                            <span>SKU: {item.sku}</span>
                            {item.variantLabel && (
                              <span className="text-emerald-700 bg-emerald-50 px-1 rounded">
                                {item.variantLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-gray-700">
                      x{item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">
                      {item.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng kết tiền đơn hàng */}
        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span>Tiền hàng</span>
            <span>
              {(order.totalAmount - (order.shippingFee || 30000)).toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Phí vận chuyển</span>
            <span>{(order.shippingFee || 30000).toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between">
            <span className="font-bold text-gray-900">Tổng thanh toán</span>
            <span className="text-base font-bold text-emerald-600">
              {order.totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Nút hành động thay đổi trạng thái nhanh */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {order.status === 'PENDING' && onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'SHIPPING')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Truck className="w-3.5 h-3.5" />
                Giao cho đơn vị vận chuyển
              </button>
            )}

            {order.status === 'SHIPPING' && onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Xác nhận đã giao hàng
              </button>
            )}

            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer transition"
              >
                Hủy đơn
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
