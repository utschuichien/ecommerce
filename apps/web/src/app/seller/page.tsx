import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SellerView } from '../../components/seller/SellerView';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Kênh người bán | CommerceOS',
  description: 'Bảng điều khiển kinh doanh dành cho người bán trên sàn thương mại điện tử CommerceOS',
};

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['SELLER']}>
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-xs text-gray-500">Đang tải...</div>}>
        <SellerView />
      </Suspense>
    </ProtectedRoute>
  );
}
