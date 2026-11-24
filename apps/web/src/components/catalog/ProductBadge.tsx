'use client';

import React from 'react';

export type ProductBadgeColor = 'green' | 'red' | 'blue';

export interface ProductBadgeProps {
  badge?: string;
  badgeColor?: ProductBadgeColor;
  className?: string;
}

export function ProductBadge({
  badge,
  badgeColor,
  className = '',
}: ProductBadgeProps) {
  if (!badge) return null;

  let colorClass = 'bg-emerald-600 text-white';
  if (badge === 'Giảm giá' || badgeColor === 'red') {
    colorClass = 'bg-rose-500 text-white';
  } else if (
    badge === 'Mới' ||
    badge.includes('Bán chạy') ||
    badgeColor === 'green'
  ) {
    colorClass = 'bg-emerald-600 text-white';
  } else if (badgeColor === 'blue') {
    colorClass = 'bg-sky-500 text-white';
  }

  const hasFlame = badge.includes('Bán chạy') && !badge.includes('🔥');

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2.5 h-[22px] text-[11px] font-semibold tracking-wide rounded-full shadow-2xs select-none leading-none transition-all ${colorClass} ${className}`}
    >
      {hasFlame && <span className="text-xs leading-none">🔥</span>}
      <span>{badge}</span>
    </span>
  );
}
