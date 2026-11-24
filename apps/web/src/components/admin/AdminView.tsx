'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminShopsTab } from './AdminShopsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminReviewsTab } from './AdminReviewsTab';
import { AdminPayoutsTab } from './AdminPayoutsTab';
import { AdminVouchersTab } from './AdminVouchersTab';
import { Home, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmDeleteModal } from '@/components/common';
import { AdminTabType, ADMIN_TAB_LABELS } from './admin-types';

export function AdminView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, isLoggingOut } = useAuth();
  const displayName = user?.fullName || 'Quản trị viên';
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTabType | null;

  useEffect(() => {
    if (tabParam && ADMIN_TAB_LABELS[tabParam]) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (activeTab === 'overview' && query.trim()) {
      setActiveTab('shops');
    }
  };

  // Mở modal xác nhận đăng xuất
  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  // Xác nhận thực hiện đăng xuất
  const handleConfirmLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      setIsLogoutModalOpen(false);
      router.push('/login');
    } catch {
      queryClient.clear();
      setIsLogoutModalOpen(false);
      router.push('/login');
    }
  };

  const handleTabChange = (tab: AdminTabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* 1. Sidebar bên trái cố định */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 2. Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header trên cùng */}
        <AdminHeader
          userName={displayName}
          userEmail={user?.email}
          avatarUrl={user?.avatarUrl || (user as any)?.avatar}
          onSearch={handleGlobalSearch}
          onLogout={handleOpenLogoutModal}
          onNavigateTab={handleTabChange}
        />

        {/* Nội dung Admin chính */}
        <main className="flex-1 px-4 py-3.5 sm:px-6 sm:py-4 max-w-[1440px] w-full mx-auto overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {/* Breadcrumb động thay đổi linh hoạt theo từng mục chọn */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 select-none">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-emerald-600 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin</span>
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-semibold text-gray-800">
              {ADMIN_TAB_LABELS[activeTab]}
            </span>
          </div>

          {activeTab === 'overview' && (
            <AdminOverviewTab onNavigateTab={(tab) => handleTabChange(tab as AdminTabType)} />
          )}

          {activeTab === 'shops' && <AdminShopsTab initialSearch={globalSearch} />}

          {activeTab === 'products' && <AdminProductsTab />}

          {activeTab === 'categories' && <AdminCategoriesTab />}

          {activeTab === 'orders' && <AdminOrdersTab />}

          {activeTab === 'users' && <AdminUsersTab initialSearch={globalSearch} />}

          {activeTab === 'reviews' && <AdminReviewsTab />}

          {activeTab === 'payouts' && <AdminPayoutsTab />}

          {activeTab === 'vouchers' && <AdminVouchersTab />}
        </main>
      </div>

      {/* Modal xác nhận đăng xuất khỏi Admin Portal */}
      <ConfirmDeleteModal
        isOpen={isLogoutModalOpen}
        title="Đăng xuất khỏi Hệ Thống Quản Trị?"
        description="Bạn có chắc chắn muốn đăng xuất? Bạn sẽ cần đăng nhập lại tài khoản Quản trị viên để tiếp tục theo dõi vận hành sàn."
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        variant="danger"
        icon={<LogOut className="w-5 h-5" />}
        isLoading={isLoggingOut}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
