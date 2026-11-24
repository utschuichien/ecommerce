'use client';

import React from 'react';
import {
  Truck,
  ShieldCheck,
  Headphones,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { CatalogProductCard } from '../catalog/CatalogProductCard';
import HeroBanner from '../common/HeroBanner';
import { HomeFeaturedCategories } from './HomeFeaturedCategories';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalog';
import { useAddToCart } from '@/features/cart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { extractErrorMessage } from '../../lib/api-client';

interface HomeViewProps {
  onSelectProduct: (product: any) => void;
  onNavigateToCatalog: () => void;
  onAddToCart?: (product: any) => void;
}

export function HomeView({
  onSelectProduct,
  onNavigateToCatalog,
  onAddToCart,
}: HomeViewProps) {
  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();

  // Lấy danh sách sản phẩm thực tế từ API Catalog
  const { data: productsData, isLoading } = useCatalogProducts({
    limit: 10,
    sort: 'popular',
  });

  const products = productsData?.data || [];

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }

    addToCartMutation.mutate(
      {
        variantId: product.variants?.[0]?.id || product.variantId,
        productSlug: product.slug || product.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast.success('Đã thêm vào giỏ hàng', {
            description: product.name,
          });
          onAddToCart?.(product);
        },
        onError: (err) => {
          toast.error('Thêm vào giỏ thất bại', {
            description: extractErrorMessage(err, 'Không thể thêm sản phẩm vào giỏ hàng.'),
          });
        },
      }
    );
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner Section */}
      <HeroBanner />

      {/* 2. Danh mục nổi bật (Component riêng biệt) */}
      <HomeFeaturedCategories onNavigateToCatalog={onNavigateToCatalog} />

      {/* 3. Sản phẩm nổi bật (Dữ liệu thực từ API) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Sản phẩm nổi bật
          </h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100/80 rounded-2xl p-3 space-y-3 animate-pulse"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-xl" />
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-4/5 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3.5">
            {products.map((prod) => (
              <CatalogProductCard
                key={prod.id}
                product={prod as any}
                onSelect={onSelectProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Two Promo Banners Side by Side */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  {/* Banner 1: Tai nghe (xanh mint) */}
  <div className="relative min-h-[200px] sm:min-h-[220px] overflow-hidden rounded-xl bg-gradient-to-br from-[#e9f5ef] to-[#f1f8f5] flex flex-col sm:block">
    <div className="sm:absolute sm:inset-y-0 sm:left-0 flex sm:w-[44%] items-center justify-center p-4 pb-0 sm:pb-4">
      <img
        src="data:image/jpeg;base64,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"
        alt="Tai nghe cao cấp"
        className="h-36 sm:h-full sm:max-h-[200px] w-full object-contain mix-blend-multiply transition duration-300 hover:scale-105"
      />
    </div>

    <div className="relative z-10 sm:ml-[44%] flex sm:min-h-[220px] flex-col justify-center gap-1.5 sm:gap-2 px-5 py-5 sm:pl-2 sm:pr-6">
      <span className="text-xs font-semibold text-emerald-700">Ưu đãi giới hạn</span>
      <h3 className="text-lg sm:text-xl font-bold leading-snug text-gray-900">
        Giảm đến 40%
        <span className="block">cho tai nghe cao cấp</span>
      </h3>
      <p className="max-w-sm text-xs sm:text-sm text-gray-600">
        Trải nghiệm âm thanh tuyệt vời với các thương hiệu hàng đầu.
      </p>
      <div className="pt-1.5">
        <button
          onClick={onNavigateToCatalog}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 active:scale-95"
        >
          <span>Mua ngay</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>

  {/* Banner 2: Apple Watch (kem đào) */}
  <div className="relative min-h-[200px] sm:min-h-[220px] overflow-hidden rounded-xl bg-gradient-to-br from-[#fdf3ea] to-[#fbf7f2]">
    {/* Ảnh nền bên phải, mờ dần sang trái */}
    <div className="absolute inset-y-0 right-0 w-full md:w-[65%]">
      <img
        src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&auto=format&fit=crop&q=80"
        alt="Apple Watch Series 9"
        className="h-full w-full object-cover object-right"
      />
      <div className="absolute inset-0 bg-[#fdf3ea]/85 md:bg-transparent md:bg-gradient-to-r md:from-[#fdf3ea] md:via-[#fdf3ea]/30 md:to-transparent" />
    </div>

    <div className="relative z-10 flex min-h-[200px] sm:min-h-[220px] flex-col justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-5 sm:py-6 md:max-w-[55%]">
      <span className="text-xs font-semibold text-amber-800">Sản phẩm mới</span>
      <h3 className="text-lg sm:text-xl font-bold leading-snug text-gray-900">
        Apple Watch Series 9
      </h3>
      <p className="max-w-[240px] text-xs sm:text-sm text-gray-600">
        Thiết kế tinh tế, hiệu năng vượt trội, đồng hành cùng bạn mỗi ngày.
      </p>
      <div className="pt-1.5">
        <button
          onClick={onNavigateToCatalog}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-4 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-50 active:scale-95"
        >
          <span>Khám phá</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</section>

      {/* 5. Vì sao chọn CommerceOS? */}
      <section className="space-y-4 pt-2 sm:pt-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Vì sao chọn CommerceOS?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Sản phẩm chính hãng */}
          <div className="flex items-start gap-3 p-4 sm:p-5 bg-white rounded-xl border border-gray-100/80 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Sản phẩm chính hãng</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Tất cả sản phẩm đều được kiểm duyệt và có nguồn gốc rõ ràng.
              </p>
            </div>
          </div>

          {/* 2. Giao hàng nhanh */}
          <div className="flex items-start gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Giao hàng nhanh</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Giao hàng toàn quốc, hỗ trợ theo dõi đơn hàng trực tuyến.
              </p>
            </div>
          </div>

          {/* 3. Hỗ trợ tận tâm */}
          <div className="flex items-start gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <Headphones className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Hỗ trợ tận tâm</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Đội ngũ chăm sóc khách hàng 24/7, sẵn sàng giải đáp mọi thắc mắc.
              </p>
            </div>
          </div>

          {/* 4. Đổi trả dễ dàng */}
          <div className="flex items-start gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-0.5">Đổi trả dễ dàng</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Chính sách đổi trả linh hoạt trong vòng 7 ngày.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
