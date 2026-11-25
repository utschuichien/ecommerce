'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Package,
  Search,
  Eye,
  RefreshCw,
  XCircle,
  Loader2,
  X,
  ShoppingBag,
  Star,
  Truck,
  Store,
  ChevronRight,
} from 'lucide-react';
import { ProfileOrder } from './profile-types';
import { formatVND } from '../../lib/api-client';
import { ProductImage } from '@/components/common/ProductImage';
import {
  useCancelOrder,
  useMyOrders,
  useOrderStatuses,
} from '@/features/orders/hooks/useOrders';
import {
  ORDER_FILTER_TABS,
  ORDER_STATUS_CONFIG,
} from '@/features/orders/types/order-status';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { ReviewModal } from './ReviewModal';

interface ProfileOrdersTabProps {
  orders?: ProfileOrder[];
  onViewOrderDetails?: (order: ProfileOrder) => void;
}

export function ProfileOrdersTab({
  orders: fallbackOrders,
}: ProfileOrdersTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc page và status trực tiếp từ URL query params (luôn chuẩn hóa về chữ thường lowercase)
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const statusFromUrl = (searchParams.get('status') || 'all').toLowerCase();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchQuery, 600);
  const [reviewingProduct, setReviewingProduct] = useState<{
    orderId: string;
    product: any;
  } | null>(null);

  // Tự động chuyển param 'status' trên URL về chữ thường nếu đang là chữ hoa
  useEffect(() => {
    const rawStatus = searchParams.get('status');
    if (rawStatus && rawStatus !== rawStatus.toLowerCase()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('status', rawStatus.toLowerCase());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Tự động đồng bộ từ khóa tìm kiếm đã debounce lên URL & reset về page 1
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    if (debouncedSearch.trim() !== currentUrlSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'orders');
      params.set('page', '1');
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      } else {
        params.delete('search');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch]);

  // Lấy danh sách metadata trạng thái và chuẩn hóa key 100% về chữ thường
  const { data: serverStatuses } = useOrderStatuses();
  const rawTabs =
    serverStatuses && serverStatuses.length > 0
      ? serverStatuses.map((s: any) => ({
          key: s.key.toLowerCase(),
          label: s.label,
        }))
      : ORDER_FILTER_TABS;
  const tabs = rawTabs.some((t: any) => t.key === 'all')
    ? rawTabs
    : [{ key: 'all', label: 'Tất cả' }, ...rawTabs];

  // Lấy đơn hàng thực tế từ API với limit luôn là 10 (status truyền lên API luôn là chữ thường)
  const {
    data: ordersResponse,
    isLoading,
    isFetching,
  } = useMyOrders({
    page: pageFromUrl,
    status: statusFromUrl !== 'all' ? statusFromUrl : undefined,
    search: debouncedSearch.trim() || undefined,
    limit: 10,
  });

  const cancelOrderMutation = useCancelOrder();

  // Đơn hàng hiển thị (ưu tiên dữ liệu API, fallback props khi test offline)
  const ordersList: any[] =
    ordersResponse?.data && ordersResponse.data.length > 0
      ? ordersResponse.data
      : ordersResponse?.data
      ? []
      : fallbackOrders && fallbackOrders.length > 0
      ? fallbackOrders
      : [];

  const pagination = ordersResponse?.pagination || {
    total: ordersList.length,
    page: pageFromUrl,
    limit: 10,
    totalPages: Math.max(1, Math.ceil(ordersList.length / 10)),
  };

  // Cập nhật page lên URL
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'orders');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Cập nhật filter trạng thái lên URL (luôn là chữ thường lowercase)
  const handleFilterChange = (statusKey: string) => {
    const key = statusKey.toLowerCase();
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'orders');
    params.set('page', '1');
    if (key && key !== 'all') {
      params.set('status', key);
    } else {
      params.delete('status');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'orders');
    params.set('page', '1');
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCancel = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderNumber}?`)) return;
    try {
      await cancelOrderMutation.mutateAsync({ orderId });
      toast.success('Hủy đơn hàng thành công', {
        description: `Đơn hàng ${orderNumber} đã được hủy.`,
      });
    } catch {
      toast.error('Hủy đơn thất bại', {
        description: 'Không thể hủy đơn hàng này vào lúc này.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. KHỐI BỘ LỌC TÁCH BIỆT: Tiêu đề, Tìm kiếm & Tabs trạng thái */}
      <div className="bg-white border border-gray-200/70 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Hàng trên: Tiêu đề + Ô tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              Đơn hàng của tôi
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              {pagination.total}
            </span>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            )}
          </div>

          {/* Ô tìm kiếm thanh thoát */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full sm:w-72"
          >
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-gray-50/80 border border-gray-200/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>
        </div>

        {/* Hàng dưới: Thanh Tabs phân loại trạng thái nằm ngang mượt mà */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-gray-100 scrollbar-none text-xs">
          {tabs.map((tab: any) => {
            const isActive = statusFromUrl === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleFilterChange(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-xs ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/70'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KHỐI DANH SÁCH ĐƠN HÀNG GỌN GÀNG (Ultra Compact Orders List) */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200/70 rounded-xl p-3 space-y-2.5 bg-white animate-pulse"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-3.5 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-lg bg-gray-100 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-3.5 w-20 bg-gray-200 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : ordersList.length === 0 ? (
        <div className="bg-white border border-gray-200/70 rounded-xl py-10 px-4 text-center space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 mx-auto rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-gray-800">
              Chưa có đơn hàng nào
            </p>
            <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
              {searchQuery || statusFromUrl !== 'all'
                ? 'Không tìm thấy đơn hàng phù hợp với điều kiện tìm kiếm.'
                : 'Bạn chưa có đơn hàng nào tại danh mục này.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Khám phá sản phẩm ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ordersList.map((order) => {
            // Lấy thông tin sản phẩm đại diện thực tế từ mảng items
            const firstItem = order.items?.[0];
            const productName =
              firstItem?.productName || order.productName || 'Sản phẩm';
            const variantLabel = firstItem?.variantLabel;
            const imageSrc =
              firstItem?.image || firstItem?.imageKey || order.image;
            const totalItemsCount = order.items?.length || order.itemsCount || 1;
            const totalAmount = order.grandTotal ?? order.totalAmount ?? 0;

            const statusBadgeStyles =
              order.badgeClass ||
              order.statusMeta?.color ||
              ORDER_STATUS_CONFIG[order.status]?.badgeClass ||
              'bg-gray-50 text-gray-700 border-gray-200';

            const statusLabel =
              order.statusLabel ||
              order.statusMeta?.label ||
              ORDER_STATUS_CONFIG[order.status]?.label ||
              order.status;

            const isPending =
              order.status === 'pending' || order.status === 'PENDING_PAYMENT';
            const isDelivered =
              order.status === 'delivered' ||
              order.status === 'completed' ||
              order.status === 'DELIVERED' ||
              order.status === 'COMPLETED';

            const orderShop = (order as any).sellerOrders?.[0]?.shop || (order as any).shop;
            const shopTarget = orderShop?.slug || orderShop?.publicId || orderShop?.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200/70 rounded-xl p-3 sm:p-3.5 hover:border-emerald-200 hover:shadow-2xs transition-all space-y-2.5"
              >
                {/* Hàng 1 (Header nhỏ gọn): Tên shop hoặc Mã đơn, ngày đặt & badge trạng thái */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100/80">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    {orderShop ? (
                      <Link
                        href={`/shop/${shopTarget}`}
                        className="font-semibold text-xs sm:text-sm text-gray-900 hover:text-emerald-700 flex items-center gap-1 transition group truncate max-w-[220px]"
                        title={`Xem gian hàng ${orderShop.name}`}
                      >
                        <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{orderShop.name}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                      </Link>
                    ) : (
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-semibold text-xs sm:text-sm text-gray-900 hover:text-emerald-700 transition"
                      >
                        #{order.orderNumber}
                      </Link>
                    )}
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      #{order.orderNumber}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span className="text-[11px] text-gray-400 hidden sm:inline shrink-0">
                      {order.date ||
                        (order.placedAt
                          ? new Date(order.placedAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '')}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${statusBadgeStyles}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Hàng 2: Sản phẩm + Thành tiền + Cụm nút hành động liền mạch 1 dòng */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Sản phẩm đại diện */}
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    {/* Thumbnail sản phẩm nhỏ gọn */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg border border-gray-200/70 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      <ProductImage
                        src={imageSrc}
                        alt={productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* Tên & biến thể */}
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-gray-800 line-clamp-1 group-hover:text-emerald-700 transition">
                        {productName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {variantLabel && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded leading-none">
                            {variantLabel}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {totalItemsCount > 1
                            ? `+${totalItemsCount - 1} sản phẩm khác`
                            : 'x1'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Cụm Giá tiền + Nút bấm gom vào bên phải */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 mr-1 sm:hidden">
                        Tổng:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700">
                        {formatVND(totalAmount)}
                      </span>
                    </div>

                    {/* Cụm nút hành động nhỏ gọn */}
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <button
                          type="button"
                          disabled={cancelOrderMutation.isPending}
                          onClick={() => handleCancel(order.id, order.orderNumber)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 rounded-md text-[11px] font-medium transition cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Hủy</span>
                        </button>
                      )}

                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-200 rounded-md text-[11px] font-medium text-gray-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer bg-white"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Chi tiết</span>
                      </Link>

                      {isDelivered && (
                        <button
                          type="button"
                          onClick={() =>
                            setReviewingProduct({
                              orderId: order.orderNumber || order.id,
                              product: {
                                id:
                                  firstItem?.productId ||
                                  (order as any).productId ||
                                  productName,
                                name: productName,
                                image: imageSrc,
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[11px] font-medium transition cursor-pointer shadow-2xs"
                        >
                          <Star className="w-3 h-3 fill-white text-white" />
                          <span>Đánh giá</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          toast.success('Đã thêm các sản phẩm vào giỏ hàng')
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium transition cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Mua lại</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Phân trang */}
          <div className="pt-2">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={10}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* MODAL GỬI ĐÁNH GIÁ SẢN PHẨM */}
      {reviewingProduct && (
        <ReviewModal
          isOpen={Boolean(reviewingProduct)}
          onClose={() => setReviewingProduct(null)}
          orderId={reviewingProduct.orderId}
          product={reviewingProduct.product}
        />
      )}
    </div>
  );
}
