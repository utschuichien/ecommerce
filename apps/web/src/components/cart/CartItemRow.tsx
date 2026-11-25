'use client';

import React from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from './cart-types';
import { formatVND } from '../../lib/api-client';
import { ProductImage } from '@/components/common/ProductImage';
import { Checkbox } from '../ui/checkbox';

interface CartItemRowProps {
  item: CartItem;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartItemRow({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="py-3.5 sm:py-4 px-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-colors hover:bg-gray-50/50 border-b border-gray-100/80 last:border-b-0">
      {/* 1. Checkbox & Image & Info */}
      <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
        {/* Checkbox */}
        <Checkbox
          checked={item.selected}
          onCheckedChange={() => onToggleSelect(item.id)}
          title={item.selected ? 'Bỏ chọn sản phẩm này' : 'Chọn sản phẩm này'}
          className="mt-1"
        />

        {/* Thumbnail hình ảnh */}
        <Link
          href={`/products/${item.productSlug || item.productId}`}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gray-50/80 p-1.5 shrink-0 flex items-center justify-center overflow-hidden hover:opacity-95 transition"
        >
          <ProductImage
            src={item.image}
            alt={item.name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </Link>

        {/* Thông tin tên & phân loại */}
        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/products/${item.productSlug || item.productId}`}
            className="font-semibold text-sm text-gray-900 hover:text-emerald-600 transition block line-clamp-2 sm:truncate"
          >
            {item.name}
          </Link>

          {/* Phân loại biến thể */}
          <div className="text-xs text-gray-500 truncate">
            {item.variant}
          </div>

          {/* Đơn giá */}
          <div className="flex items-center gap-2 pt-0.5 sm:hidden">
            <span className="text-sm font-semibold text-gray-900">
              {formatVND(item.price)}
            </span>
            {item.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatVND(item.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Đơn giá (Màn hình máy tính) */}
      <div className="hidden sm:block text-right pr-3 shrink-0 min-w-[104px]">
        <div className="text-sm font-semibold text-gray-900">
          {formatVND(item.price)}
        </div>
        {item.oldPrice && (
          <div className="text-xs text-gray-400 line-through">
            {formatVND(item.oldPrice)}
          </div>
        )}
      </div>

      {/* 3. Bộ tăng giảm số lượng & Thành tiền & Nút Xóa */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0 pt-1.5 sm:pt-0 pl-7 sm:pl-0">
        {/* Bộ điều khiển số lượng [- qty +] */}
        <div className="flex items-center border border-gray-200/80 rounded-lg bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1.5 sm:px-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Giảm số lượng"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 sm:w-9 text-center font-semibold text-xs sm:text-sm text-gray-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1.5 sm:px-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
            title="Tăng số lượng"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tổng tiền của dòng sản phẩm này */}
        <div className="text-right min-w-[88px] sm:min-w-[100px]">
          <span className="text-sm font-bold text-gray-950">
            {formatVND(lineTotal)}
          </span>
        </div>

        {/* Nút Xóa sản phẩm */}
        <button
          type="button"
          onClick={() => onRemoveItem(item.id)}
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Xóa khỏi giỏ hàng"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
