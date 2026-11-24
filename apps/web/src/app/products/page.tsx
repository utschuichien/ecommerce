'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { CatalogView } from '../../components/catalog/CatalogView';

function CatalogPageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse pb-16">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-44 bg-gray-100 rounded" />

      {/* Main layout 2 cột */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar Skeleton (desktop) */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 bg-gray-100 rounded" />
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-100 rounded" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* Right Content Skeleton */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Top header bar */}
          <div className="bg-white border border-gray-100 rounded-lg p-3 flex items-center justify-between">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 bg-gray-100 rounded" />
              <div className="h-8 w-16 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Product Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-3.5 space-y-3">
                <div className="w-full aspect-square bg-gray-100 rounded-md" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-3 w-10 bg-gray-100 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-gray-200 rounded" />
                  <div className="h-3.5 w-2/3 bg-gray-200 rounded" />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2.5">
        <Suspense fallback={<CatalogPageSkeleton />}>
          <CatalogView
            onSelectProduct={(product) => {
              router.push(`/products/${product.slug}`);
            }}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
