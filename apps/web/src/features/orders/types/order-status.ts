export type OrderUiStatus = 'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderStatusConfigItem {
  key: OrderUiStatus;
  label: string;
  badgeClass: string;
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfigItem> = {
  all: {
    key: 'all',
    label: 'Tất cả',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    description: 'Tất cả các đơn hàng',
  },
  pending: {
    key: 'pending',
    label: 'Chờ thanh toán',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Đơn hàng đang chờ xử lý hoặc thanh toán',
  },
  shipping: {
    key: 'shipping',
    label: 'Đang vận chuyển',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Đơn hàng đang trên đường vận chuyển',
  },
  delivered: {
    key: 'delivered',
    label: 'Đã giao hàng',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Đơn hàng đã được giao thành công',
  },
  cancelled: {
    key: 'cancelled',
    label: 'Đã hủy',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Đơn hàng đã bị hủy hoặc hết hạn',
  },
};

export const ORDER_FILTER_TABS: OrderStatusConfigItem[] = Object.values(ORDER_STATUS_CONFIG);
