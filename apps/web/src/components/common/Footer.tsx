import React from 'react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100/80 py-6 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <Logo
            iconClassName="h-6 w-6 shrink-0"
            textClassName="font-semibold text-gray-800 text-sm"
          />
          <span className="text-xs text-gray-400">— Nền tảng thương mại điện tử hiện đại cho mọi người</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-400">
          <span>Điều khoản dịch vụ</span>
          <span>·</span>
          <span>Chính sách bảo mật</span>
          <span>·</span>
          <span>© 2026 CommerceOS</span>
        </div>
      </div>
    </footer>
  );
}
