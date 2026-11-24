'use client';

import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderTimelineProps {
  status: string;
  uiStatus?: string;
  placedAt?: string;
  sellerOrders?: Array<{
    carrier?: string | null;
    trackingCode?: string | null;
    status: string;
  }>;
}

export function OrderTimeline({
  status,
  uiStatus,
  placedAt,
  sellerOrders = [],
}: OrderTimelineProps) {
  const isCancelled = status === 'CANCELLED' || uiStatus === 'CANCELLED';

  // Lấy carrier và trackingCode từ sellerOrder đầu tiên có thông tin
  const activeShipping = sellerOrders.find(
    (so) => so.carrier || so.trackingCode,
  );

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã vận đơn');
  };

  // Xác định bước hiện tại:
  let currentStep = 1;
  const normalizedStatus = (uiStatus || status).toUpperCase();

  if (normalizedStatus === 'DELIVERED' || normalizedStatus === 'COMPLETED') {
    currentStep = 4;
  } else if (
    normalizedStatus === 'SHIPPED' ||
    normalizedStatus === 'SHIPPING'
  ) {
    currentStep = 3;
  } else if (
    normalizedStatus === 'PROCESSING' ||
    normalizedStatus === 'CONFIRMED'
  ) {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  const steps = [
    {
      step: 1,
      title: 'Đặt hàng thành công',
      desc: placedAt
        ? new Date(placedAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })
        : 'Đã tiếp nhận',
      icon: CheckCircle2,
    },
    {
      step: 2,
      title: 'Đang chuẩn bị',
      desc: 'Shop đóng gói',
      icon: Package,
    },
    {
      step: 3,
      title: 'Đang vận chuyển',
      desc: activeShipping?.carrier || 'Đang giao hàng',
      icon: Truck,
    },
    {
      step: 4,
      title: 'Giao hàng thành công',
      desc: 'Đã nhận kiện hàng',
      icon: CheckCheck,
    },
  ];

  if (isCancelled) {
    return (
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-rose-800 text-xs sm:text-sm">
            Đơn hàng đã bị hủy
          </h4>
          <p className="text-[11px] sm:text-xs text-rose-600 mt-0.5">
            Mọi yêu cầu giữ hàng và mã giảm giá đã được hoàn trả theo quy định.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/70 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">
          Tiến độ giao hàng
        </h3>
        {activeShipping?.trackingCode && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-gray-400">Mã vận đơn:</span>
            <span className="font-mono font-medium text-gray-700 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded">
              {activeShipping.trackingCode}
            </span>
            <button
              type="button"
              onClick={() => copyTracking(activeShipping.trackingCode!)}
              className="text-gray-400 hover:text-emerald-600 transition cursor-pointer p-0.5"
              title="Sao chép"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative flex items-start justify-between px-2 sm:px-6">
        {/* Background Connecting Line */}
        <div className="absolute top-3.5 sm:top-4 left-6 sm:left-12 right-6 sm:right-12 h-0.5 bg-gray-100 z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${((Math.min(currentStep, 4) - 1) / 3) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((item) => {
          const isPassed = currentStep >= item.step;
          const isCurrent = currentStep === item.step;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className="relative z-10 flex flex-col items-center text-center max-w-[85px] sm:max-w-[110px]"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isPassed
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-3 ring-emerald-500/20' : ''}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span
                className={`text-[11px] sm:text-xs font-medium mt-2 leading-tight ${
                  isPassed ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {item.title}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 leading-tight hidden sm:block">
                {item.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
