'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { DEFAULT_CUSTOMER_AVATAR } from '@/constants/default-images';

export const DEFAULT_AVATAR_URL = DEFAULT_CUSTOMER_AVATAR;

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  alt?: string;
  defaultSrc?: string;
  isLoading?: boolean;
}

const SIZE_MAP: Record<
  AvatarSize,
  {
    container: string;
    text: string;
    icon: string;
    dot: string;
  }
> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px] font-bold',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5 border',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs font-bold tracking-tight',
    icon: 'w-4 h-4',
    dot: 'w-2 h-2 bottom-0 right-0 border-2',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm font-bold',
    icon: 'w-5 h-5',
    dot: 'w-2.5 h-2.5 bottom-0 right-0 border-2',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base font-bold',
    icon: 'w-6 h-6',
    dot: 'w-3 h-3 bottom-0.5 right-0.5 border-2',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-xl font-bold',
    icon: 'w-7 h-7',
    dot: 'w-3.5 h-3.5 bottom-1 right-1 border-2',
  },
  '2xl': {
    container: 'w-20 h-20 sm:w-24 sm:h-24',
    text: 'text-2xl sm:text-3xl font-bold tracking-tight',
    icon: 'w-10 h-10',
    dot: 'w-4 h-4 bottom-1 right-1 border-2',
  },
};

function getInitials(name?: string | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng (ví dụ: Nguyễn Văn A -> NA)
  const first = words[0][0];
  const last = words[words.length - 1][0];
  return `${first}${last}`.toUpperCase();
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = true,
  alt,
  defaultSrc = DEFAULT_AVATAR_URL,
  isLoading = false,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size];
  const initials = getInitials(name);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (isLoading) {
    return (
      <div
        className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full ${sizeConfig.container} ${className}`}
        aria-hidden="true"
      >
        <div className="w-full h-full rounded-full bg-gray-200/90 animate-pulse ring-2 ring-emerald-500/15 border border-white/80" />
      </div>
    );
  }

  // Ưu tiên ảnh src người dùng tải lên, nếu chưa upload ảnh thì dùng link ảnh mặc định
  const effectiveSrc = src && src.trim() ? src : defaultSrc;
  const showImage = Boolean(effectiveSrc && !hasError);

  return (
    <div
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full ${sizeConfig.container} ${className}`}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden shadow-xs ring-2 ring-emerald-500/15 border border-white/80 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center">
        {showImage ? (
          <img
            src={effectiveSrc!}
            alt={alt || name || 'Ảnh đại diện người dùng'}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition duration-300"
          />
        ) : initials ? (
          <span className={`${sizeConfig.text} uppercase drop-shadow-xs`}>
            {initials}
          </span>
        ) : (
          <User className={`${sizeConfig.icon} text-white/90`} strokeWidth={2} />
        )}
      </div>

      {showOnlineStatus && (
        <span
          className={`absolute rounded-full border-white ${sizeConfig.dot} ${
            isOnline ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
          title={isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
        />
      )}
    </div>
  );
}
