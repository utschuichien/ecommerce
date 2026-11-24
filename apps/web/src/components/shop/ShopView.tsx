'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ShopHeader } from './ShopHeader';
import { ShopNavTabs } from './ShopNavTabs';
import { ShopHomeTab } from './ShopHomeTab';
import { ShopProductsTab } from './ShopProductsTab';
import { ShopReviewsTab } from './ShopReviewsTab';
import { ShopPoliciesTab } from './ShopPoliciesTab';
import {
  ShopInfo,
  ShopProduct,
  ShopTabType,
  ShopVoucher,
} from './shop-types';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAddToCart } from '@/features/cart';
import { extractErrorMessage } from '@/lib/api-client';
import {
  usePublicShop,
  usePublicShopProducts,
  usePublicShopVouchers,
} from '@/features/shops';
import { ArrowLeft, Compass, Loader2, Store, X } from 'lucide-react';

interface ShopViewProps {
  shopSlug?: string;
}

export function ShopView({ shopSlug = '' }: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<ShopTabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFollowed, setIsFollowed] = useState(false);
  const [savedVouchers, setSavedVouchers] = useState<Record<string, boolean>>({});

  // 1. Lấy thông tin Shop thực tế từ API Backend
  const {
    data: shopProfile,
    isLoading: isShopLoading,
    error: shopError,
  } = usePublicShop(shopSlug);

  // 2. Lấy danh sách sản phẩm thuộc Shop với các tham số Type-Safe
  const productTabParam =
    activeTab === 'bestseller'
      ? 'bestseller'
      : activeTab === 'promotions'
      ? 'promotions'
      : 'all';

  const { data: productsData, isLoading: isProductsLoading } = usePublicShopProducts(
    shopSlug,
    {
      tab: productTabParam,
      limit: 50,
    },
  );

  // 3. Lấy danh sách mã giảm giá khả dụng của Shop
  const { data: rawVouchers } = usePublicShopVouchers(shopSlug);

  const productItems: ShopProduct[] = Array.isArray(productsData?.items)
    ? productsData.items
    : Array.isArray((productsData as any)?.data?.items)
    ? (productsData as any).data.items
    : [];

  const categories = Array.isArray(productsData?.categories)
    ? productsData.categories
    : Array.isArray((productsData as any)?.data?.categories)
    ? (productsData as any).data.categories
    : [];

  // Map voucher thực tế từ API
  const vouchers: ShopVoucher[] = React.useMemo(() => {
    const list = Array.isArray(rawVouchers)
      ? rawVouchers
      : Array.isArray((rawVouchers as any)?.data)
      ? (rawVouchers as any).data
      : [];
    if (!list || list.length === 0) return [];
    return list.map((v: any) => {
      let discountText = '';
      if (v.type === 'PERCENTAGE') {
        discountText = `Giảm ${v.discountValue}%`;
        if (v.maxDiscountAmount) {
          discountText += ` (Tối đa ${Number(v.maxDiscountAmount).toLocaleString('vi-VN')}đ)`;
        }
      } else if (v.type === 'FREE_SHIPPING') {
        discountText = 'Miễn phí vận chuyển';
      } else {
        discountText = `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}₫`;
      }

      const minSpendText =
        v.minOrderValue > 0
          ? `Đơn từ ${Number(v.minOrderValue).toLocaleString('vi-VN')}₫`
          : 'Áp dụng cho mọi đơn';
      const expiryDate = new Date(v.endDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });

      return {
        id: v.id,
        code: v.code,
        discountText,
        minSpendText,
        expiryText: `HSD ${expiryDate}`,
        type: v.type === 'FREE_SHIPPING' ? 'shipping' : 'discount',
      };
    });
  }, [rawVouchers]);

  const handleToggleFollow = () => {
    setIsFollowed((prev) => !prev);
    if (!isFollowed) {
      toast.success('Đã theo dõi gian hàng');
    } else {
      toast.info('Đã hủy theo dõi');
    }
  };

  const handleSaveVoucher = (id: string) => {
    setSavedVouchers((prev) => ({ ...prev, [id]: true }));
    toast.success('Đã lưu mã giảm giá', {
      description: 'Mã đã được lưu vào ví voucher của bạn.',
    });
  };

  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (product: ShopProduct) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }

    addToCartMutation.mutate(
      {
        productSlug: product.slug || product.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast.success('Đã thêm vào giỏ hàng', {
            description: product.name,
          });
        },
        onError: (err) => {
          toast.error('Thêm vào giỏ thất bại', {
            description: extractErrorMessage(err, 'Không thể thêm sản phẩm vào giỏ hàng.'),
          });
        },
      },
    );
  };

  // Đang tải thông tin gian hàng
  if (isShopLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-gray-500">Đang tải thông tin gian hàng...</p>
      </div>
    );
  }

  // Không tìm thấy gian hàng (Empty State chuẩn mực đồng bộ toàn sàn)
  if (shopError || !shopProfile) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-4 pb-12">
        {/* 1. Breadcrumbs đồng bộ */}
        <Breadcrumbs
          items={[
            { label: 'Gian hàng', href: '/products' },
            { label: 'Không tìm thấy gian hàng' },
          ]}
        />

        {/* 2. Khung thông báo full-width chuẩn như trang Chi tiết đơn hàng */}
        <div className="w-full bg-white border border-gray-200/70 rounded-2xl py-14 sm:py-16 px-6 text-center flex flex-col items-center justify-center gap-3.5 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <Store className="w-6 h-6" strokeWidth={1.8} />
          </div>

          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Không tìm thấy gian hàng
            </h2>
            <p className="text-xs sm:text-[13px] text-gray-500 max-w-md mx-auto leading-relaxed">
              Gian hàng này không tồn tại hoặc đã tạm dừng hoạt động trên sàn. Vui lòng kiểm tra lại đường dẫn hoặc khám phá các sản phẩm khác.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Khám phá sản phẩm khác</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200/80 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 text-xs font-semibold rounded-xl transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shop: ShopInfo = shopProfile;
  const products: ShopProduct[] = productItems;

  return (
    <div className="max-w-[1200px] mx-auto space-y-4 pb-12">
      {/* 1. Breadcrumbs đồng bộ */}
      <Breadcrumbs
        items={[
          { label: 'Gian hàng', href: '/products' },
          { label: shop.name },
        ]}
      />

      {/* 2. CỤM HERO BANNER, PROFILE HEADER, VALUE PROPS & NAV TABS CHUẨN MẪU THIẾT KẾ MỚI */}
      <div className="space-y-4">
        <ShopHeader
          shop={shop}
          isFollowed={isFollowed}
          onToggleFollow={handleToggleFollow}
          onOpenChat={() =>
            toast.info('Hỗ trợ trực tuyến', {
              description: `Đang kết nối tới nhân viên tư vấn của ${shop.name}...`,
            })
          }
        />

        <ShopNavTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          productsCount={shop.productsCount || products.length}
          reviewsCount={shop.reviewsCount}
        />
      </div>

      {/* 3. NỘI DUNG TƯƠNG ỨNG THEO TAB */}
      <main className="pt-2 sm:pt-4">
        {activeTab === 'home' && (
          <ShopHomeTab
            products={products}
            shop={shop}
            vouchers={vouchers}
            savedVouchers={savedVouchers}
            onSaveVoucher={handleSaveVoucher}
            onAddToCart={handleAddToCart}
            onViewAllProducts={() => setActiveTab('products')}
          />
        )}

        {activeTab === 'products' && (
          <ShopProductsTab
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'bestseller' && (
          <ShopProductsTab
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            initialSortBy="bestseller"
          />
        )}

        {activeTab === 'reviews' && (
          <ShopReviewsTab
            ratingScore={shop.ratingScore}
            reviewsCount={shop.reviewsCount}
            reviews={[]}
            shopName={shop.name}
          />
        )}

        {activeTab === 'policies' && (
          <ShopPoliciesTab shop={shop} />
        )}
      </main>
    </div>
  );
}
