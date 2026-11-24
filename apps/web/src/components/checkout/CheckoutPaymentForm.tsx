'use client';

import React from 'react';
import { CreditCard, Banknote, QrCode, Smartphone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { PaymentMethodType, RecipientInfo, ShippingMethod } from './checkout-types';
import { formatVND } from '../../lib/api-client';

interface CheckoutPaymentFormProps {
  selectedPayment: PaymentMethodType;
  onSelectPayment: (method: PaymentMethodType) => void;
  recipient: RecipientInfo;
  selectedShipping: ShippingMethod;
  onBackToAddress: () => void;
}

const PAYMENT_METHODS: {
  id: PaymentMethodType;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Thanh toán tiền mặt cho nhân viên giao hàng khi nhận sản phẩm',
    icon: Banknote,
    badge: 'Khuyên dùng',
    disabled: false,
  },
  {
    id: 'vnpay',
    name: 'Cổng thanh toán VNPAY-QR',
    desc: 'Quét mã QR qua ứng dụng ngân hàng hoặc ví VNPAY nhanh chóng',
    icon: QrCode,
    badge: 'Sắp ra mắt',
    disabled: true,
  },
  {
    id: 'momo',
    name: 'Ví điện tử MoMo',
    desc: 'Liên kết ví MoMo để thanh toán 1 chạm an toàn',
    icon: Smartphone,
    badge: 'Sắp ra mắt',
    disabled: true,
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng (VietQR 24/7)',
    desc: 'Tự động xác nhận giao dịch qua mã QR chuyển khoản',
    icon: QrCode,
    badge: 'Sắp ra mắt',
    disabled: true,
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng / Thẻ ghi nợ quốc tế',
    desc: 'Hỗ trợ thẻ Visa, MasterCard, JCB phát hành tại Việt Nam và Quốc tế',
    icon: CreditCard,
    badge: 'Sắp ra mắt',
    disabled: true,
  },
];

export function CheckoutPaymentForm({
  selectedPayment,
  onSelectPayment,
  recipient,
  selectedShipping,
  onBackToAddress,
}: CheckoutPaymentFormProps) {
  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Tiêu đề phương thức thanh toán */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
          Phương thức thanh toán
        </h1>
        <p className="text-xs text-gray-500">
          Chọn một trong các hình thức thanh toán an toàn, bảo mật dưới đây.
        </p>
      </div>
      

      {/* Khối thanh toán */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Card tóm tắt nhanh địa chỉ & vận chuyển đã chọn */}
        <div className="bg-emerald-50/50 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm text-gray-700 flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-gray-900">{recipient.fullName}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">{recipient.phone}</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-xs">
              {[
                recipient.line1 || recipient.address,
                recipient.ward,
                recipient.district,
                recipient.province,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
            <p className="text-emerald-700 font-medium pt-0.5 text-xs">
              {selectedShipping.name} ({formatVND(selectedShipping.price)}) · {selectedShipping.estimate}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToAddress}
            className="text-xs font-semibold text-emerald-600 hover:underline shrink-0 cursor-pointer pt-0.5"
          >
            Thay đổi
          </button>
        </div>

        {/* Danh sách phương thức thanh toán */}
        <div className="space-y-2.5 pt-0.5">
          <h2 className="text-sm font-bold text-gray-900">
            Lựa chọn phương thức
          </h2>

          <div className="space-y-2">
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = selectedPayment === pm.id;
              const Icon = pm.icon;

              return (
                <div
                  key={pm.id}
                  onClick={() => !pm.disabled && onSelectPayment(pm.id)}
                  className={`flex items-start sm:items-center justify-between px-3 sm:px-3.5 py-3 rounded-xl border transition-all ${
                    pm.disabled
                      ? 'opacity-60 cursor-not-allowed bg-gray-50/70 border-gray-100'
                      : isSelected
                      ? 'border-emerald-500/80 bg-emerald-50/30 cursor-pointer'
                      : 'border-gray-200/70 hover:border-gray-300 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Radio Button */}
                  <div className="relative flex items-center justify-center mt-1 sm:mt-0 shrink-0">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={isSelected}
                      disabled={pm.disabled}
                      onChange={() => !pm.disabled && onSelectPayment(pm.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {pm.name}
                      </span>
                      {pm.badge && (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            pm.disabled
                              ? 'bg-gray-200/80 text-gray-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pm.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {pm.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cam kết bảo mật */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/80 p-3 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Mọi thông tin thanh toán của bạn đều được mã hóa chuẩn PCI-DSS cấp cao nhất.
          </span>
        </div>
      </div>
    </div>
  </div>
  );
}

