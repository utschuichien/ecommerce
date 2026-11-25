import React from 'react';

/**
 * Đường dẫn ảnh sản phẩm mặc định duy nhất cho toàn bộ hệ thống
 */
export const DEFAULT_PRODUCT_IMAGE = '/images/defaults/default-product.svg';

/**
 * Trả về URL ảnh sản phẩm hợp lệ, tự động fallback về ảnh mặc định nếu bị thiếu
 */
export function getProductImage(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return url;
}

/**
 * Xử lý khi thẻ <img> gặp lỗi tải (404, ảnh bị mất, URL hỏng)
 * Tự động chuyển đổi sang ảnh mặc định duy nhất của sàn CommerceOS
 */
export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
) {
  const target = e.currentTarget;
  if (!target.src.endsWith(DEFAULT_PRODUCT_IMAGE)) {
    target.src = DEFAULT_PRODUCT_IMAGE;
  }
}
