'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus,
  Box,
  ShoppingCart,
  EyeOff,
  AlertTriangle,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  Edit3,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Pagination, ConfirmDeleteModal } from '@/components/common';
import { toast } from 'sonner';
import {
  useSellerProductStats,
  useSellerProducts,
  useSellerCategories,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useToggleProductStatus,
  useDeleteSellerProduct,
} from '@/features/seller';
import { ProductItem, ProductCategory, ProductVariantItem } from './seller-types';
import {
  ProductDetailModal,
  ProductEditModal,
  ProductAddModal,
} from './modals';
import { SellerDropdown } from './common/SellerDropdown';

export function SellerProductsTab() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('NEWEST');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);

  // Custom Hooks (React Query)
  const { data: statsData } = useSellerProductStats();
  const { data: productsData, isLoading } = useSellerProducts({
    search: searchQuery || undefined,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    sort: selectedSort.toLowerCase(),
    page,
    limit: viewMode === 'grid' ? 8 : 6,
  });
  const { data: categoriesData } = useSellerCategories();

  const createProductMutation = useCreateSellerProduct();
  const updateProductMutation = useUpdateSellerProduct();
  const toggleStatusMutation = useToggleProductStatus();
  const deleteProductMutation = useDeleteSellerProduct();

  const categories: ProductCategory[] = categoriesData || [];
  const products: ProductItem[] = productsData?.items || [];
  const totalItems = productsData?.pagination?.totalItems || 0;
  const totalPages = productsData?.pagination?.totalPages || 1;
  const stats = statsData || {
    total: products.length,
    active: 0,
    hidden: 0,
    outOfStock: 0,
  };
  const isDeleting = deleteProductMutation.isPending;

  // Options cho bộ lọc SellerDropdown
  const categoryOptions = useMemo(() => [
    { label: 'Tất cả danh mục', value: 'ALL' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.name })),
  ], [categories]);

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: 'ALL' },
    { label: 'Đang bán', value: 'ACTIVE' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    { label: 'Tạm ẩn', value: 'HIDDEN' },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'NEWEST' },
    { label: 'Giá: Tăng dần', value: 'PRICE_ASC' },
    { label: 'Giá: Giảm dần', value: 'PRICE_DESC' },
    { label: 'Tồn kho nhiều nhất', value: 'STOCK_DESC' },
  ];

  // Trạng thái cho giao diện nổi (Tách thành các Modals riêng biệt)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Chọn / bỏ chọn tất cả
  const isAllSelected =
    products.length > 0 && selectedIds.length === products.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    const list = products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (selectedSort === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'STOCK_DESC') {
      list.sort((a, b) => b.stock - a.stock);
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedSort]);

  // Cập nhật sản phẩm sau khi chỉnh sửa
  const handleSaveEdit = async (updatedProduct: ProductItem) => {
    try {
      await updateProductMutation.mutateAsync({
        id: updatedProduct.id,
        payload: {
          name: updatedProduct.name,
          subtitle: updatedProduct.subtitle,
          sku: updatedProduct.sku,
          category: updatedProduct.category,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          image: updatedProduct.image,
          images: updatedProduct.images,
          variants: updatedProduct.variants,
          status: updatedProduct.status === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE',
        },
      });
      toast.success('Cập nhật sản phẩm', {
        description: `Đã lưu thay đổi cho "${updatedProduct.name}".`,
      });
      setEditingProduct(null);
    } catch (err: any) {
      toast.error('Cập nhật thất bại', {
        description: err?.response?.data?.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại.',
      });
    }
  };

  // Tạo sản phẩm mới từ modal
  const handleSaveAdd = async (newProductData: {
    name: string;
    subtitle: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    images?: string[];
    status: ProductItem['status'];
    hasVariants?: boolean;
    variants?: ProductVariantItem[];
  }) => {
    const generatedSku = `SKU-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const created = await createProductMutation.mutateAsync({
        name: newProductData.name,
        subtitle: newProductData.subtitle,
        sku: generatedSku,
        category: newProductData.category,
        price: newProductData.price,
        stock: newProductData.stock,
        image: newProductData.image,
        images: newProductData.images,
        variants: newProductData.variants,
        status: newProductData.status === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE',
      });
      toast.success('Thêm sản phẩm thành công', {
        description: `Sản phẩm "${created?.name || newProductData.name}" đã được đưa lên kệ.`,
      });
      setIsAddingProduct(false);
    } catch (err: any) {
      toast.error('Tạo sản phẩm thất bại', {
        description: err?.response?.data?.message || 'Không thể tạo sản phẩm. Vui lòng thử lại.',
      });
    }
  };

  // Xác nhận xóa sản phẩm
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProductMutation.mutateAsync(deletingProduct.id);
      toast.success('Đã xóa sản phẩm', {
        description: `Sản phẩm "${deletingProduct.name}" đã được xóa vĩnh viễn.`,
      });
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error('Xóa thất bại', {
        description: err?.response?.data?.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.',
      });
    }
  };

  // Đổi trạng thái Ẩn / Bán
  const handleToggleStatus = async (product: ProductItem) => {
    const nextStatus: 'ACTIVE' | 'HIDDEN' =
      product.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';

    try {
      await toggleStatusMutation.mutateAsync({
        id: product.id,
        status: nextStatus,
      });
      toast.success('Đổi trạng thái', {
        description: `Sản phẩm chuyển sang: ${nextStatus === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn'}.`,
      });
    } catch (err: any) {
      toast.error('Đổi trạng thái thất bại', {
        description: err?.response?.data?.message || 'Không thể thay đổi trạng thái sản phẩm.',
      });
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* TIÊU ĐỀ TRANG + NÚT THÊM SẢN PHẨM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className='flex items-center gap-2'>
            <Box className="w-6 h-6 text-emerald-600 stroke-[2.2]"/>
          <h1 className="text-xl font-bold text-gray-950 tracking-tight">
            Quản lý sản phẩm
          </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý danh sách sản phẩm trong cửa hàng của bạn
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingProduct(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#009b60] hover:bg-[#008650] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* 4 Ô THỐNG KÊ (ĐỒNG BỘ HIỂN THỊ SỐ CHUẨN XÁC) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ô 1: Tổng sản phẩm */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Tổng sản phẩm
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.total ?? products.length ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 2: Sản phẩm đang bán */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Sản phẩm đang bán
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.active ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 3: Tạm ẩn */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <EyeOff className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Tạm ẩn
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.hidden ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 4: Hết hàng */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Hết hàng
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.outOfStock ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Ô tìm kiếm */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/80 focus:border-emerald-500 rounded-lg text-xs text-gray-800 placeholder-gray-400 outline-none transition"
            />
          </div>

          {/* Lọc danh mục */}
          <SellerDropdown
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            options={categoryOptions}
            placeholder="Danh mục"
          />

          {/* Lọc trạng thái */}
          <SellerDropdown
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
            options={statusOptions}
            placeholder="Trạng thái"
          />

          {/* Sắp xếp */}
          <SellerDropdown
            value={selectedSort}
            onChange={(val) => {
              setSelectedSort(val);
              setPage(1);
            }}
            options={sortOptions}
            placeholder="Sắp xếp"
          />
        </div>

        {/* Nút chuyển chế độ xem Grid / List */}
        <div className="flex items-center gap-1 border border-gray-200/80 rounded-lg p-0.5 bg-gray-50/60">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#009b60] text-white shadow-2xs'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#009b60] text-white shadow-2xs'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Dạng danh sách"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BẢNG HOẶC LƯỚI DANH SÁCH SẢN PHẨM */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-2xs overflow-visible">
        {viewMode === 'grid' ? (
          /* CHẾ ĐỘ XEM DẠNG LƯỚI (GRID VIEW) */
          <div>
            {filteredProducts.length === 0 ? (
              <div className="py-14 text-center text-xs text-gray-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Box className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                      ? 'Không tìm thấy sản phẩm nào phù hợp'
                      : 'Chưa có sản phẩm nào trong cửa hàng'}
                  </span>
                  <p className="text-[11px] text-gray-400 max-w-xs">
                    {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                      ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc'
                      : 'Bắt đầu đăng bán sản phẩm đầu tiên lên gian hàng của bạn'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const isMenuOpen = openMenuId === product.id;

                    return (
                      <div
                        key={product.id}
                        className={`group relative bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                            : 'border-gray-200/80 hover:border-emerald-300'
                        }`}
                      >
                        {/* Ảnh sản phẩm + Checkbox + Badge */}
                        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              onClick={() => setViewingProduct(product)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            />
                          ) : (
                            <div
                              onClick={() => setViewingProduct(product)}
                              className="w-full h-full flex items-center justify-center text-gray-300 cursor-pointer"
                            >
                              <Box className="w-10 h-10 stroke-[1.5]" />
                            </div>
                          )}

                          {/* Badge trạng thái */}
                          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md shadow-2xs ${
                                product.status === 'ACTIVE'
                                  ? 'bg-emerald-600/90 text-white'
                                  : product.status === 'OUT_OF_STOCK'
                                  ? 'bg-amber-600/90 text-white'
                                  : 'bg-gray-700/90 text-white'
                              }`}
                            >
                              {product.status === 'ACTIVE'
                                ? 'Đang bán'
                                : product.status === 'OUT_OF_STOCK'
                                ? 'Hết hàng'
                                : 'Tạm ẩn'}
                            </span>
                          </div>

                          {/* Checkbox chọn sản phẩm */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2.5 right-2.5 z-10"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(product.id)}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shadow-sm"
                            />
                          </div>

                          {/* Lớp phủ Xem nhanh khi rê chuột */}
                          <div
                            onClick={() => setViewingProduct(product)}
                            className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none group-hover:pointer-events-auto"
                          >
                            <span className="px-3 py-1.5 rounded-lg bg-white/95 text-gray-900 text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-white transition-colors">
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Xem chi tiết</span>
                            </span>
                          </div>
                        </div>

                        {/* Nội dung thông tin sản phẩm */}
                        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                {product.category}
                              </span>
                              <span
                                className="font-mono text-[10px] text-gray-400 truncate max-w-[100px]"
                                title={product.sku}
                              >
                                {product.sku}
                              </span>
                            </div>

                            <h4
                              onClick={() => setViewingProduct(product)}
                              className="font-bold text-gray-900 text-xs sm:text-[13px] leading-snug line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer"
                              title={product.name}
                            >
                              {product.name}
                            </h4>

                            {product.hasVariants && product.variants && product.variants.length > 1 && (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                {product.variants.length} phân loại
                              </span>
                            )}
                          </div>

                          {/* Giá bán & Tồn kho */}
                          <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                            <div>
                              <span className="text-sm font-bold text-gray-950">
                                {product.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-[11px] font-semibold ${
                                  product.stock <= 5
                                    ? 'text-amber-600 font-bold'
                                    : 'text-gray-500'
                                }`}
                              >
                                Tồn: {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Thanh nút bấm thao tác */}
                        <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-0 flex items-center gap-1.5 relative">
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...product })}
                            className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 border border-gray-200/70 hover:border-emerald-200 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Chỉnh sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOpenMenuId(isMenuOpen ? null : product.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isMenuOpen
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200/70 hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Tùy chọn khác"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Popover Dropdown nổi trong Grid Card */}
                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-3.5 bottom-full mb-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-40 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingProduct(product);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Xem chi tiết</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(product)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-amber-700 transition cursor-pointer"
                                >
                                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    {product.status === 'ACTIVE'
                                      ? 'Tạm ẩn sản phẩm'
                                      : 'Bật bán sản phẩm'}
                                  </span>
                                </button>

                                <div className="border-t border-gray-100 my-1" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingProduct(product);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span className="font-semibold">Xóa sản phẩm</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-600 font-semibold select-none">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th className="py-3 px-3 min-w-[260px]">Sản phẩm</th>
                <th className="py-3 px-3 min-w-[110px]">Danh mục</th>
                <th className="py-3 px-3 min-w-[110px]">Giá bán</th>
                <th className="py-3 px-3 min-w-[80px]">Tồn kho</th>
                <th className="py-3 px-3 min-w-[120px]">Trạng thái</th>
                <th className="py-3 px-3 min-w-[120px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                const isMenuOpen = openMenuId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50/70 transition ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(product.id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                    </td>

                    {/* Tên & ảnh sản phẩm */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setViewingProduct(product)}
                          className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1 relative overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover p-0.5 group-hover:scale-105 transition-transform rounded"
                            />
                          ) : (
                            <Box className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4
                              onClick={() => setViewingProduct(product)}
                              className="font-bold text-gray-900 truncate text-xs hover:text-emerald-600 transition cursor-pointer"
                            >
                              {product.name}
                            </h4>
                            {product.hasVariants && product.variants && product.variants.length > 1 && (
                              <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded">
                                {product.variants.length} phân loại
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {product.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${product.categoryColor}`}
                      >
                        {product.category}
                      </span>
                    </td>

                    {/* Giá bán */}
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {product.price.toLocaleString('vi-VN')}đ
                    </td>

                    {/* Tồn kho */}
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {product.stock}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-3">
                      {product.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span>{product.statusLabel}</span>
                        </span>
                      )}
                      {product.status === 'OUT_OF_STOCK' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{product.statusLabel}</span>
                        </span>
                      )}
                      {product.status === 'HIDDEN' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                          <span>{product.statusLabel}</span>
                        </span>
                      )}
                    </td>

                    {/* CỘT THAO TÁC CÓ GIAO DIỆN NỔI (ACTION MENU & MODALS) */}
                    <td className="py-3 px-3 text-right">
                      <div className="relative inline-flex items-center justify-end gap-1 text-gray-400">
                        {/* 1. Nút Xem nhanh (Mở Modal nổi chi tiết) */}
                        <button
                          type="button"
                          onClick={() => setViewingProduct(product)}
                          className="p-1.5 rounded-md hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          title="Xem chi tiết sản phẩm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 2. Nút Chỉnh sửa (Mở Modal nổi sửa sản phẩm) */}
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...product })}
                          className="p-1.5 rounded-md hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* 3. Nút 3 chấm (Mở Dropdown Menu nổi) */}
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(isMenuOpen ? null : product.id)}
                          className={`p-1.5 rounded-md transition cursor-pointer ${
                            isMenuOpen
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          title="Tùy chọn khác"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* GIAO DIỆN NỔI: DROPDOWN MENU POPOVER */}
                        {isMenuOpen && (
                          <>
                            {/* Backdrop tàng hình để click bên ngoài thì đóng menu */}
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setOpenMenuId(null)}
                            />

                            {/* Menu popover nổi với bóng đổ và viền sắc nét */}
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-40 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingProduct(product);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2.5 text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-emerald-600" />
                                <span>Xem chi tiết</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct({ ...product });
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2.5 text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                <span>Chỉnh sửa thông tin</span>
                              </button>


                              <button
                                type="button"
                                onClick={() => handleToggleStatus(product)}
                                className="w-full px-3 py-2 flex items-center gap-2.5 text-gray-700 hover:bg-gray-50 hover:text-amber-700 transition cursor-pointer"
                              >
                                <EyeOff className="w-4 h-4 text-amber-600" />
                                <span>
                                  {product.status === 'ACTIVE'
                                    ? 'Tạm ẩn sản phẩm'
                                    : 'Bật bán sản phẩm'}
                                </span>
                              </button>

                              <div className="border-t border-gray-100 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingProduct(product);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                                <span className="font-semibold">Xóa sản phẩm</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Box className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                          ? 'Không tìm thấy sản phẩm nào phù hợp'
                          : 'Chưa có sản phẩm nào trong cửa hàng'}
                      </span>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                          ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc'
                          : 'Bắt đầu đăng bán sản phẩm đầu tiên lên gian hàng của bạn'}
                      </p>
                      
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* PHÂN TRANG */}
        <div className="p-3 border-t border-gray-100">
          <Pagination
            page={page}
            totalPages={
              totalPages ||
              Math.max(1, Math.ceil(totalItems / (viewMode === 'grid' ? 8 : 6)))
            }
            totalItems={totalItems || products.length}
            limit={viewMode === 'grid' ? 8 : 6}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* CÁC GIAO DIỆN NỔI ĐƯỢC TÁCH THÀNH COMPONENT RIÊNG              */}
      {/* ============================================================== */}

      {/* 1. Modal xem chi tiết sản phẩm */}
      <ProductDetailModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(p) => setEditingProduct({ ...p })}
      />

      {/* 2. Modal chỉnh sửa sản phẩm */}
      <ProductEditModal
        product={editingProduct}
        categories={categories}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEdit}
      />

      {/* 3. Modal thêm sản phẩm mới */}
      <ProductAddModal
        isOpen={isAddingProduct}
        categories={categories}
        onClose={() => setIsAddingProduct(false)}
        onAdd={handleSaveAdd}
      />

      {/* 4. Modal xác nhận xóa - Dùng trực tiếp component chung ConfirmDeleteModal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingProduct)}
        isLoading={isDeleting}
        title="Xác nhận xóa sản phẩm?"
        itemName={deletingProduct?.name}
        itemInfo={
          deletingProduct ? (
            <span>
              SKU: {deletingProduct.sku} • Tồn kho: {deletingProduct.stock} cái
            </span>
          ) : undefined
        }
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
