/**
 * Ảnh mặc định chuẩn cho các thực thể toàn sàn CommerceOS
 * - Khách hàng (Customer)
 * - Người bán & Gian hàng (Seller & Shop)
 * - Ngành hàng & Danh mục (Categories)
 */

export const DEFAULT_CUSTOMER_AVATAR = '/images/defaults/default-customer-avatar.svg';
export const DEFAULT_SELLER_AVATAR = '/images/defaults/default-seller-avatar.svg';
export const DEFAULT_SHOP_BANNER = '/images/defaults/default-shop-banner.svg';
export const DEFAULT_CATEGORY_IMAGE = '/images/defaults/default-category.svg';

export const CATEGORY_DEFAULT_IMAGES = {
  electronics: '/images/defaults/category-electronics.svg',
  fashion: '/images/defaults/category-fashion.svg',
  home: '/images/defaults/category-home.svg',
  beauty: '/images/defaults/category-beauty.svg',
  sports: '/images/defaults/category-sports.svg',
  books: '/images/defaults/category-books.svg',
  general: '/images/defaults/default-category.svg',
} as const;

/**
 * Trả về ảnh danh mục phù hợp dựa trên slug hoặc tên ngành hàng (hỗ trợ cả tiếng Việt và tiếng Anh)
 */
export function getCategoryDefaultImage(slugOrName?: string | null): string {
  if (!slugOrName) return DEFAULT_CATEGORY_IMAGE;

  const s = slugOrName.toLowerCase();

  // Điện thoại, Máy tính, Âm thanh, Thiết bị số
  if (
    s.includes('phone') ||
    s.includes('dien-thoai') ||
    s.includes('điện thoại') ||
    s.includes('laptop') ||
    s.includes('may-tinh') ||
    s.includes('máy tính') ||
    s.includes('audio') ||
    s.includes('dien-tu') ||
    s.includes('điện tử') ||
    s.includes('tai nghe') ||
    s.includes('headphone')
  ) {
    return CATEGORY_DEFAULT_IMAGES.electronics;
  }

  // Thời trang, Phụ kiện, Quần áo, Giày dép
  if (
    s.includes('fashion') ||
    s.includes('thoi-trang') ||
    s.includes('thời trang') ||
    s.includes('quan-ao') ||
    s.includes('quần áo') ||
    s.includes('shirt') ||
    s.includes('dress') ||
    s.includes('phu-kien') ||
    s.includes('phụ kiện')
  ) {
    return CATEGORY_DEFAULT_IMAGES.fashion;
  }

  // Nhà cửa, Đời sống, Gia dụng
  if (
    s.includes('home') ||
    s.includes('nha-cua') ||
    s.includes('nhà cửa') ||
    s.includes('gia-dung') ||
    s.includes('gia dụng') ||
    s.includes('noi-that') ||
    s.includes('nội thất') ||
    s.includes('living')
  ) {
    return CATEGORY_DEFAULT_IMAGES.home;
  }

  // Sắc đẹp, Mỹ phẩm, Sức khỏe, Chăm sóc cá nhân
  if (
    s.includes('beauty') ||
    s.includes('lam-dep') ||
    s.includes('làm đẹp') ||
    s.includes('my-pham') ||
    s.includes('mỹ phẩm') ||
    s.includes('suc-khoe') ||
    s.includes('sức khỏe') ||
    s.includes('skin') ||
    s.includes('care')
  ) {
    return CATEGORY_DEFAULT_IMAGES.beauty;
  }

  // Thể thao, Dã ngoại, Fitness
  if (
    s.includes('sport') ||
    s.includes('the-thao') ||
    s.includes('thể thao') ||
    s.includes('fitness') ||
    s.includes('gym') ||
    s.includes('running') ||
    s.includes('da-ngoai') ||
    s.includes('dã ngoại')
  ) {
    return CATEGORY_DEFAULT_IMAGES.sports;
  }

  // Sách, Văn phòng phẩm, Thiết bị học tập
  if (
    s.includes('book') ||
    s.includes('sach') ||
    s.includes('sách') ||
    s.includes('van-phong') ||
    s.includes('văn phòng') ||
    s.includes('hoc-tap') ||
    s.includes('học tập')
  ) {
    return CATEGORY_DEFAULT_IMAGES.books;
  }

  return DEFAULT_CATEGORY_IMAGE;
}
