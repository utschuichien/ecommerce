'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Edit3, Image as ImageIcon } from 'lucide-react';
import { ProductItem } from '../seller-types';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onEdit: (product: ProductItem) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image || product.images?.[0] || '');
    }
  }, [product]);

  if (!product) return null;

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header modal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-950">
              Chi tiết sản phẩm
            </span>
            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-md">
              {product.sku}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin chính */}
        <div className="flex items-start gap-4">
          {/* Ảnh xem trước lớn */}
          <div className="space-y-2 shrink-0">
            <div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-200/80 p-1 relative overflow-hidden flex items-center justify-center shadow-2xs">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>

            {/* Dải thumbnail chuyển góc ảnh nếu sản phẩm có nhiều ảnh */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-1.5 max-w-[130px] overflow-x-auto py-0.5">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-7 h-7 rounded-md overflow-hidden border transition shrink-0 cursor-pointer ${
                      activeImage === imgUrl
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${product.categoryColor}`}
              >
                {product.category}
              </span>
              {product.status === 'ACTIVE' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Đang bán
                </span>
              )}
              {product.status === 'OUT_OF_STOCK' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  Hết hàng
                </span>
              )}
              {product.status === 'HIDDEN' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Tạm ẩn
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-gray-900 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {product.subtitle}
            </p>

            <div className="pt-1">
              <span className="text-lg font-bold text-emerald-600">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        {/* Bảng thông số nổi */}
        <div className="grid grid-cols-3 gap-2.5 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">
              Tồn kho hiện tại
            </span>
            <span className="text-sm font-bold text-gray-950 mt-0.5 block">
              {product.stock} cái
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">
              Đã bán ra
            </span>
            <span className="text-sm font-bold text-gray-950 mt-0.5 block">
              {product.soldCount} sp
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">
              Ngày đăng bán
            </span>
            <span className="text-sm font-bold text-gray-950 mt-0.5 block">
              {product.createdAt}
            </span>
          </div>
        </div>

        {/* Danh sách phân loại nếu có */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">
                Các phân loại hàng ({product.variants.length})
              </span>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Phân loại</th>
                    <th className="py-2 px-2">Mã SKU</th>
                    <th className="py-2 px-2 text-right">Giá bán</th>
                    <th className="py-2 px-3 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.variants.map((v, i) => {
                    const label = v.optionValues
                      ? Object.values(v.optionValues).join(' - ')
                      : `Biến thể #${i + 1}`;
                    return (
                      <tr key={v.id || i} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-medium text-gray-800">
                          <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-500 font-mono text-[11px]">
                          {v.sku}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-emerald-600">
                          {v.price.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-gray-700">
                          {v.stock}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(product);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
