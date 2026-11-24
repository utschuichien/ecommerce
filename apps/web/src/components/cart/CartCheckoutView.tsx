'use client';

import React, { useState } from 'react';
import { MOCK_CART_ITEMS } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';

interface CartCheckoutViewProps {
  onNavigateCatalog: () => void;
  onOrderSuccess: () => void;
}

export function CartCheckoutView({ onNavigateCatalog, onOrderSuccess }: CartCheckoutViewProps) {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  // Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 1000000;
  const shippingFee = 0;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof prev,
    );
  };

  const handlePlaceOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderDone(true);
      setTimeout(() => {
        onOrderSuccess();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart List & Summary (7 cols) */}
        <section className="lg:col-span-6 bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Giỏ hàng ({cartItems.length} sản phẩm)
            </h2>
            <button
              onClick={onNavigateCatalog}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              Tiếp tục mua sắm &rarr;
            </button>
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.variant}</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">{formatVND(item.price)}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden text-xs">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-2.5 font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right text-xs font-bold text-gray-900 w-24">
                  {formatVND(item.price * item.quantity)}
                </div>

                {/* Remove Trash */}
                <button
                  onClick={() => updateQty(item.id, -99)}
                  className="text-gray-400 hover:text-rose-500 p-1 transition"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal Summary Box */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-xs text-gray-600 border border-gray-100">
            <div className="flex justify-between">
              <span>Tổng tiền hàng</span>
              <span className="font-semibold text-gray-900">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Giảm giá</span>
              <span>-{formatVND(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-700 font-semibold">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-gray-950">
              <span>Tổng thanh toán</span>
              <span className="text-base text-emerald-800">{formatVND(grandTotal)}</span>
            </div>
          </div>
        </section>

        {/* Right Column: Checkout Form (6 cols) */}
        <section className="lg:col-span-6 bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Thanh toán</h2>
            {/* Step Indicators */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mt-2 border-b border-gray-100 pb-3">
              <span className="text-emerald-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                  1
                </span>
                Thông tin giao hàng
              </span>
              <span>&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[11px]">
                  2
                </span>
                Thanh toán
              </span>
              <span>&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[11px]">
                  3
                </span>
                Hoàn tất
              </span>
            </div>
          </div>

          {/* Delivery Form */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-gray-900">Thông tin nhận hàng</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Họ và tên *</label>
                <input
                  type="text"
                  defaultValue="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Số điện thoại *</label>
                <input
                  type="text"
                  defaultValue="0901 234 567"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">Địa chỉ *</label>
              <input
                type="text"
                placeholder="Số nhà, đường, phường/xã..."
                defaultValue="123 Đường Nguyễn Trãi, Phường 2"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Tỉnh/Thành phố *</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                  <option>Hà Nội</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Quận/Huyện *</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none">
                  <option>Quận Thanh Xuân</option>
                  <option>Quận Cầu Giấy</option>
                  <option>Quận Hoàn Kiếm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            <h3 className="font-bold text-gray-900">Phương thức thanh toán</h3>
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <strong className="block text-gray-900">Thanh toán khi nhận hàng (COD)</strong>
                  <span className="text-gray-500 text-[11px]">Kiểm tra hàng rồi thanh toán tiền mặt</span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('bank')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'bank'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <strong className="block text-gray-900">Thẻ quốc tế / Stripe Checkout</strong>
                  <span className="text-gray-500 text-[11px]">Thanh toán an toàn qua cổng trực tuyến</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition transform active:scale-98 flex items-center justify-center gap-2 text-sm"
            >
              {isOrdering ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Đang xử lý đơn hàng...</span>
                </>
              ) : (
                <span>Đặt hàng ngay ({formatVND(grandTotal)})</span>
              )}
            </button>
          </div>

          {orderDone && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn text-center">
              🎉 <strong>Đặt hàng thành công!</strong> Đang chuyển bạn đến trang quản lý đơn hàng...
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
