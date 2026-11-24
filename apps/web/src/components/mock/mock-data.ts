export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  variant?: string;
  comment: string;
  helpfulCount?: number;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: string;
  subCategory?: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue';
  rating: number;
  reviewsCount: number;
  soldCount?: string;
  image: string;
  images?: string[];
  colors?: { name: string; hex: string }[];
  colorDots?: string[];
  capacities?: string[];
  inStock?: boolean;
  description?: string;
  fullDescription?: string;
  features?: string[];
  specs?: Record<string, string>;
  reviews?: ProductReview[];
}

export const CATALOG_PRODUCTS: Product[] = [
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Tai nghe Bluetooth Sony WH-1000XM5',
    category: 'audio',
    subCategory: 'Tai nghe',
    brand: 'Sony',
    price: 4990000,
    oldPrice: 6990000,
    discountPercent: 29,
    badge: 'Bán chạy',
    badgeColor: 'green',
    rating: 4.8,
    reviewsCount: 12500,
    soldCount: 'Đã bán 50k+',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&auto=format&fit=crop&q=80',
    ],
    inStock: true,
  },
  {
    id: 'prod-iphone-16',
    name: 'iPhone 16 128GB (Chính hãng VN/A)',
    category: 'phone',
    subCategory: 'Điện thoại',
    brand: 'Apple',
    price: 22990000,
    badge: 'Mới',
    badgeColor: 'green',
    rating: 4.9,
    reviewsCount: 8700,
    soldCount: 'Đã bán 20k+',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-nike-air-force-1',
    name: "Giày Nike Air Force 1 '07",
    category: 'sports',
    subCategory: 'Giày dép',
    brand: 'Nike',
    price: 2490000,
    oldPrice: 3500000,
    discountPercent: 29,
    badge: 'Giảm giá',
    badgeColor: 'red',
    rating: 4.7,
    reviewsCount: 3200,
    soldCount: 'Đã bán 15k+',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-asus-vivobook-15',
    name: 'Laptop ASUS Vivobook 15 (Core i5-13420H)',
    category: 'laptop',
    subCategory: 'Laptop',
    brand: 'ASUS',
    price: 14990000,
    rating: 4.8,
    reviewsCount: 1100,
    soldCount: 'Đã bán 5k+',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-apple-watch-s10',
    name: 'Apple Watch Series 10 (GPS)',
    category: 'phone',
    subCategory: 'Đồng hồ',
    brand: 'Apple',
    price: 10990000,
    oldPrice: 13990000,
    discountPercent: 21,
    badge: 'Giảm giá',
    badgeColor: 'red',
    rating: 4.7,
    reviewsCount: 2800,
    soldCount: 'Đã bán 10k+',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-balo-mark-ryden',
    name: 'Balo Laptop Mark Ryden MR-9668',
    category: 'fashion',
    subCategory: 'Balo',
    brand: 'Mark Ryden',
    price: 799000,
    badge: 'Bán chạy',
    badgeColor: 'green',
    rating: 4.8,
    reviewsCount: 1500,
    soldCount: 'Đã bán 8k+',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-airpods-4',
    name: 'Tai nghe AirPods 4 (USB-C)',
    category: 'audio',
    subCategory: 'Tai nghe',
    brand: 'Apple',
    price: 4990000,
    rating: 4.9,
    reviewsCount: 6100,
    soldCount: 'Đã bán 12k+',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-skii-essence',
    name: 'Nước thần SK-II Facial Treatment Essence 230ml',
    category: 'beauty',
    subCategory: 'Mỹ phẩm',
    brand: 'SK-II',
    price: 6990000,
    badge: 'Mới',
    badgeColor: 'green',
    rating: 4.9,
    reviewsCount: 1200,
    soldCount: 'Đã bán 3k+',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-apple-watch-s9',
    name: 'Apple Watch Series 9',
    category: 'phone',
    subCategory: 'Điện thoại & Phụ kiện',
    brand: 'Apple',
    price: 12990000,
    oldPrice: 16990000,
    discountPercent: 24,
    badge: 'Bán chạy',
    badgeColor: 'green',
    rating: 4.8,
    reviewsCount: 41,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#0f172a', '#475569', '#cbd5e1'],
    inStock: true,
  },
  {
    id: 'prod-balo-unisex',
    name: 'Balo thời trang Unisex',
    category: 'fashion',
    subCategory: 'Thời trang & Phụ kiện',
    brand: 'Dell',
    price: 890000,
    oldPrice: 1290000,
    discountPercent: 31,
    badge: 'Mới',
    badgeColor: 'blue',
    rating: 4.6,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#374151', '#6b7280'],
    inStock: true,
  },
  {
    id: 'prod-sony-wh1000xm5-black',
    name: 'Sony WH-1000XM5 (Midnight Black)',
    category: 'audio',
    subCategory: 'Điện tử & Gia dụng',
    brand: 'Sony',
    price: 7490000,
    oldPrice: 9990000,
    discountPercent: 25,
    rating: 4.8,
    reviewsCount: 41,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#111827', '#6b7280'],
    inStock: true,
  },
  {
    id: 'prod-nike-air-force-1-sport',
    name: 'Giày thể thao Nike Air Force 1 All White',
    category: 'sports',
    subCategory: 'Thể thao & Dã ngoại',
    brand: 'Xiaomi',
    price: 2990000,
    oldPrice: 3990000,
    discountPercent: 25,
    badge: 'Mới',
    badgeColor: 'blue',
    rating: 4.7,
    reviewsCount: 36,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#f8fafc', '#94a3b8'],
    inStock: true,
  },
  {
    id: 'prod-galaxy-watch-6',
    name: 'Samsung Galaxy Watch 6',
    category: 'phone',
    subCategory: 'Điện thoại & Phụ kiện',
    brand: 'Samsung',
    price: 6990000,
    oldPrice: 8990000,
    discountPercent: 22,
    badge: 'Giảm giá',
    badgeColor: 'red',
    rating: 4.6,
    reviewsCount: 28,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#064e3b', '#0f172a', '#e2e8f0'],
    inStock: true,
  },
  {
    id: 'prod-ipad-air-m2',
    name: 'iPad Air M2 11" WiFi 128GB',
    category: 'laptop',
    subCategory: 'Laptop & Máy tính',
    brand: 'Apple',
    price: 16990000,
    oldPrice: 18990000,
    discountPercent: 11,
    badge: 'Mới',
    badgeColor: 'blue',
    rating: 4.9,
    reviewsCount: 47,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#475569', '#cbd5e1', '#e2e8f0'],
    inStock: true,
  },
  {
    id: 'prod-logitech-mx-master-3s',
    name: 'Chuột không dây MX Master 3S',
    category: 'laptop',
    subCategory: 'Laptop & Máy tính',
    brand: 'Dell',
    price: 2190000,
    oldPrice: 2690000,
    discountPercent: 18,
    badge: 'Bán chạy',
    badgeColor: 'green',
    rating: 4.9,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#1e293b', '#e2e8f0'],
    inStock: true,
  },
  {
    id: 'prod-keychron-k2-pro',
    name: 'Bàn phím cơ Keychron K2 Pro',
    category: 'laptop',
    subCategory: 'Laptop & Máy tính',
    brand: 'Xiaomi',
    price: 2490000,
    oldPrice: 2990000,
    discountPercent: 17,
    badge: 'Giảm giá',
    badgeColor: 'red',
    rating: 4.8,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#0f172a', '#e2e8f0', '#dc2626'],
    inStock: true,
  },
  {
    id: 'prod-marshall-emberton-2',
    name: 'Loa Marshall Emberton II',
    category: 'audio',
    subCategory: 'Điện tử & Gia dụng',
    brand: 'Sony',
    price: 3890000,
    oldPrice: 4590000,
    discountPercent: 15,
    badge: 'Bán chạy',
    badgeColor: 'green',
    rating: 4.7,
    reviewsCount: 39,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    colorDots: ['#18181b', '#d97706'],
    inStock: true,
  },
];

export const HOME_FEATURED_PRODUCTS: Product[] = CATALOG_PRODUCTS;

export const MOCK_CART_ITEMS = [
  {
    id: 'c1',
    productId: 'ip-15',
    name: 'iPhone 15 128GB',
    variant: 'Màu xanh | 128GB',
    price: 22990000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'c2',
    productId: 'airpods-pro-2',
    name: 'AirPods Pro 2',
    variant: 'Trắng',
    price: 5990000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=80',
  },
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-20240412',
    date: '12/04/2024',
    total: 2490000,
    status: 'Đã giao',
    statusColor: 'green',
    itemsCount: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ORD-20240408',
    date: '08/04/2024',
    total: 3290000,
    status: 'Đang xử lý',
    statusColor: 'orange',
    itemsCount: 1,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ORD-20240330',
    date: '30/03/2024',
    total: 1890000,
    status: 'Đã hủy',
    statusColor: 'red',
    itemsCount: 2,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&auto=format&fit=crop&q=80',
  },
];

export const RELATED_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone-15-plus',
    name: 'iPhone 15 Plus 128GB',
    category: 'phone',
    subCategory: 'Điện thoại & Phụ kiện',
    brand: 'Apple',
    price: 24990000,
    oldPrice: 28490000,
    discountPercent: 12,
    rating: 4.7,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-iphone-14',
    name: 'iPhone 14 128GB',
    category: 'phone',
    subCategory: 'Điện thoại & Phụ kiện',
    brand: 'Apple',
    price: 19990000,
    oldPrice: 24390000,
    discountPercent: 18,
    rating: 4.6,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-samsung-galaxy-s23',
    name: 'Samsung Galaxy S23 128GB',
    category: 'phone',
    subCategory: 'Điện thoại & Phụ kiện',
    brand: 'Samsung',
    price: 17990000,
    oldPrice: 22490000,
    discountPercent: 20,
    rating: 4.5,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80',
    inStock: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  const found = CATALOG_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  if (found) {
    // If found, ensure it has images and description fallbacks if missing
    return {
      ...found,
      slug: found.slug || found.id,
      images: found.images && found.images.length > 0 ? found.images : [found.image],
      soldCount: found.soldCount || '1.8k+',
      colors: found.colors || [
        { name: 'Mặc định', hex: '#374151' },
        { name: 'Trắng bạc', hex: '#e5e7eb' },
        { name: 'Xanh thanh lịch', hex: '#0284c7' },
      ],
      capacities: found.capacities || ['Tiêu chuẩn', 'Nâng cao'],
      description:
        found.description ||
        `${found.name} là sản phẩm chính hãng thuộc thương hiệu ${found.brand}. Mang đến trải nghiệm vượt trội với chất lượng hoàn thiện cao cấp và hiệu năng mạnh mẽ.`,
      features: found.features || [
        'Sản phẩm chính hãng 100%, bảo hành toàn quốc.',
        'Thiết kế hiện đại, vật liệu cao cấp bền bỉ theo thời gian.',
        'Tối ưu hóa hiệu năng và trải nghiệm người dùng mượt mà.',
        'Hỗ trợ công nghệ sạc nhanh và kết nối thông minh thế hệ mới.',
      ],
      specs: found.specs || {
        'Thương hiệu': found.brand,
        'Danh mục': found.subCategory || 'Công nghệ & Điện tử',
        'Tình trạng': found.inStock ? 'Còn hàng mới 100%' : 'Tạm hết hàng',
        'Bảo hành': '12 tháng chính hãng',
        'Xuất xứ': 'Chính hãng',
      },
    };
  }
  return undefined;
}

export const getProductById = getProductBySlug;
