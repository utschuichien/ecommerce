'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Tag,
  Search,
  RefreshCw,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminDropdown, AdminDropdownOption } from './AdminDropdown';
import {
  useAdminProducts,
  useUpdateProductStatus,
  useAdminOverview,
  useAdminCategories,
} from '@/features/admin';
import { formatVND } from '@/lib/api-client';

const PRODUCT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Đang hiển thị',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  HIDDEN: {
    label: 'Tạm ẩn / Đang khóa',
    className: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  DRAFT: {
    label: 'Bản nháp',
    className: 'bg-gray-100 text-gray-700 border border-gray-200/80',
  },
  ARCHIVED: {
    label: 'Đã lưu trữ',
    className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
};

export function AdminProductsTab() {
  const [subTab, setSubTab] = useState<'all' | 'categories' | 'featured'>('all');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusTargetProduct, setStatusTargetProduct] = useState<{
    id: string;
    name: string;
    shopName: string;
    nextStatus: 'ACTIVE' | 'HIDDEN';
  } | null>(null);

  // Debounce search 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: categories } = useAdminCategories();
  const { data: stats } = useAdminOverview('30');
  const topProducts = stats?.topProducts || [];

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminProducts({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
  });

  const updateStatusMutation = useUpdateProductStatus();

  const handleToggleStatus = (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    updateStatusMutation.mutate({ productId, status: newStatus });
  };

  const products = productsData?.items || [];
  const pagination = productsData?.pagination || { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

  return (
    <div className="space-y-4">
      {/* 1. Sub-nav Switcher */}
      <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'all'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Tất cả sản phẩm</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('categories')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Danh mục ngành hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('featured')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === 'featured'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sản phẩm nổi bật</span>
          </button>
        </div>

        <span className="text-[11px] text-gray-400">
          Tổng cộng: <strong>{pagination.totalItems || stats?.totalProducts || 0}</strong> sản phẩm toàn sàn
        </span>
      </div>

      {/* Subtab 1: Tất cả sản phẩm */}
      {subTab === 'all' && (
        <div className="space-y-4">
          {/* Bộ lọc & Tìm kiếm */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Ô tìm kiếm */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên, slug, hoặc tên gian hàng..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bộ lọc danh mục & Nút làm mới */}
              <div className="flex items-center gap-2">
                <AdminDropdown
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'Tất cả ngành hàng' },
                    ...(categories || []).map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })),
                  ]}
                  menuWidth="w-56"
                />

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200/60 text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            {/* Trạng thái sản phẩm */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs scrollbar-none">
              {[
                { key: 'ALL', label: 'Tất cả trạng thái' },
                { key: 'ACTIVE', label: 'Đang hiển thị' },
                { key: 'HIDDEN', label: 'Đang tạm ẩn' },
                { key: 'DRAFT', label: 'Bản nháp' },
              ].map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bảng danh sách sản phẩm */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                <span className="text-xs">Đang tải danh sách sản phẩm...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-xs">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Sản phẩm</th>
                      <th className="py-3 px-4">Gian hàng</th>
                      <th className="py-3 px-4">Ngành hàng</th>
                      <th className="py-3 px-4 text-right">Giá bán</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((prod) => {
                      const badge = PRODUCT_STATUS_LABELS[prod.status] || {
                        label: prod.status,
                        className: 'bg-gray-100 text-gray-700',
                      };
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <h4 className="font-semibold text-gray-900 truncate" title={prod.name}>
                                  {prod.name}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                                  ID: {prod.id} • {prod.variantsCount} phân loại
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 block truncate max-w-[150px]">
                              {prod.shop.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">@{prod.shop.slug}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-700">
                              {prod.category.name}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatVND(prod.minPrice)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setStatusTargetProduct({
                                    id: prod.id,
                                    name: prod.name,
                                    shopName: prod.shop.name,
                                    nextStatus: prod.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE',
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                title={prod.status === 'ACTIVE' ? 'Tạm ẩn sản phẩm khỏi sàn' : 'Hiển thị sản phẩm lại'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                                  prod.status === 'ACTIVE'
                                    ? 'border-rose-200/80 text-rose-700 bg-rose-50/50 hover:bg-rose-100/70'
                                    : 'border-emerald-200/80 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70'
                                }`}
                              >
                                {prod.status === 'ACTIVE' ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>Tạm ẩn</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Kích hoạt</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer căn giữa */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-center">
                <Pagination
                  page={page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={(p) => setPage(p)}
                  className="border-t-0 pt-0"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Danh mục ngành hàng */}
      {subTab === 'categories' && <AdminCategoriesTab />}

      {/* Subtab 3: Sản phẩm nổi bật */}
      {subTab === 'featured' && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-gray-950">Top Sản Phẩm Doanh Thu Cao</h3>
            <span className="text-[11px] text-gray-400">30 ngày qua</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">Chưa có dữ liệu sản phẩm</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 font-bold text-gray-400 text-center">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Shop: {prod.shopName} • Giá: {prod.formattedPrice || formatVND(prod.price ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-700 block text-xs">
                      {formatVND(prod.price * (prod.soldCount || 1))}
                    </span>
                    <span className="text-[10px] text-gray-400">Đã bán: {prod.soldCount ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Modal xác nhận Khóa/Ẩn/Mở sản phẩm - Dùng ConfirmDeleteModal dùng chung */}
      <ConfirmDeleteModal
        isOpen={!!statusTargetProduct}
        title={
          statusTargetProduct?.nextStatus === 'HIDDEN'
            ? 'Tạm ẩn sản phẩm khỏi sàn?'
            : 'Hiển thị lại sản phẩm?'
        }
        itemName={statusTargetProduct?.name}
        description={
          statusTargetProduct?.nextStatus === 'HIDDEN'
            ? 'Sản phẩm này sẽ bị tạm ẩn khỏi trang tìm kiếm và khách hàng sẽ tạm thời không thể đặt mua.'
            : 'Sản phẩm này sẽ được công khai hiển thị trở lại trên toàn sàn mua sắm.'
        }
        itemInfo={statusTargetProduct ? `Gian hàng: ${statusTargetProduct.shopName}` : undefined}
        confirmText={
          statusTargetProduct?.nextStatus === 'HIDDEN' ? 'Tạm ẩn sản phẩm' : 'Hiển thị công khai'
        }
        cancelText="Hủy bỏ"
        variant={statusTargetProduct?.nextStatus === 'HIDDEN' ? 'danger' : 'info'}
        icon={
          statusTargetProduct?.nextStatus === 'HIDDEN' ? (
            <EyeOff className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <Eye className="w-6 h-6 stroke-[2.2]" />
          )
        }
        confirmIcon={
          statusTargetProduct?.nextStatus === 'HIDDEN' ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )
        }
        isLoading={updateStatusMutation.isPending}
        onClose={() => setStatusTargetProduct(null)}
        onConfirm={() => {
          if (!statusTargetProduct) return;
          updateStatusMutation.mutate(
            {
              productId: statusTargetProduct.id,
              status: statusTargetProduct.nextStatus,
            },
            {
              onSettled: () => setStatusTargetProduct(null),
            },
          );
        }}
      />
    </div>
  );
}
