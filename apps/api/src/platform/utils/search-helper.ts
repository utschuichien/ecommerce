/**
 * Search Helper Utilities cho hệ thống CommerceOS
 * Cung cấp:
 * 1. Chuẩn hóa tiếng Việt bỏ dấu đa tầng (normalize NFD, đ/d, ký tự đặc biệt)
 * 2. Tách từ khóa tokenization phục vụ tìm kiếm rời rạc (Multi-token AND)
 * 3. Tự động sinh chuỗi chỉ mục tìm kiếm `searchText` phong phú cho sản phẩm
 * 4. Tính toán điểm liên quan (Relevance Scoring) để xếp hạng kết quả tìm kiếm chuẩn xác
 */

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu sang không dấu chuẩn xác
 * Ví dụ: "Điện thoại iPhone 15 Pro Max" -> "dien thoai iphone 15 pro max"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Tách từ khóa tìm kiếm thành danh sách các token (từ đơn)
 * Loại bỏ các ký tự đặc biệt thừa, giữ lại chữ và số
 */
export function extractSearchTokens(query: string): string[] {
  if (!query || !query.trim()) return [];
  const cleaned = query.replace(/[^\p{L}\p{N}\s]/gu, ' ');
  return cleaned
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Tạo chuỗi searchText phong phú chứa cả tên có dấu, không dấu, tên shop, brand, category
 */
export function generateSearchText(params: {
  name: string;
  slug?: string;
  categoryName?: string;
  brandName?: string;
  shopName?: string;
  description?: string;
}): string {
  const parts: string[] = [];

  if (params.name) {
    parts.push(params.name);
    parts.push(removeVietnameseTones(params.name));
  }
  if (params.slug) {
    parts.push(params.slug.replace(/[-_]+/g, ' '));
  }
  if (params.brandName) {
    parts.push(params.brandName);
    parts.push(removeVietnameseTones(params.brandName));
  }
  if (params.categoryName) {
    parts.push(params.categoryName);
    parts.push(removeVietnameseTones(params.categoryName));
  }
  if (params.shopName) {
    parts.push(params.shopName);
    parts.push(removeVietnameseTones(params.shopName));
  }

  // Loại bỏ từ trùng lặp và nối thành chuỗi đồng nhất
  const words = parts.join(' ').toLowerCase().split(/\s+/).filter(Boolean);
  return Array.from(new Set(words)).join(' ');
}

/**
 * Tính điểm xếp hạng liên quan (Relevance Score) để sắp xếp kết quả tìm kiếm
 * Điểm càng cao thì xếp càng lên đầu:
 * - Khớp chính xác cả cụm ở đầu tên: 100 điểm
 * - Khớp chính xác cả cụm trong tên: 80 điểm
 * - Khớp không dấu trong tên: 60 điểm
 * - Khớp tất cả các từ trong tên: 40 điểm
 * - Khớp trong searchText/brand/category: 20 điểm
 */
export function calculateRelevanceScore(
  product: { name: string; searchText?: string | null; brandName?: string; categoryName?: string },
  query: string,
): number {
  if (!query) return 0;
  const rawQ = query.toLowerCase().trim();
  const normQ = removeVietnameseTones(query);
  const rawName = product.name.toLowerCase();
  const normName = removeVietnameseTones(product.name);

  if (rawName.startsWith(rawQ)) return 100;
  if (rawName.includes(rawQ)) return 80;
  if (normName.startsWith(normQ)) return 70;
  if (normName.includes(normQ)) return 60;

  // Kiểm tra từng token
  const tokens = normQ.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const matchAllInName = tokens.every((t) => normName.includes(t));
  if (matchAllInName) return 40;

  // Kiểm tra xem có token nào khớp trong searchText / brand / category không
  const combinedMeta = [
    product.searchText || '',
    product.brandName ? removeVietnameseTones(product.brandName) : '',
    product.categoryName ? removeVietnameseTones(product.categoryName) : '',
  ]
    .join(' ')
    .toLowerCase();

  const matchInMeta = tokens.some((t) => combinedMeta.includes(t));
  if (matchInMeta) return 20;

  return 0;
}
