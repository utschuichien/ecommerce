import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { ProfileView } from '../../components/profile/ProfileView';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Tài khoản của tôi | CommerceOS',
  description: 'Quản lý thông tin tài khoản, đơn hàng và danh sách yêu thích tại CommerceOS',
};

function ProfilePageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse pb-12">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-36 bg-gray-200 rounded" />

      {/* 2 Cột Skeleton */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-7">
        {/* Left Sidebar Skeleton */}
        <div className="w-full lg:w-72 shrink-0 bg-white border border-gray-100 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-3 w-36 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right Content Skeleton */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="h-20 bg-gray-100 rounded-xl" />
              <div className="h-20 bg-gray-100 rounded-xl" />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Header />

        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfileView />
          </Suspense>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
