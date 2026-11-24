'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ChevronRight, Truck, TicketPercent } from 'lucide-react';
import { CartShopGroupData } from './cart-types';
import { CartItemRow } from './CartItemRow';
import { formatVND } from '../../lib/api-client';
import { Checkbox } from '../ui/checkbox';

interface CartShopGroupProps {
  group: CartShopGroupData;
  onToggleShop: (shopId: string) => void;
  onToggleItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartShopGroup({
  group,
  onToggleShop,
  onToggleItem,
  onUpdateQuantity,
  onRemoveItem,
}: CartShopGroupProps) {
  // Kiểm tra xem tất cả sản phẩm trong shop này đã được chọn chưa
  const isAllShopItemsSelected =
    group.items.length > 0 && group.items.every((it) => it.selected);

  // Tính tổng tiền tạm tính của shop (chỉ tính các sản phẩm đang được chọn)
  const shopSelectedSubtotal = group.items
    .filter((it) => it.selected)
    .reduce((sum, it) => sum + it.price * it.quantity, 0);

  const shopTarget = group.shopSlug || group.shopPublicId || group.shopId;
  const shopHref = shopTarget ? `/shop/${shopTarget}` : '/products';

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl shadow-2xs overflow-hidden">
      {/* 1. Shop Header Bar */}
      <div className="py-3 px-4 sm:px-5 bg-gray-50/50 border-b border-gray-100/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Shop Checkbox */}
          <Checkbox
            checked={isAllShopItemsSelected}
            onCheckedChange={() => onToggleShop(group.shopId)}
            title="Chọn tất cả sản phẩm từ shop này"
          />

          {/* Shop Icon & Name */}
          <Link
            href={shopHref}
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer min-w-0"
            title={`Xem gian hàng ${group.shopName}`}
          >
            <Store className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform" />
            <span className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600 transition truncate">
              {group.shopName}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Badge: Chính hãng hoặc Mall */}
          {group.badge && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                group.badgeType === 'mall'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {group.badge}
            </span>
          )}
        </div>

        {/* Nút Xem shop */}
        <Link
          href={shopHref}
          className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-0.5 font-medium transition cursor-pointer shrink-0"
        >
          <span>Xem shop</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Danh sách các sản phẩm của shop */}
      <div>
        {group.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onToggleSelect={onToggleItem}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {/* 3. Shop Footer (Vận chuyển, Voucher & Tạm tính shop) */}
      <div className="py-3 px-4 sm:px-5 bg-gray-50/40 border-t border-gray-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        {/* Dự kiến giao hàng & Voucher */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-600">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{group.deliveryEstimate}</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer transition"
          >
            <TicketPercent className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voucher của shop</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Tạm tính của shop */}
        <div className="flex items-center gap-1.5 text-gray-600 self-end sm:self-auto">
          <span>Tạm tính shop:</span>
          <span className="font-bold text-gray-900 text-sm">
            {formatVND(shopSelectedSubtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
