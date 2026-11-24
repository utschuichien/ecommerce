'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ProductFilterSidebar, FilterState } from './ProductFilterSidebar';
import { ProductSortBar, SortOption, ViewMode } from './ProductSortBar';
import { CatalogProductCard } from './CatalogProductCard';
import { Pagination } from '../common/Pagination';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalog';
import { useAddToCart } from '@/features/cart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { extractErrorMessage } from '@/lib/api-client';
import { Loader2, PackageOpen, RotateCcw } from 'lucide-react';

interface CatalogViewProps {
  onSelectProduct?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

export function CatalogView({ onSelectProduct, onAddToCart }: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Danh sách các giá trị hợp lệ cho các trường cố định
  const VALID_SORTS: SortOption[] = ['popular', 'newest', 'price_asc', 'price_desc', 'bestseller'];
  const VALID_STOCKS = ['all', 'in_stock', 'out_of_stock'] as const;

  // Đọc thô các query params từ URL
  const rawSort = searchParams.get('sort');
  const rawStock = searchParams.get('stock');
  const rawPage = searchParams.get('page');
  const rawMinPrice = searchParams.get('minPrice');
  const rawMaxPrice = searchParams.get('maxPrice');

  // Phương án 1: Tự động kiểm tra tính hợp lệ & fallback về mặc định
  const sortFromUrl: SortOption = VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'popular';

  const stockFromUrl: 'all' | 'in_stock' | 'out_of_stock' = VALID_STOCKS.includes(rawStock as any)
    ? (rawStock as any)
    : 'all';

  let pageFromUrl = parseInt(rawPage || '1', 10);
  if (isNaN(pageFromUrl) || pageFromUrl < 1) {
    pageFromUrl = 1;
  }

  let minPriceFromUrl = Number(rawMinPrice) || 0;
  if (isNaN(minPriceFromUrl) || minPriceFromUrl < 0) {
    minPriceFromUrl = 0;
  }

  let maxPriceFromUrl = Number(rawMaxPrice) || 50000000;
  if (isNaN(maxPriceFromUrl) || maxPriceFromUrl < 0) {
    maxPriceFromUrl = 50000000;
  }

  if (minPriceFromUrl > maxPriceFromUrl) {
    const temp = minPriceFromUrl;
    minPriceFromUrl = maxPriceFromUrl;
    maxPriceFromUrl = temp;
  }

  const categoryFromUrl = searchParams.get('category') || 'all';
  const brandsFromUrl = searchParams.get('brands')
    ? searchParams.get('brands')!.split(',').filter(Boolean)
    : [];
  const searchFromUrl = searchParams.get('search') || '';

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tự động làm sạch URL nếu phát hiện người dùng nhập param sai/rác
  useEffect(() => {
    let hasInvalidParam = false;
    const cleanParams = new URLSearchParams(searchParams.toString());

    if (rawSort && !VALID_SORTS.includes(rawSort as SortOption)) {
      cleanParams.delete('sort');
      hasInvalidParam = true;
    }
    if (rawStock && !VALID_STOCKS.includes(rawStock as any)) {
      cleanParams.delete('stock');
      hasInvalidParam = true;
    }
    if (rawPage && (isNaN(Number(rawPage)) || Number(rawPage) < 1)) {
      cleanParams.delete('page');
      hasInvalidParam = true;
    }
    if (rawMinPrice && (isNaN(Number(rawMinPrice)) || Number(rawMinPrice) < 0)) {
      cleanParams.delete('minPrice');
      hasInvalidParam = true;
    }
    if (rawMaxPrice && (isNaN(Number(rawMaxPrice)) || Number(rawMaxPrice) < 0)) {
      cleanParams.delete('maxPrice');
      hasInvalidParam = true;
    }

    if (hasInvalidParam) {
      const newQuery = cleanParams.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, rawSort, rawStock, rawPage, rawMinPrice, rawMaxPrice]);

  // FilterState cấu hình theo URL
  const filters: FilterState = useMemo(
    () => ({
      category: categoryFromUrl,
      brands: brandsFromUrl,
      minPrice: minPriceFromUrl,
      maxPrice: maxPriceFromUrl,
      stock: stockFromUrl,
    }),
    [categoryFromUrl, brandsFromUrl.join(','), minPriceFromUrl, maxPriceFromUrl, stockFromUrl],
  );

  // Truy vấn sản phẩm từ API Catalog động
  const { data: catalogResponse, isLoading, isFetching } = useCatalogProducts({
    category: categoryFromUrl,
    brands: brandsFromUrl.join(','),
    minPrice: minPriceFromUrl,
    maxPrice: maxPriceFromUrl,
    stock: stockFromUrl,
    sort: sortFromUrl,
    page: pageFromUrl,
    search: searchFromUrl,
    limit: 12,
  });

  const products = catalogResponse?.data || [];
  const pagination = catalogResponse?.pagination || {
    total: products.length,
    page: pageFromUrl,
    limit: 12,
    totalPages: Math.max(1, Math.ceil(products.length / 12)),
  };

  // Đồng bộ URL khi người dùng thay đổi bộ lọc ở Sidebar
  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    // Cập nhật category
    if (newFilters.category && newFilters.category !== 'all') {
      params.set('category', newFilters.category);
    } else {
      params.delete('category');
    }

    // Cập nhật brands
    if (newFilters.brands.length > 0) {
      params.set('brands', newFilters.brands.join(','));
    } else {
      params.delete('brands');
    }

    // Cập nhật khoảng giá
    if (newFilters.minPrice > 0) {
      params.set('minPrice', newFilters.minPrice.toString());
    } else {
      params.delete('minPrice');
    }
    if (newFilters.maxPrice < 50000000) {
      params.set('maxPrice', newFilters.maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    // Cập nhật tình trạng kho
    if (newFilters.stock !== 'all') {
      params.set('stock', newFilters.stock);
    } else {
      params.delete('stock');
    }

    // Luôn reset về page 1 khi thay đổi điều kiện lọc
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Đồng bộ URL khi chuyển trang
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Đồng bộ URL khi thay đổi kiểu sắp xếp
  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { isAuthenticated } = useAuth();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }

    addToCartMutation.mutate(
      {
        productSlug: product.slug,
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

  // Đếm số lượng bộ lọc đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryFromUrl !== 'all') count += 1;
    if (maxPriceFromUrl < 50000000 || minPriceFromUrl > 0) count += 1;
    if (brandsFromUrl.length > 0) count += brandsFromUrl.length;
    if (stockFromUrl !== 'all') count += 1;
    return count;
  }, [categoryFromUrl, maxPriceFromUrl, minPriceFromUrl, brandsFromUrl, stockFromUrl]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Sản phẩm' }]} />

      {/* 2. Tiêu đề trang */}
      <div className="space-y-1 pb-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight">
            Tất cả sản phẩm
          </h1>
          {isFetching && (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
          Khám phá các sản phẩm công nghệ và đời sống chính hãng với mức giá tốt nhất trên CommerceOS.
        </p>
      </div>

      {/* 3. Bố cục Catalog chính */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Sidebar Bộ lọc (Danh mục động & Thương hiệu động từ DB) */}
        <ProductFilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Khu vực hiển thị sản phẩm */}
        <div className="flex-1 w-full space-y-5">
          {/* Thanh Sắp xếp & Chế độ xem */}
          <ProductSortBar
            totalCount={pagination.total}
            sortBy={sortFromUrl}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {/* Grid / List Sản phẩm */}
          {(!mounted || isLoading) ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4'
                  : 'space-y-3'
              }
            >
              {Array.from({ length: 10 }).map((_, i) =>
                viewMode === 'grid' ? (
                  <div
                    key={i}
                    className="bg-white border border-[#E8EEF0] rounded-[18px] overflow-hidden animate-pulse"
                  >
                    {/* Ảnh thumbnail skeleton tràn 3 viền */}
                    <div className="w-full aspect-square bg-gray-100" />

                    <div className="p-2.5 sm:p-3 space-y-2">
                      {/* Thương hiệu & đánh giá skeleton */}
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="h-3 w-16 bg-gray-100 rounded" />
                        <div className="h-3 w-12 bg-gray-100 rounded" />
                      </div>

                      {/* Tên sản phẩm skeleton */}
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-full bg-gray-200 rounded" />
                        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                      </div>

                      {/* Giá và nút mua skeleton */}
                      <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                          <div className="h-2.5 w-16 bg-gray-100 rounded" />
                        </div>
                        <div className="h-8 w-8 rounded-md bg-gray-100 shrink-0" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-lg p-3.5 flex flex-col sm:flex-row items-center gap-4 animate-pulse"
                  >
                    <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 bg-gray-100 rounded-md" />
                    <div className="flex-1 min-w-0 space-y-2.5 w-full py-1">
                      <div className="h-3 w-28 bg-gray-100 rounded" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded" />
                      <div className="h-5 w-32 bg-gray-200 rounded pt-1" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : products.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4'
                  : 'space-y-3'
              }
            >
              {products.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product as any}
                  viewMode={viewMode}
                  onSelect={onSelectProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            /* Trạng thái khi không có sản phẩm */
            <div className="bg-white border border-gray-100 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
  <div className="absolute inset-0 bg-emerald-100/60 rounded-xl rotate-6" />
  <div className="relative w-8 h-8 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl flex items-center justify-center shadow-xs">
    <PackageOpen className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
  </div>
</div>

<div className="space-y-1 max-w-md mx-auto">
  <h3 className="text-xs sm:text-base font-bold text-gray-900 tracking-tight">
    {activeFilterCount > 0
      ? 'Không tìm thấy sản phẩm phù hợp'
      : 'Cửa hàng đang cập nhật sản phẩm'}
  </h3>
  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
    {activeFilterCount > 0
      ? 'Hãy thử điều chỉnh lại bộ lọc, nới rộng khoảng giá hoặc chọn thương hiệu khác để tìm kiếm sản phẩm.'
      : 'Hiện tại chưa có sản phẩm nào được bày bán trong danh mục này. Bạn hãy quay lại sau nhé!'}
  </p>
</div>
              {activeFilterCount > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleFilterChange({
                        category: 'all',
                        minPrice: 0,
                        maxPrice: 50000000,
                        brands: [],
                        stock: 'all',
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa tất cả bộ lọc</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phân trang (Hiển thị page trên URL, tự động phân trang theo 12 sản phẩm/trang) */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            limit={12}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
