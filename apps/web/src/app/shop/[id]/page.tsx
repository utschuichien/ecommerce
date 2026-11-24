import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';
import { ShopView } from '../../../components/shop/ShopView';

interface ShopDynamicPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ShopDynamicPageProps): Promise<Metadata> {
  const { id } = await params;
  const title = id
    ? `${id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | CommerceOS`
    : 'Gian hàng người bán | CommerceOS';

  return {
    title,
    description: 'Khám phá gian hàng chính hãng tại CommerceOS với hàng ngàn ưu đãi hấp dẫn.',
  };
}

function ShopLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 sm:h-52 bg-gray-200/80 rounded-2xl w-full" />
      <div className="h-10 bg-gray-200/80 rounded-xl w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200/70 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function ShopContent({ params }: ShopDynamicPageProps) {
  const { id } = await params;
  return <ShopView shopSlug={id} />;
}

export default function ShopDynamicPage({ params }: ShopDynamicPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-2">
        <Suspense fallback={<ShopLoadingSkeleton />}>
          <ShopContent params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
