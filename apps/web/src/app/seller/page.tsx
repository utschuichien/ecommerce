import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SellerView } from '../../components/seller/SellerView';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { BrandLoader } from '@/components/common/BrandLoader';

export const metadata: Metadata = {
  title: 'Kênh người bán | CommerceOS',
  description: 'Bảng điều khiển kinh doanh dành cho người bán trên sàn thương mại điện tử CommerceOS',
};

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <Suspense fallback={<BrandLoader fullScreen size="lg" message="Đang tải kênh người bán..." />}>
        <SellerView />
      </Suspense>
    </ProtectedRoute>
  );
}
