import React from 'react';

export interface BrandLoaderProps {
  /** Toàn màn hình hay inline trong component */
  fullScreen?: boolean;
  /** Kích thước: sm, md, lg */
  size?: 'sm' | 'md' | 'lg';
  /** Thông báo hiển thị bên dưới */
  message?: string;
  /** Có hiển thị chữ CommerceOS hay không */
  showBrandName?: boolean;
  /** Tùy biến class container */
  className?: string;
}

/**
 * Component Loading đặc trưng thương hiệu CommerceOS
 * Kết hợp biểu tượng Squircle Emerald mang tính nhận diện cao,
 * vòng xoay quỹ đạo (orbital ring) thanh lịch và hiệu ứng nhịp thở sống động.
 */
export function BrandLoader({
  fullScreen = false,
  size = 'md',
  message,
  showBrandName = true,
  className = '',
}: BrandLoaderProps) {
  const sizeMap = {
    sm: {
      wrapper: 'w-12 h-12',
      iconBox: 'w-8 h-8 rounded-lg',
      svg: 'w-4 h-4',
      ring: 'border-2',
      text: 'text-xs',
      brand: 'text-xs',
    },
    md: {
      wrapper: 'w-16 h-16',
      iconBox: 'w-11 h-11 rounded-xl',
      svg: 'w-6 h-6',
      ring: 'border-2',
      text: 'text-xs sm:text-sm',
      brand: 'text-sm',
    },
    lg: {
      wrapper: 'w-20 h-20',
      iconBox: 'w-14 h-14 rounded-2xl',
      svg: 'w-8 h-8',
      ring: 'border-[2.5px]',
      text: 'text-sm',
      brand: 'text-base',
    },
  }[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Container Biểu tượng trung tâm & Vòng quỹ đạo chuyển động */}
      <div className={`relative flex items-center justify-center ${sizeMap.wrapper}`}>
        {/* Vòng hào quang nhẹ (ambient pulse) */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping pointer-events-none" />

        {/* Vòng quay quỹ đạo (Orbital spinner ring) sắc nét theo tone Emerald đặc trưng */}
        <div
          className={`absolute inset-0 rounded-full border-emerald-500/20 border-t-emerald-600 animate-spin ${sizeMap.ring}`}
        />

        {/* Biểu tượng Squircle Emerald chính giữa đồng nhất với Logo */}
        <div
          className={`relative z-10 ${sizeMap.iconBox} bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 transition-transform`}
        >
          <svg className={`${sizeMap.svg} fill-current`} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
          </svg>
        </div>
      </div>

      {/* Tên thương hiệu & Thông điệp trạng thái */}
      {(showBrandName || message) && (
        <div className="flex flex-col items-center text-center space-y-1">
          {showBrandName && (
            <div className={`font-bold tracking-tight text-gray-900 inline-flex items-center gap-1.5 ${sizeMap.brand}`}>
              <span>CommerceOS</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            </div>
          )}
          {message && (
            <p className={`font-medium text-gray-500 ${sizeMap.text}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 min-h-screen w-screen flex items-center justify-center bg-[#f8f9fa] p-4 z-50">
        {content}
      </div>
    );
  }

  return content;
}
