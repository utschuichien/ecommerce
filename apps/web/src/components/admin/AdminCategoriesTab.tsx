'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FolderPlus,
  Loader2,
  Sparkles,
  EyeOff,
} from 'lucide-react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  AdminCategoryItem,
  categoryFormSchema,
  CategoryFormValues,
  generateSlug,
} from '@/features/admin';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { getCategoryDefaultImage, DEFAULT_CATEGORY_IMAGE } from '@/constants/default-images';
import { customZodResolver } from '@/lib/zod-resolver';
import { toast } from 'sonner';

export function AdminCategoriesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  // Modal xác nhận xóa
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryItem | null>(null);

  const { data: categories = [], isLoading, isFetching, refetch } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Form validation bằng React Hook Form & Zod Resolver
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: customZodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      position: 0,
      isActive: true,
    },
    mode: 'onChange',
  });

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // Tự động đồng bộ Slug từ Tên khi chế độ tự động bật
  useEffect(() => {
    if (isAutoSlug && watchedName) {
      const generated = generateSlug(watchedName);
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [watchedName, isAutoSlug, setValue]);

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return cat.name.toLowerCase().includes(term) || cat.slug.toLowerCase().includes(term);
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsAutoSlug(true);
    reset({
      name: '',
      slug: '',
      position: categories.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategoryItem) => {
    setEditingCategory(cat);
    setIsAutoSlug(false);
    reset({
      name: cat.name,
      slug: cat.slug,
      position: cat.position,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    // 1. Kiểm tra trùng lặp Slug cục bộ phía client
    const targetSlug = values.slug?.trim() || generateSlug(values.name);
    const isDuplicateSlug = categories.some(
      (c) => c.slug === targetSlug && (!editingCategory || c.id !== editingCategory.id),
    );

    if (isDuplicateSlug) {
      setError('slug', {
        type: 'manual',
        message: `Slug "${targetSlug}" đã được sử dụng bởi một danh mục khác.`,
      });
      return;
    }

    // 2. Kiểm tra trùng lặp Tên danh mục cục bộ
    const isDuplicateName = categories.some(
      (c) =>
        c.name.trim().toLowerCase() === values.name.trim().toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id),
    );

    if (isDuplicateName) {
      setError('name', {
        type: 'manual',
        message: `Tên danh mục "${values.name.trim()}" đã tồn tại trên sàn.`,
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.id,
          data: {
            name: values.name.trim(),
            slug: targetSlug,
            position: Number(values.position) || 0,
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          slug: targetSlug,
          position: Number(values.position) || 0,
        });
      }

      handleCloseModal();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu danh mục.';
      if (errMsg.includes('slug') || errMsg.includes('Slug')) {
        setError('slug', { type: 'server', message: errMsg });
      } else {
        toast.error('Lưu danh mục thất bại', { description: errMsg });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc slug danh mục..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm danh mục</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Danh sách danh mục */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden mx-auto shadow-xs border border-gray-100 bg-gray-50 flex items-center justify-center p-1.5">
              <img
                src={DEFAULT_CATEGORY_IMAGE}
                alt="Danh mục sàn"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Không tìm thấy danh mục nào</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              {searchTerm
                ? 'Không có danh mục nào khớp với từ khóa tìm kiếm của bạn.'
                : 'Chưa có danh mục nào được khởi tạo trên hệ thống sàn.'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tạo danh mục đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Thứ tự</th>
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Slug URL</th>
                  <th className="py-3 px-4 text-center">Số sản phẩm</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                      {cat.position}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200/80 bg-gray-50 flex items-center justify-center shrink-0 shadow-2xs p-0.5">
                          <img
                            src={getCategoryDefaultImage(cat.slug || cat.name)}
                            alt={cat.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      /{cat.slug}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        <Package className="w-3 h-3 text-gray-500" />
                        {cat.productsCount} SP
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                          <EyeOff className="w-3 h-3" /> Tạm ẩn
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          title="Sửa danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          disabled={cat.productsCount > 0}
                          title={
                            cat.productsCount > 0
                              ? `Không thể xóa vì còn ${cat.productsCount} sản phẩm trực thuộc`
                              : 'Xóa danh mục'
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Modal Thêm / Sửa Danh mục với chuẩn rounded-lg và cursor-pointer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-100 bg-emerald-50/50 flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
                  <img
                    src={getCategoryDefaultImage(watchedName || watchedSlug)}
                    alt="Preview icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">
                    {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingCategory
                      ? 'Cập nhật thông tin định danh và vị trí danh mục'
                      : 'Thiết lập danh mục phân loại ngành hàng trên sàn'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Validation */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
              {/* Field 1: Tên danh mục */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-700">
                    Tên danh mục <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {(watchedName || '').length}/100 ký tự
                  </span>
                </div>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Ví dụ: Thiết Bị Điện Tử, Thời Trang Nam..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition ${
                    errors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-gray-200/60 bg-gray-50/40 hover:bg-gray-50 focus:bg-white focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Slug URL định danh */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-700">
                    Slug URL (Định danh đường dẫn)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isAutoSlug;
                      setIsAutoSlug(next);
                      if (next && watchedName) {
                        setValue('slug', generateSlug(watchedName), { shouldValidate: true });
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      isAutoSlug
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{isAutoSlug ? 'Tự sinh: BẬT' : 'Tự sinh: TẮT'}</span>
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-[11px] select-none pointer-events-none">
                    /category/
                  </span>
                  <input
                    type="text"
                    {...register('slug', {
                      onChange: () => {
                        if (isAutoSlug) setIsAutoSlug(false);
                      },
                    })}
                    placeholder="dien-thoai-thong-minh"
                    className={`w-full pl-20 pr-3 py-2 text-xs font-mono rounded-lg border outline-none transition ${
                      errors.slug
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-gray-200/60 bg-gray-50/40 hover:bg-gray-50 focus:bg-white focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10'
                    }`}
                  />
                </div>

                {errors.slug ? (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.slug.message}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400">
                    Chỉ chứa chữ thường không dấu, số và dấu gạch nối (ví dụ: thiet-bi-dien-tu).
                  </p>
                )}
              </div>

              {/* Field 3: Thứ tự ưu tiên */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700">
                  Thứ tự ưu tiên hiển thị (0 - 9999)
                </label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  {...register('position')}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition ${
                    errors.position
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-gray-200/60 bg-gray-50/40 hover:bg-gray-50 focus:bg-white focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.position ? (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.position.message}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400">
                    Số nhỏ hơn sẽ hiển thị trước trên thanh điều hướng menu của sàn.
                  </p>
                )}
              </div>

              {/* Field 4: Trạng thái hiển thị (Chỉ có khi sửa hoặc tuỳ chọn) */}
              {editingCategory && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block leading-tight">
                        Kích hoạt hiển thị công khai trên sàn
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Người mua có thể tìm kiếm và xem danh mục này trên trang chủ.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal xác nhận xóa danh mục - Dùng ConfirmDeleteModal dùng chung */}
      <ConfirmDeleteModal
        isOpen={!!deletingCategory}
        title="Xóa danh mục ngành hàng?"
        itemName={deletingCategory?.name}
        description="Bạn có chắc chắn muốn xóa danh mục này? Thao tác này sẽ xóa vĩnh viễn và không thể khôi phục."
        itemInfo={
          deletingCategory ? `ID: ${deletingCategory.id} • Slug: ${deletingCategory.slug}` : undefined
        }
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
