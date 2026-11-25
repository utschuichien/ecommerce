'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_PRODUCT_IMAGE, getProductImage } from '@/lib/constants';

export interface ProductImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
}

/**
 * Component hiển thị ảnh sản phẩm đồng bộ cho toàn bộ hệ thống
 * Tự động chuyển về ảnh mặc định duy nhất khi link ảnh rỗng hoặc bị lỗi (404/mất kết nối)
 */
export function ProductImage({
  src,
  alt,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
  className = '',
  loading = 'lazy',
  ...props
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() =>
    getProductImage(src),
  );

  useEffect(() => {
    setCurrentSrc(getProductImage(src));
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
}
