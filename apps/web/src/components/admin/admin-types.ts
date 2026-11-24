export type AdminTabType =
  | 'overview'
  | 'shops'
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'reviews'
  | 'payouts'
  | 'vouchers';

export const ADMIN_TAB_LABELS: Record<AdminTabType, string> = {
  overview: 'Tổng quan sàn',
  shops: 'Quản lý Gian hàng',
  products: 'Quản lý Sản phẩm',
  categories: 'Danh mục ngành hàng',
  orders: 'Quản lý Đơn hàng',
  users: 'Quản lý Người dùng',
  reviews: 'Đánh giá & Khiếu nại',
  payouts: 'Lịch sử Giải ngân',
  vouchers: 'Quản lý Voucher',
};
