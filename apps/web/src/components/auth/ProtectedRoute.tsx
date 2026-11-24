'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AUTH_QUERY_KEYS } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { sellerProductsApi } from '@/features/seller';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Store, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoadingUser } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isActivatingSeller, setIsActivatingSeller] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isLoadingUser && !isAuthenticated) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const fullUrl = `${pathname}${search}`;
      router.replace(`/login?redirect=${encodeURIComponent(fullUrl)}`);
    }
  }, [isHydrated, isLoadingUser, isAuthenticated, pathname, router]);

  // Đang hydrate hoặc đang tải thông tin user
  if (!isHydrated || isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin stroke-[2]" />
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  // =========================================================================
  // KIỂM TRA PHÂN QUYỀN VAI TRÒ (RBAC)
  // =========================================================================
  const userRoles: string[] = user?.roles || [];
  const hasRequiredRole =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRequiredRole) {
    const handleActivateSeller = async () => {
      try {
        setIsActivatingSeller(true);
        const res = await sellerProductsApi.registerSeller();
        if (user) {
          const updatedUser = {
            ...user,
            roles: res.roles || [...userRoles, 'SELLER'],
          };
          setUser(updatedUser);
          queryClient.setQueryData(AUTH_QUERY_KEYS.ME, updatedUser);
        }
        toast.success('Kích hoạt thành công', {
          description: res.message || 'Bạn đã trở thành người bán trên CommerceOS.',
        });
      } catch (err: any) {
        toast.error('Kích hoạt thất bại', {
          description: err?.response?.data?.message || 'Không thể kích hoạt kênh người bán.',
        });
      } finally {
        setIsActivatingSeller(false);
      }
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-gray-50/50">
        <div className="bg-white border border-gray-100 rounded-2xl max-w-md w-full p-6 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Store className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-gray-900">
              Kênh Dành Riêng Cho Người Bán
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed px-2">
              Tài khoản của bạn hiện tại chưa được kích hoạt quyền Người bán (SELLER).
              Kênh này chỉ dành riêng cho chủ cửa hàng để đăng bán và quản lý sản phẩm.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleActivateSeller}
              disabled={isActivatingSeller}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isActivatingSeller ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Store className="w-4 h-4" />
              )}
              <span>Kích hoạt Kênh Người Bán</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-2 px-4 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang chủ mua sắm</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
