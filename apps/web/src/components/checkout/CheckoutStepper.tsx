'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckoutStepperProps {
  currentStep: number; // 1: Địa chỉ, 2: Vận chuyển, 3: Thanh toán, 4: Hoàn tất
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, title: 'Địa chỉ giao hàng' },
  { step: 2, title: 'Vận chuyển' },
  { step: 3, title: 'Thanh toán' },
  { step: 4, title: 'Hoàn tất' },
];

export function CheckoutStepper({ currentStep, onStepClick }: CheckoutStepperProps) {
  const allDone = currentStep >= STEPS.length;

  return (
    <nav
      aria-label="Các bước thanh toán"
      className="w-full max-w-[640px] mx-auto px-8 sm:px-10 py-1"
    >
      <ol className="flex items-start pb-5 sm:pb-5">
        {STEPS.map((s, index) => {
          const isCurrent = currentStep === s.step && !allDone;
          const isCompleted = currentStep > s.step || allDone;
          const isNext = currentStep + 1 === s.step && !allDone;
          const clickable = !!onStepClick && s.step < currentStep && !allDone;

          const circleStyle = isCompleted
            ? 'bg-emerald-600 text-white'
            : isCurrent
            ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
            : isNext
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-400';

          const labelStyle = isCurrent
            ? 'font-medium text-emerald-700'
            : isCompleted
            ? 'font-medium text-gray-800'
            : isNext
            ? 'font-medium text-gray-600'
            : 'text-gray-400';

          const lineStyle =
            currentStep >= s.step || allDone
              ? 'bg-emerald-500'
              : 'bg-gray-200';

          const content = (
            <>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 sm:h-7 sm:w-7 sm:text-xs ${circleStyle}`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : s.step}
              </span>
              {/* Nhãn nằm tuyệt đối dưới vòng tròn để không làm rộng cột */}
              <span
                className={`absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs transition-colors ${labelStyle} ${
                  isCurrent ? '' : 'max-sm:sr-only'
                }`}
              >
                {s.title}
              </span>
            </>
          );

          return (
            <React.Fragment key={s.step}>
              <li aria-current={isCurrent ? 'step' : undefined} className="flex">
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(s.step)}
                    className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="relative">{content}</div>
                )}
              </li>

              {index < STEPS.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`mx-1.5 mt-[11px] h-0.5 flex-1 transition-colors duration-300 sm:mx-2 sm:mt-[13px] ${lineStyle}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}