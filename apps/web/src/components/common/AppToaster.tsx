'use client';

import React from 'react';
import { Toaster as Sonner } from 'sonner';
import { Check, X, TriangleAlert, Info, Loader2 } from 'lucide-react';

const IconCircle = ({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) => (
  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
    {children}
  </span>
);

export function AppToaster() {
  return (
    <Sonner
      theme="light"
      position="top-right"
      offset={76}
      duration={3500}
      closeButton
      icons={{
        success: (
          <IconCircle tone="bg-emerald-50 text-emerald-600">
            <Check className="h-4 w-4" strokeWidth={2.4} />
          </IconCircle>
        ),
        error: (
          <IconCircle tone="bg-rose-50 text-rose-600">
            <X className="h-4 w-4" strokeWidth={2.4} />
          </IconCircle>
        ),
        warning: (
          <IconCircle tone="bg-amber-50 text-amber-600">
            <TriangleAlert className="h-4 w-4" strokeWidth={2.2} />
          </IconCircle>
        ),
        info: (
          <IconCircle tone="bg-sky-50 text-sky-600">
            <Info className="h-4 w-4" strokeWidth={2.2} />
          </IconCircle>
        ),
        
      }}
      toastOptions={{
        unstyled: true, // tắt style mặc định, dùng hoàn toàn class bên dưới
        classNames: {
          toast:
            'group relative flex w-[340px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-[#E8EEF0] bg-white p-3 shadow-lg shadow-gray-900/5',
          icon: 'mt-0.5 shrink-0',
          content: 'flex-1 min-w-0',
          title: 'text-[13px] font-semibold leading-snug text-gray-900',
          description: 'mt-0.5 text-xs leading-snug text-gray-500',
          closeButton:
            'absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-gray-700',
          actionButton:
            'ml-2 shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700',
          cancelButton:
            'ml-2 shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200',
        },
      }}
    />
  );
}
