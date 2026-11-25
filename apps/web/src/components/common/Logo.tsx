import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

/**
 * Component Logo thương hiệu CommerceOS thống nhất toàn hệ thống
 * Thiết kế squircle bo góc emerald với biểu tượng túi mua sắm sắc nét
 */
export function Logo({
  className = '',
  showText = true,
  textClassName = 'text-xl font-bold tracking-tight text-gray-900',
  iconClassName = 'w-9 h-9 shrink-0',
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Squircle Emerald với túi mua sắm trắng to rõ, sắc nét hơn */}
      <div
        className={`${iconClassName} rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform`}
        aria-hidden="true"
      >
        <svg className="w-[64%] h-[64%] fill-current" viewBox="0 0 24 24">
          <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
        </svg>
      </div>
      {showText && <span className={textClassName}>CommerceOS</span>}
    </div>
  );
}
