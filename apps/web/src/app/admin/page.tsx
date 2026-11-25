import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminView } from '../../components/admin';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { BrandLoader } from '@/components/common/BrandLoader';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | CommerceOS',
  description: 'Hệ thống quản trị sàn thương mại điện tử CommerceOS — Kiểm duyệt gian hàng, người dùng và danh mục',
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Suspense fallback={<BrandLoader fullScreen size="lg" message="Đang tải trang quản trị..." />}>
        <AdminView />
      </Suspense>
    </ProtectedRoute>
  );
}
