'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SellerSidebar } from './SellerSidebar';
import { SellerHeader } from './SellerHeader';
import { SellerDashboardOverview } from './SellerDashboardOverview';
import { SellerProductsTab } from './SellerProductsTab';
import { SellerOrdersTab } from './SellerOrdersTab';
import { SellerInventoryTab } from './SellerInventoryTab';
import { SellerVouchersTab } from './SellerVouchersTab';
import { SellerAnalyticsTab } from './SellerAnalyticsTab';
import { SellerSettingsTab } from './SellerSettingsTab';
import { Home, ChevronRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSellerShop } from '@/features/seller';
import { ConfirmDeleteModal } from '@/components/common';
import { SellerTabType } from './seller-types';

const TAB_LABELS: Record<SellerTabType, string> = {
  overview: 'Tổng quan',
  products: 'Quản lý sản phẩm',
  orders: 'Quản lý đơn hàng',
  inventory: 'Quản lý kho hàng',
  vouchers: 'Mã giảm giá',
  analytics: 'Thống kê & Doanh thu',
  settings: 'Cài đặt cửa hàng',
};

export function SellerView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: shop } = useSellerShop();
  const displayName = user?.fullName || 'Nguyễn Văn A';
  const storeName = shop?.name || 'My Store';
  const [activeTab, setActiveTab] = useState<SellerTabType>('overview');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SellerTabType | null;

  useEffect(() => {
    if (tabParam && TAB_LABELS[tabParam]) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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

  const handleTabChange = (tab: SellerTabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* 1. Sidebar bên trái cố định */}
      <SellerSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        storeName={storeName}
      />

      {/* 2. Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header trên cùng */}
        <SellerHeader
          userName={displayName}
          userEmail={user?.email}
          avatarUrl={user?.avatarUrl || (user as any)?.avatar}
          storeName={storeName}
          unreadNotifications={3}
          onLogout={handleOpenLogoutModal}
          onNavigateTab={handleTabChange}
          onSearch={(query) => {
            console.log('Search query:', query);
          }}
        />

        {/* Nội dung Dashboard chính */}
        <main className="flex-1 px-4 py-3.5 sm:px-6 sm:py-4 max-w-[1440px] w-full mx-auto overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {/* Breadcrumb động thay đổi linh hoạt theo từng mục chọn */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 select-none">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-emerald-600 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seller</span>
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-semibold text-gray-800">
              {TAB_LABELS[activeTab]}
            </span>
          </div>

          {activeTab === 'overview' && (
            <SellerDashboardOverview
              userName={displayName}
              onNavigateTab={(tab) => handleTabChange(tab as SellerTabType)}
            />
          )}

          {activeTab === 'products' && <SellerProductsTab />}

          {activeTab === 'orders' && <SellerOrdersTab />}

          {activeTab === 'inventory' && <SellerInventoryTab />}

          {activeTab === 'vouchers' && <SellerVouchersTab />}

          {activeTab === 'analytics' && (
            <SellerAnalyticsTab onNavigateTab={(tab) => handleTabChange(tab)} />
          )}

          {activeTab === 'settings' && <SellerSettingsTab />}
        </main>
      </div>

      {/* Modal xác nhận đăng xuất khỏi Kênh Người Bán */}
      <ConfirmDeleteModal
        isOpen={isLogoutModalOpen}
        title="Đăng xuất khỏi Kênh Người Bán?"
        description="Bạn có chắc chắn muốn đăng xuất? Bạn sẽ cần đăng nhập lại tài khoản để tiếp tục quản lý gian hàng và đơn hàng."
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
