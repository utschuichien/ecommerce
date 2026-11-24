'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, UploadCloud, Loader2, Star, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sellerProductsApi, createProductSchema } from '@/features/seller';
import { ProductItem, ProductCategory, ProductVariantItem } from '../seller-types';
import { VariantManager } from '../variants/VariantManager';

interface ProductAddModalProps {
  isOpen: boolean;
  categories: ProductCategory[];
  onClose: () => void;
  onAdd: (newProduct: {
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
  }) => void;
}

interface ImageUploadItem {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
}

export function ProductAddModal({
  isOpen,
  categories,
  onClose,
  onAdd,
}: ProductAddModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageList, setImageList] = useState<ImageUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    category: categories[0]?.name || '',
    price: '',
    stock: '',
    status: 'ACTIVE' as 'ACTIVE' | 'HIDDEN',
  });

  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, form.category]);

  if (!isOpen) return null;

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // 1. Chọn nhiều ảnh từ máy tính (Local Preview)
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    clearError('imagesCount');

    const newItems: ImageUploadItem[] = [];
    const hadImages = imageList.length > 0;

    Array.from(files).forEach((file, index) => {
      const localUrl = URL.createObjectURL(file);
      newItems.push({
        id: `local-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        url: localUrl,
        file,
        isPrimary: !hadImages && index === 0,
      });
    });

    setImageList((prev) => {
      const combined = [...prev, ...newItems].slice(0, 8);
      if (!combined.some((item) => item.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true;
      }
      return combined;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Đặt 1 ảnh làm ảnh bìa
  const handleSetPrimary = (id: string) => {
    setImageList((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary: item.id === id,
      }))
    );
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (id: string) => {
    setImageList((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file) {
        URL.revokeObjectURL(target.url);
      }
      const remaining = prev.filter((item) => item.id !== id);

      if (target?.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  // 2. Validate với Zod và gửi Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate toàn bộ dữ liệu qua Zod Schema
    const validationResult = createProductSchema.safeParse({
      name: form.name,
      subtitle: form.subtitle,
      category: form.category,
      hasVariants,
      price: hasVariants ? undefined : form.price,
      stock: hasVariants ? undefined : form.stock,
      variants: hasVariants ? variants : undefined,
      imagesCount: imageList.length,
      status: form.status,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0] || 'form');
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      setIsSubmitting(true);

      // Upload tất cả các file local lên Cloudinary song song
      const uploadPendingFiles = imageList.map(async (item) => {
        if (item.file) {
          const res = await sellerProductsApi.uploadImage(item.file);
          return {
            ...item,
            url: res.secureUrl || res.url,
            file: undefined,
          };
        }
        return item;
      });

      const uploadedImages = await Promise.all(uploadPendingFiles);

      // Sắp xếp đưa ảnh bìa (isPrimary) lên đầu tiên
      const sortedImages = [...uploadedImages].sort((a, b) =>
        a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
      );

      const finalUrls = sortedImages.map((img) => img.url);
      const primaryUrl = finalUrls[0] || '';

      const validData = validationResult.data;

      const computedPrice = hasVariants
        ? variants.length > 0
          ? Math.min(...variants.map((v) => v.price))
          : 0
        : validData.price;

      const computedStock = hasVariants
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : validData.stock;

      onAdd({
        name: validData.name,
        subtitle: validData.subtitle || 'Sản phẩm mới trên sàn',
        category: validData.category,
        price: computedPrice,
        stock: computedStock,
        image: primaryUrl,
        images: finalUrls,
        status: validData.status,
        hasVariants,
        variants: hasVariants ? variants : undefined,
      });

      // Reset form
      setForm({
        name: '',
        subtitle: '',
        category: categories[0]?.name || '',
        price: '',
        stock: '',
        status: 'ACTIVE',
      });
      setHasVariants(false);
      setVariants([]);
      setImageList([]);
      setErrors({});
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-950">
              Thêm sản phẩm mới
            </h3>
            <p className="text-[11px] text-gray-400">
              Điền các thông tin, cấu hình phân loại và tải lên hình ảnh sản phẩm
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Form */}
        <div className="space-y-3.5 text-xs">
          {/* Tên sản phẩm */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              placeholder="VD: Tai nghe Bluetooth chống ồn True Wireless Gen 2"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError('name');
              }}
              className={`w-full px-3 py-2 border rounded-lg outline-none transition ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                  : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Phụ đề / Mô tả ngắn */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Phụ đề / Điểm nổi bật
            </label>
            <input
              type="text"
              placeholder="VD: Pin 30 giờ, chống ồn chủ động ANC, chống nước IPX4"
              value={form.subtitle}
              onChange={(e) => {
                setForm({ ...form, subtitle: e.target.value });
                clearError('subtitle');
              }}
              className={`w-full px-3 py-2 border rounded-lg outline-none transition ${
                errors.subtitle
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                  : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {errors.subtitle && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.subtitle}</span>
              </p>
            )}
          </div>

          {/* Upload nhiều ảnh sản phẩm */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-gray-700">
                Hình ảnh sản phẩm * ({imageList.length}/8 ảnh)
              </label>
              <span className="text-[10px] text-gray-400">
                Tối đa 8 ảnh • Định dạng JPG, PNG, WEBP
              </span>
            </div>

            {/* Hidden Input file */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleSelectFiles}
            />

            {/* Dải ảnh Preview & nút thêm */}
            {imageList.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  errors.imagesCount
                    ? 'border-red-400 bg-red-50/20 text-red-600'
                    : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-gray-500'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-gray-700">
                  Nhấn để chọn ảnh từ máy tính
                </div>
                <div className="text-[11px] text-gray-400">
                  Hỗ trợ tải lên cùng lúc nhiều góc ảnh của sản phẩm
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-200">
                {imageList.map((img) => (
                  <div
                    key={img.id}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      img.isPrimary
                        ? 'border-emerald-600 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Ảnh bìa */}
                    {img.isPrimary && (
                      <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Bìa
                      </div>
                    )}

                    {/* Action buttons on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="w-full py-1 text-[9px] font-bold bg-white/95 text-gray-800 rounded hover:bg-emerald-600 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Star className="w-2.5 h-2.5" />
                          Đặt làm bìa
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Ô bấm thêm ảnh */}
                {imageList.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="aspect-square rounded-lg border border-dashed border-gray-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-gray-500 hover:text-emerald-700 flex flex-col items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-center leading-tight">
                      Thêm ảnh
                    </span>
                  </button>
                )}
              </div>
            )}

            {errors.imagesCount && (
              <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.imagesCount}</span>
              </p>
            )}

            <p className="text-[10px] text-gray-400 mt-1.5">
              • Ảnh có nhãn <span className="text-emerald-600 font-semibold">[Bìa]</span> sẽ là ảnh đại diện chính.
              <br />• Ảnh được xem trước tại máy và chỉ tải lên Cloudinary khi bạn bấm <b>&quot;Đăng bán sản phẩm&quot;</b>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Danh mục */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  clearError('category');
                }}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition cursor-pointer bg-white ${
                  errors.category
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Trạng thái khởi tạo */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Trạng thái khởi tạo
              </label>
              <select
                value={form.status}
                onChange={(e) => {
                  setForm({
                    ...form,
                    status: e.target.value as 'ACTIVE' | 'HIDDEN',
                  });
                  clearError('status');
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition cursor-pointer bg-white"
              >
                <option value="ACTIVE">Mở bán ngay</option>
                <option value="HIDDEN">Lưu tạm ẩn</option>
              </select>
            </div>
          </div>

          {/* Quản lý Phân loại hàng (Variants) */}
          <VariantManager
            hasVariants={hasVariants}
            onToggleHasVariants={(enabled) => {
              setHasVariants(enabled);
              clearError('price');
              clearError('stock');
              clearError('variants');
            }}
            variants={variants}
            onChangeVariants={(vars) => {
              setVariants(vars);
              clearError('variants');
            }}
            baseSku={form.name ? form.name.slice(0, 4) : 'SKU'}
            errors={errors}
          />

          {/* Nếu không bật phân loại, hiển thị ô nhập Giá & Kho đơn */}
          {!hasVariants ? (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-150">
              {/* Giá bán */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Giá bán (VNĐ) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="1.500.000"
                  value={form.price}
                  onChange={(e) => {
                    setForm({ ...form, price: e.target.value });
                    clearError('price');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition ${
                    errors.price
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                {errors.price && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.price}</span>
                  </p>
                )}
              </div>

              {/* Số lượng tồn kho */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Số lượng kho *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={form.stock}
                  onChange={(e) => {
                    setForm({ ...form, stock: e.target.value });
                    clearError('stock');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition ${
                    errors.stock
                      ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                {errors.stock && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.stock}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-1.5">
              <span>✓</span>
              <span>
                Giá bán và tồn kho đang được thiết lập theo từng phân loại hàng ở bảng phía trên.
              </span>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu và tải ảnh...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Đăng bán sản phẩm</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
