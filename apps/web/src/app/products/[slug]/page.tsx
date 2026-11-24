import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';
import { ProductDetailView } from '../../../components/product-detail/ProductDetailView';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    ? `${slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | CommerceOS`
    : 'Chi tiết sản phẩm | CommerceOS';

  return {
    title,
    description: 'Mua sắm sản phẩm chính hãng với giá tốt nhất tại CommerceOS.',
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6 pb-16 animate-pulse pt-2">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-gray-200/80 rounded" />

      {/* Grid 3 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-5 aspect-square bg-gray-200/70 rounded-lg w-full" />
        <div className="lg:col-span-4 space-y-4 w-full">
          <div className="h-4 w-24 bg-gray-200/80 rounded" />
          <div className="h-6 w-3/4 bg-gray-200/80 rounded" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
          <div className="h-8 w-1/3 bg-gray-200/80 rounded" />
          <div className="h-20 w-full bg-gray-100 rounded-lg" />
          <div className="h-10 w-full bg-gray-200/80 rounded-lg" />
        </div>
        <div className="lg:col-span-3 h-64 bg-gray-100 rounded-lg w-full" />
      </div>
    </div>
  );
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
