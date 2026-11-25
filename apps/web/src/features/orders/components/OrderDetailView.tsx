'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  ShieldCheck,
  Ban,
  ShoppingBag,
  Star,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useMyOrderDetails } from '../hooks/useOrders';
import { OrderTimeline } from './OrderTimeline';
import { CancelOrderModal } from './CancelOrderModal';
import { ReviewModal } from '@/components/profile/ReviewModal';
import { formatVND } from '@/lib/api-client';
import { BrandLoader } from '@/components/common/BrandLoader';

interface OrderDetailViewProps {
  orderId: string;
  onClose?: () => void;
  showBackToList?: boolean;
}

export function OrderDetailView({
  orderId,
  showBackToList = true,
}: OrderDetailViewProps) {
  const { data: order, isLoading, isError, refetch } = useMyOrderDetails(orderId);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{
    orderId: string;
    product: {
      id: string;
      name: string;
      image?: string;
      variant?: string;
      variantId?: string;
    };
  } | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200/70 rounded-xl p-12 flex flex-col items-center justify-center shadow-2xs">
        <BrandLoader size="md" message="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-white border border-gray-200/70 rounded-xl p-10 text-center flex flex-col items-center justify-center gap-2.5 shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Đơn hàng này không tồn tại hoặc bạn không có quyền xem thông tin đơn hàng này.
        </p>
        <Link
          href="/profile?tab=orders"
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về danh sách đơn hàng</span>
        </Link>
      </div>
    );
  }

  // Phân tích địa chỉ nhận hàng
  const parseAddress = (addr: any) => {
    if (!addr) {
      return {
        recipient: order.contactEmail || 'Khách hàng',
        phone: order.contactPhone || '',
        fullAddress: 'Chưa cập nhật địa chỉ giao hàng',
      };
    }
    if (typeof addr === 'string') {
      try {
        addr = JSON.parse(addr);
      } catch {
        return {
          recipient: 'Khách hàng',
          phone: order.contactPhone || '',
          fullAddress: addr,
        };
      }
    }
    const recipient =
      addr.fullName || addr.name || addr.recipient || 'Khách hàng';
    const phone = addr.phone || addr.phoneNumber || order.contactPhone || '';
    const parts = [
      addr.addressLine || addr.address || addr.street,
      addr.ward,
      addr.district,
      addr.city || addr.province,
    ].filter(Boolean);

    return {
      recipient,
      phone,
      fullAddress: parts.join(', ') || 'Chưa có địa chỉ chi tiết',
    };
  };

  const addressInfo = parseAddress(order.shippingAddress);

  // Nhãn và màu trạng thái
  const statusMeta = order.statusMeta || {
    label: order.statusLabel || order.status,
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: '',
  };

  const canCancel =
    order.status === 'PENDING_PAYMENT' || order.status === 'PENDING';

  const grandTotal = order.grandTotal ?? order.totalAmount ?? 0;
  const shippingTotal = order.shippingTotal ?? order.shippingFee ?? 0;
  const discountTotal = order.discountTotal ?? 0;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200/70 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {showBackToList && (
              <Link
                href="/profile?tab=orders"
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-gray-900">
                  Đơn hàng #{order.orderNumber}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.color}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>
                  {order.placedAt
                    ? new Date(order.placedAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 self-end sm:self-center">
            Mã định danh: <code className="font-mono text-gray-600">{order.id}</code>
          </div>
        </div>
      </div>

      {/* Grid 2 Cột chuẩn TMĐT (8 cột nội dung chính / 4 cột thanh toán tóm tắt) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* CỘT TRÁI (8 CỘT): Tiến độ giao hàng & Danh sách sản phẩm */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Tiến độ giao hàng trực quan */}
          <OrderTimeline
            status={order.status}
            uiStatus={order.uiStatus}
            placedAt={order.placedAt}
            sellerOrders={order.sellerOrders}
          />

          {/* 2. Danh sách sản phẩm trong đơn */}
          <div className="bg-white border border-gray-200/70 rounded-xl p-4 sm:p-5 shadow-2xs">
            {(() => {
              const mainShop = (order as any).sellerOrders?.[0]?.shop;
              const shopTarget = mainShop?.slug || mainShop?.publicId || mainShop?.id;
              const shopHref = shopTarget ? `/shop/${shopTarget}` : null;

              return (
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    {mainShop && shopHref ? (
                      <Link
                        href={shopHref}
                        className="font-semibold text-gray-900 hover:text-emerald-700 text-xs sm:text-sm flex items-center gap-1 transition group truncate"
                        title={`Xem gian hàng ${mainShop.name}`}
                      >
                        <span className="truncate">{mainShop.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 shrink-0 transition" />
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">
                        Kiện hàng ({order.items.length} sản phẩm)
                      </h3>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                      Chính hãng
                    </span>
                  </div>

                  {mainShop && shopHref && (
                    <Link
                      href={shopHref}
                      className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-0.5 font-medium transition cursor-pointer shrink-0"
                    >
                      <span>Xem shop</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })()}

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 sm:gap-3.5"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 border border-gray-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image || item.imageKey ? (
                      <img
                        src={item.image || item.imageKey}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                      {item.productName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.variantLabel && (
                        <span className="text-[10px] text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded">
                          {item.variantLabel}
                        </span>
                      )}
                      {item.sku && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          SKU: {item.sku}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                      <span className="text-xs text-gray-500">
                        {formatVND(item.unitPrice)} × {item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          {formatVND(item.lineTotal)}
                        </span>
                        {order.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewingProduct({
                                orderId: order.orderNumber || order.id,
                                product: {
                                  id: item.productId || (item as any).id,
                                  name: item.productName,
                                  image: item.image || (item as any).imageKey,
                                  variant: item.variantLabel,
                                  variantId: item.variantId,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-md text-[11px] font-medium transition cursor-pointer shadow-2xs ml-1"
                          >
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span>Đánh giá</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (4 CỘT): Địa chỉ, Thanh toán & Tóm tắt hóa đơn */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Địa chỉ nhận hàng */}
          <div className="bg-white border border-gray-200/70 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-gray-100 text-gray-800 font-semibold text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Địa chỉ nhận hàng</span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-gray-800">
                {addressInfo.recipient}
              </p>
              {addressInfo.phone && (
                <p className="text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{addressInfo.phone}</span>
                </p>
              )}
              <p className="text-gray-600 leading-relaxed pt-0.5">
                {addressInfo.fullAddress}
              </p>
            </div>
          </div>

          {/* 2. Hình thức thanh toán */}
          <div className="bg-white border border-gray-200/70 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-gray-100 text-gray-800 font-semibold text-xs">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hình thức thanh toán</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-semibold text-gray-800">
                Thanh toán khi nhận hàng (COD)
              </p>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Thanh toán tiền mặt cho nhân viên giao hàng khi nhận kiện hàng.
              </p>
              <div className="pt-1 flex items-center gap-1 text-emerald-700 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo hành & đổi trả theo quy định</span>
              </div>
            </div>
          </div>

          {/* 3. Chi tiết chi phí & Tổng tiền */}
          <div className="bg-white border border-gray-200/70 rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="font-semibold text-gray-800 text-xs pb-2 border-b border-gray-100">
              Chi tiết thanh toán
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span>Tiền hàng:</span>
                <span className="font-medium text-gray-700">
                  {formatVND(order.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-gray-700">
                  {formatVND(shippingTotal)}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Giảm giá Voucher:</span>
                  <span className="font-medium">
                    -{formatVND(discountTotal)}
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Tổng thanh toán:</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatVND(grandTotal)}
                </span>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="pt-2.5 space-y-2">
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full py-2 bg-rose-50/70 hover:bg-rose-50 text-rose-700 border border-rose-200/80 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Hủy đơn hàng này</span>
                </button>
              )}

              <Link
                href="/profile?tab=orders"
                className="w-full py-2 border border-gray-200/80 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition text-center block"
              >
                Về danh sách đơn mua
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy đơn */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderId={order.id}
        orderNumber={order.orderNumber}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Modal gửi đánh giá cho sản phẩm thuộc đơn đã giao */}
      {reviewingProduct && (
        <ReviewModal
          isOpen={Boolean(reviewingProduct)}
          onClose={() => setReviewingProduct(null)}
          orderId={reviewingProduct.orderId}
          product={reviewingProduct.product}
          onSuccess={() => {
            setReviewingProduct(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
