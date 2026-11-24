'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PackageOpen, ArrowRight, LogIn, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { CartShopGroupData } from './cart-types';
import { CartShopGroup } from './CartShopGroup';
import { CartOrderSummary } from './CartOrderSummary';
import { Checkbox } from '../ui/checkbox';
import { Breadcrumbs } from '../common/Breadcrumbs';
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
  useClearCart,
  useToggleCartItemSelection,
  useToggleSelectAllCart,
} from '../../features/cart';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { extractErrorMessage } from '../../lib/api-client';

export function CartView() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch,
  } = useCart();

  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const toggleSelectionMutation = useToggleCartItemSelection();
  const toggleSelectAllMutation = useToggleSelectAllCart();

  // Dữ liệu shop và item từ API (trạng thái selected đã được lưu trong DB)
  const shops: CartShopGroupData[] = useMemo(() => cartData?.shops ?? [], [cartData?.shops]);

  // Danh sách toàn bộ item
  const allItems = useMemo(() => shops.flatMap((s) => s.items), [shops]);
  const totalItemsCount = allItems.length;
  const totalQuantity = cartData?.totalQuantity ?? allItems.reduce((sum, it) => sum + it.quantity, 0);

  // Số lượng sản phẩm đang được chọn
  const selectedItems = useMemo(
    () => allItems.filter((it) => it.selected),
    [allItems]
  );
  const selectedCount = selectedItems.length;
  const isAllSelected = totalItemsCount > 0 && selectedCount === totalItemsCount;

  // Tính toán số tiền dựa trên dữ liệu chuẩn từ Backend (Backend chỉ tính cho các món isSelected)
  const originalTotal = cartData?.summary?.originalTotal ?? 0;
  const finalTotal = cartData?.summary?.finalTotal ?? 0;
  const productDiscount = cartData?.summary?.productDiscount ?? 0;

  // Đếm số shop có sản phẩm được chọn
  const activeShopCount = useMemo(() => {
    return shops.filter((s) => s.items.some((it) => it.selected)).length;
  }, [shops]);

  // Xử lý Chọn tất cả / Bỏ chọn tất cả (Đồng bộ DB)
  const handleToggleSelectAll = () => {
    toggleSelectAllMutation.mutate({ selected: !isAllSelected });
  };

  // Xử lý Chọn / Bỏ chọn theo Shop (Đồng bộ DB)
  const handleToggleShop = (shopId: string) => {
    const shop = shops.find((s) => s.shopId === shopId);
    if (!shop) return;
    const allChecked = shop.items.every((it) => it.selected);
    toggleSelectAllMutation.mutate({ selected: !allChecked, shopId });
  };

  // Xử lý Chọn / Bỏ chọn từng sản phẩm (Đồng bộ DB)
  const handleToggleItem = (itemId: string) => {
    const item = allItems.find((it) => it.id === itemId);
    if (!item) return;
    toggleSelectionMutation.mutate({ variantId: itemId, selected: !item.selected });
  };

  // Thay đổi số lượng sản phẩm qua API
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    updateQuantityMutation.mutate(
      { variantId: itemId, quantity: newQty },
      {
        onError: (err) => {
          toast.error('Cập nhật thất bại', {
            description: extractErrorMessage(err, 'Không thể cập nhật số lượng sản phẩm.'),
          });
        },
      }
    );
  };

  // Xóa 1 sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId, {
      onSuccess: () => {
        toast.success('Đã xóa khỏi giỏ hàng', {
          description: 'Sản phẩm đã được xóa khỏi giỏ của bạn.',
        });
      },
      onError: (err) => {
        toast.error('Xóa sản phẩm thất bại', {
          description: extractErrorMessage(err, 'Không thể xóa sản phẩm khỏi giỏ.'),
        });
      },
    });
  };

  // Xóa tất cả các sản phẩm đang được chọn
  const handleRemoveSelected = async () => {
    if (selectedCount === 0) return;

    if (selectedCount === totalItemsCount) {
      clearCartMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success('Đã làm trống giỏ hàng', {
            description: 'Toàn bộ sản phẩm đã được xóa.',
          });
        },
        onError: (err) => {
          toast.error('Lỗi thao tác', {
            description: extractErrorMessage(err, 'Không thể làm trống giỏ hàng.'),
          });
        },
      });
      return;
    }

    // Xóa lần lượt các item được chọn
    try {
      await Promise.all(
        selectedItems.map((item) => removeItemMutation.mutateAsync(item.id))
      );
      toast.success('Đã xóa các sản phẩm chọn', {
        description: `Đã loại bỏ ${selectedCount} sản phẩm khỏi giỏ hàng.`,
      });
    } catch (err) {
      toast.error('Lỗi khi xóa', {
        description: extractErrorMessage(err, 'Có lỗi khi xóa một số sản phẩm.'),
      });
    }
  };

  // Tiến hành thanh toán
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập tài khoản để thanh toán mua hàng.',
      });
      return;
    }
    if (selectedCount === 0) {
      toast.warning('Chưa chọn sản phẩm', {
        description: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
      });
      return;
    }
    router.push('/checkout');
  };

  // Nếu chưa đăng nhập
  if (mounted && !isAuthenticated) {
    return (
      <div className="space-y-6 pb-20">
        <Breadcrumbs items={[{ label: 'Giỏ hàng' }]} />
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-gray-950">
            Đăng nhập để xem giỏ hàng của bạn
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Đăng nhập tài khoản để quản lý các sản phẩm đã thêm, đồng bộ đơn hàng trên mọi thiết bị và nhận nhiều voucher ưu đãi hấp dẫn.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/login?redirect=/cart"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-md transition shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập ngay</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-5 py-2.5 rounded-md transition cursor-pointer"
            >
              <span>Dạo xem sản phẩm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Đang tải dữ liệu (Loading Skeleton)
  if (!mounted || isCartLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Breadcrumbs items={[{ label: 'Giỏ hàng' }]} />
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-12 bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
          </div>
          <div className="lg:col-span-4 w-full">
            <div className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái giỏ hàng trống (Empty State)
  if (totalItemsCount === 0) {
    return (
      <div className="space-y-6 pb-20">
  <Breadcrumbs items={[{ label: 'Giỏ hàng' }]} />
 
  <div className="py-12 sm:py-14 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
      <PackageOpen className="w-8 h-8 stroke-[1.5]" />
    </div>
 
    <h2 className="text-base font-semibold text-gray-900">Giỏ hàng của bạn đang trống</h2>
 
    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
      Hãy khám phá các sản phẩm công nghệ và phụ kiện chính hãng với ưu đãi tốt nhất.
    </p>
 
    <Link
      href="/products"
      className="mt-5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition active:scale-95 cursor-pointer"
    >
      <span>Khám phá sản phẩm</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>
</div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs items={[{ label: 'Giỏ hàng' }]} />

      {/* 2. Tiêu đề trang Giỏ hàng */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Giỏ hàng{' '}
          <span className="text-sm font-normal text-gray-500">
            ({totalQuantity} sản phẩm)
          </span>
        </h1>
      </div>

      {/* 3. Bố cục 2 cột (Cột trái: Danh sách sản phẩm theo Shop, Cột phải: Tóm tắt đơn hàng) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        {/* CỘT TRÁI (8 cột) */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          {/* Thanh chọn tất cả & Xóa đã chọn (Top Control Bar) */}
          <div className="bg-white rounded-2xl py-3 px-4 sm:px-5 shadow-2xs border border-gray-100/80 flex flex-wrap items-center justify-between gap-2">
            {/* Chọn tất cả */}
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleToggleSelectAll}
              label={`Chọn tất cả (${totalItemsCount})`}
            />

            {/* Nút Xóa đã chọn */}
            <button
              type="button"
              onClick={handleRemoveSelected}
              disabled={selectedCount === 0 || removeItemMutation.isPending || clearCartMutation.isPending}
              className="text-xs text-gray-500 hover:text-rose-600 transition font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {removeItemMutation.isPending || clearCartMutation.isPending ? 'Đang xóa...' : 'Xóa đã chọn'}
            </button>
          </div>

          {/* Danh sách các Shop Groups */}
          <div className="space-y-4">
            {shops.map((shop) => (
              <CartShopGroup
                key={shop.shopId}
                group={shop}
                onToggleShop={handleToggleShop}
                onToggleItem={handleToggleItem}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {/* CỘT PHẢI (4 cột): Tóm tắt đơn hàng (Sticky Summary) */}
        <div className="lg:col-span-4 w-full">
          <CartOrderSummary
            selectedCount={selectedCount}
            totalQuantity={totalQuantity}
            shopCount={activeShopCount || shops.length}
            originalTotal={originalTotal}
            productDiscount={productDiscount}
            finalTotal={finalTotal}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
