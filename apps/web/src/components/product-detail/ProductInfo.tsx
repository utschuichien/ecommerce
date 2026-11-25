'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, Headphones, Loader2, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../mock/mock-data';
import { CatalogProductDetail } from '@/features/catalog/types/catalog.types';
import { formatVND, extractErrorMessage } from '../../lib/api-client';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useWishlistToggle } from '@/features/wishlist/hooks/useWishlist';
import { useAddToCart } from '@/features/cart';

interface ProductInfoProps {
  product: Product | CatalogProductDetail;
  onAddToCart?: (
    product: any,
    quantity: number,
    selectedOptions: { color?: string; capacity?: string }
  ) => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const router = useRouter();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedCapacity, setSelectedCapacity] = useState(
    product.capacities && product.capacities.length > 0 ? product.capacities[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Tích hợp Real API Wishlist đồng bộ toàn hệ thống
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, toggleWishlist, isLoading: isWishlistLoading } = useWishlistToggle();
  const isFavorite = isWishlisted(product);

  const addToCartMutation = useAddToCart();

  const chosenColor = product.colors?.[selectedColorIndex]?.name;

  // Tìm biến thể tương ứng từ database nếu có
  const matchedVariant = (product as any).variants?.find((v: any) => {
    const opts = (v.optionValues || {}) as Record<string, any>;
    const optValues = Object.values(opts).map((val) => String(val).toLowerCase());
    const matchColor = !chosenColor || optValues.includes(chosenColor.toLowerCase());
    const matchCap = !selectedCapacity || optValues.includes(selectedCapacity.toLowerCase());
    return matchColor && matchCap;
  }) || (product as any).variants?.[0];

  const currentPrice = matchedVariant ? matchedVariant.price : product.price;
  const currentOldPrice = matchedVariant?.compareAtPrice
    ? matchedVariant.compareAtPrice
    : product.oldPrice;

  const currentDiscount =
    currentOldPrice && currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : product.discountPercent;

  // Trích xuất các chính sách thực tế từ gian hàng (Shop Policies)
  const shop = (product as any).shop;
  const isHolidayMode = Boolean(shop?.holidayMode);
  const holidayMessage =
    shop?.holidayMessage || 'Gian hàng đang tạm thời nghỉ bán. Quý khách vui lòng quay lại sau!';

  const shippingBadge = shop?.enableFreeShipping
    ? shop.freeShippingThreshold
      ? `Freeship từ ${Number(shop.freeShippingThreshold).toLocaleString('vi-VN')}₫`
      : 'Freeship mọi đơn'
    : 'Giao hàng toàn quốc';

  const returnBadge =
    shop?.enableReturn !== false
      ? `Đổi trả ${shop?.returnPeriodDays ?? 7} ngày`
      : 'Không hỗ trợ đổi trả';

  let warrantyBadge = 'Bảo hành chính hãng';
  if (shop?.warrantyPeriodMonths && shop?.warrantyType !== 'NONE') {
    const typeLabel =
      shop.warrantyType === 'OFFICIAL'
        ? 'chính hãng'
        : shop.warrantyType === 'SHOP'
        ? 'tại shop'
        : shop.warrantyType === 'ELECTRONIC'
        ? 'điện tử'
        : '';
    warrantyBadge = `Bảo hành ${shop.warrantyPeriodMonths}T ${typeLabel}`.trim();
  } else if (shop?.warrantyPeriodMonths) {
    warrantyBadge = `Bảo hành ${shop.warrantyPeriodMonths} tháng`;
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (isHolidayMode) {
      toast.error('Gian hàng đang tạm nghỉ bán', {
        description: holidayMessage,
      });
      return;
    }

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }

    addToCartMutation.mutate(
      {
        variantId: matchedVariant?.id,
        productSlug: product.slug,
        quantity,
      },
      {
        onSuccess: () => {
          const details = [chosenColor, selectedCapacity].filter(Boolean).join(' - ');
          toast.success('Đã thêm vào giỏ hàng', {
            description: `${quantity}x ${product.name} ${details ? `(${details})` : ''}`,
          });
          onAddToCart?.(product, quantity, { color: chosenColor, capacity: selectedCapacity });
        },
        onError: (err) => {
          toast.error('Thêm vào giỏ thất bại', {
            description: extractErrorMessage(err, 'Không thể thêm sản phẩm vào giỏ hàng.'),
          });
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (isHolidayMode) {
      toast.error('Gian hàng đang tạm nghỉ bán', {
        description: holidayMessage,
      });
      return;
    }

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập', {
        description: 'Bạn cần đăng nhập để mua hàng.',
      });
      return;
    }

    setIsBuyingNow(true);
    addToCartMutation.mutate(
      {
        variantId: matchedVariant?.id,
        productSlug: product.slug,
        quantity,
      },
      {
        onSuccess: () => {
          setIsBuyingNow(false);
          router.push('/cart');
        },
        onError: (err) => {
          setIsBuyingNow(false);
          toast.error('Đặt mua thất bại', {
            description: extractErrorMessage(err, 'Không thể tiến hành mua hàng.'),
          });
        },
      }
    );
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <div className="space-y-4 sm:space-y-4.5 flex-1">
      {/* 1. Thương hiệu & Tên sản phẩm */}
      <div className="space-y-1">
        {product.brand && (
          <span className="text-[11px] font-medium text-gray-400 tracking-wider uppercase">
            {product.brand}
          </span>
        )}
        <h1 className="text-base sm:text-lg font-semibold text-gray-850 tracking-tight leading-snug">
          {product.name}
        </h1>

        {/* Đánh giá & Số lượng đã bán */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {product.rating ? (
              <>
                <span className="font-medium text-gray-700">{product.rating}</span>
                {product.reviewsCount !== undefined && product.reviewsCount !== null && (
                  <span>({product.reviewsCount} đánh giá)</span>
                )}
              </>
            ) : (
              <span className="text-gray-400 font-normal">Chưa có đánh giá</span>
            )}
          </div>

          <span className="text-gray-200">|</span>

          <div className="text-gray-500">
            {product.soldCount ? (
              <>
                <span>Đã bán </span>
                <span className="font-medium text-gray-700">{product.soldCount}</span>
                <span> sản phẩm</span>
              </>
            ) : (
              <span className="text-gray-400 font-normal">Chưa có lượt bán</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Khối Giá sản phẩm */}
      <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
        <span className="text-lg sm:text-xl font-bold text-emerald-600">
          {formatVND(currentPrice)}
        </span>

        {currentOldPrice && (
          <span className="text-xs text-gray-400 line-through">
            {formatVND(currentOldPrice)}
          </span>
        )}

        {Boolean(currentDiscount && currentDiscount > 0) && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-medium px-1.5 py-0.5 rounded">
            -{currentDiscount}%
          </span>
        )}
      </div>

      {/* 3. Đoạn mô tả ngắn gọn */}
      <p className="text-xs text-gray-500 leading-relaxed max-w-xl font-normal">
        {product.description || (
          <span className="text-gray-400 italic">Chưa có mô tả cho sản phẩm này.</span>
        )}
      </p>

      {/* Đường kẻ mờ */}
      <div className="h-px bg-gray-100 w-full" />

      {/* 4. Chọn Màu sắc (Color picker) */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">Màu sắc</span>
            <span className="text-gray-400 text-[11px]">
              {product.colors[selectedColorIndex]?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {product.colors.map((color, idx) => {
              const isSelected = selectedColorIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-offset-2 ring-emerald-600 scale-105' : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {/* Viền mỏng cho màu trắng / sáng */}
                  <span className="absolute inset-0 rounded-full border border-black/10" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Chọn Dung lượng (Capacity / Variant selector) */}
      {product.capacities && product.capacities.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-gray-600">Dung lượng</div>
          <div className="flex flex-wrap gap-2">
            {product.capacities.map((cap) => {
              const isSelected = selectedCapacity === cap;
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setSelectedCapacity(cap)}
                  className={`px-3 py-1.5 rounded-md text-xs transition cursor-pointer border ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-medium shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/60 font-normal'
                  }`}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Chọn Số lượng & Các nút hành động Mua hàng */}
      <div className="space-y-2.5 pt-1">
        {/* Banner cảnh báo Tạm nghỉ bán (Holiday Mode) */}
        {isHolidayMode && (
          <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Gian hàng đang tạm nghỉ bán</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">{holidayMessage}</p>
            </div>
          </div>
        )}

        <div className="text-xs font-medium text-gray-600">Số lượng</div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bộ điều khiển số lượng [- 1 +] */}
          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs h-9 sm:h-9.5">
            <button
              type="button"
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1 || isHolidayMode}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-medium text-xs text-gray-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncreaseQuantity}
              disabled={isHolidayMode}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nút Thêm vào giỏ hàng (Emerald Outline/Light) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || isHolidayMode}
            className={`flex-1 border text-xs font-medium h-9 sm:h-9.5 px-3 rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isHolidayMode
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75'
                : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-700 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed'
            }`}
          >
            {addToCartMutation.isPending && !isBuyingNow ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            <span>
              {isHolidayMode
                ? 'Tạm dừng nhận đơn'
                : addToCartMutation.isPending && !isBuyingNow
                ? 'Đang thêm...'
                : 'Thêm vào giỏ'}
            </span>
          </button>

          {/* Nút Mua ngay (Emerald Signature Solid CTA) */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={addToCartMutation.isPending || isHolidayMode}
            className={`flex-1 text-xs font-medium h-9 sm:h-9.5 px-3 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isHolidayMode
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-75'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed'
            }`}
          >
            {isBuyingNow ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className={`w-3.5 h-3.5 ${isHolidayMode ? 'text-gray-400' : 'fill-white'}`} />
            )}
            <span>
              {isHolidayMode
                ? 'Shop đang nghỉ'
                : isBuyingNow
                ? 'Đang chuyển...'
                : 'Mua ngay'}
            </span>
          </button>

          {/* Nút Yêu thích (Wishlist) */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`w-9 h-9 sm:w-9.5 sm:h-9.5 border rounded-lg transition cursor-pointer flex items-center justify-center disabled:opacity-50 shrink-0 ${
              isFavorite
                ? 'border-rose-200 bg-rose-50/50 text-rose-500'
                : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
            title={isFavorite ? 'Xóa khỏi yêu thích' : 'Lưu vào danh sách yêu thích'}
          >
            {isWishlistLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
            ) : (
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            )}
          </button>
        </div>
      </div>

      {/* 7. Các cam kết dịch vụ động theo chính sách của Shop */}
      <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-gray-500 font-normal">
        <div
          className="flex items-center gap-1.5 min-w-0"
          title={
            shop?.enableFreeShipping
              ? shop.freeShippingThreshold
                ? `Đơn hàng từ ${Number(shop.freeShippingThreshold).toLocaleString('vi-VN')}₫ được miễn phí vận chuyển`
                : 'Miễn phí vận chuyển cho mọi đơn hàng'
              : 'Giao hàng tận nơi toàn quốc'
          }
        >
          <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{shippingBadge}</span>
        </div>
        <div
          className="flex items-center gap-1.5 min-w-0"
          title={
            shop?.returnPolicyNote ||
            (shop?.requireUnboxVideo ? 'Yêu cầu có video quay khi mở hộp kiện hàng' : undefined)
          }
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{returnBadge}</span>
          {shop?.requireUnboxVideo && (
            <span className="text-[9px] px-1 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded shrink-0">
              Video
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1.5 min-w-0"
          title={shop?.warrantyPolicyNote || undefined}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{warrantyBadge}</span>
        </div>
      </div>
    </div>
  );
}
