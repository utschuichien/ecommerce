import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminView } from '../../components/admin';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Quản trị hệ thống | CommerceOS',
  description: 'Hệ thống quản trị sàn thương mại điện tử CommerceOS — Kiểm duyệt gian hàng, người dùng và danh mục',
};

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-xs text-gray-500">Đang tải...</div>}>
        <AdminView />
      </Suspense>
    </ProtectedRoute>
  );
}
