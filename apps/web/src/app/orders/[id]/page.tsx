import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BrandLoader } from '@/components/common/BrandLoader';
import { OrderDetailView } from '@/features/orders/components/OrderDetailView';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng | CommerceOS',
  description:
    'Theo dõi tiến độ vận chuyển và thông tin chi tiết đơn hàng tại CommerceOS',
};

async function OrderDetailContent({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}

export default function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  return (
    <Suspense fallback={<BrandLoader fullScreen size="md" />}>
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
          <Header />

          <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5">
            <div className="mb-3">
              <Breadcrumbs
                items={[
                  { label: 'Tài khoản', href: '/profile' },
                  { label: 'Đơn mua', href: '/profile?tab=orders' },
                  { label: 'Chi tiết đơn hàng' },
                ]}
              />
            </div>

            <OrderDetailContent params={params} />
          </main>

          <Footer />
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}

