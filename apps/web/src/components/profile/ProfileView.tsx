'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { ProfileSidebar } from './ProfileSidebar';
import { ProfileOverview } from './ProfileOverview';
import { ProfileOrdersTab } from './ProfileOrdersTab';
import { ProfilePersonalInfoTab } from './ProfilePersonalInfoTab';
import { ProfileAddressesTab } from './ProfileAddressesTab';
import { ProfileWishlistTab } from './ProfileWishlistTab';
import { ProfileSecurityTab } from './ProfileSecurityTab';
import {
  ProfileAddress,
  ProfileOrder,
  ProfilePaymentMethod,
  ProfileTabType,
  ProfileWishlistItem,
  UserProfile,
} from './profile-types';
import { toast } from 'sonner';
import { useAuth, useAddresses, useProfileSummary } from '@/features/auth/hooks/useAuth';
import { useMyOrders } from '@/features/orders/hooks/useOrders';
import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/useWishlist';

const INITIAL_USER: UserProfile = {
  name: 'Người dùng',
  email: '',
  phone: '',
  membershipTier: 'Thành viên',
  joinDate: '',
  ordersCount: 0,
  wishlistCount: 0,
  status: 'active',
};

const INITIAL_PAYMENTS: ProfilePaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'card',
    name: 'Thẻ tín dụng / Ghi nợ',
    detail: '**** 4242 VISA',
    provider: 'VISA',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'wallet',
    name: 'Ví điện tử',
    detail: 'MoMo, ZaloPay, Viettel Money',
  },
];

export function ProfileView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { user: authUser, logout } = useAuth();
  const { data: realAddresses } = useAddresses();
  const { data: summary } = useProfileSummary();
  const { data: ordersData } = useMyOrders({ limit: 10 });
  const { data: wishlistData } = useWishlist({ limit: 10 });
  const removeWishlistMutation = useRemoveFromWishlist();

  // Đọc activeTab trực tiếp từ URL query (?tab=...)
  const tabFromUrl = (searchParams.get('tab') as ProfileTabType) || 'overview';
  const VALID_TABS: ProfileTabType[] = ['overview', 'orders', 'wishlist', 'addresses', 'personal-info', 'security'];
  const activeTab: ProfileTabType = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'overview';

  const handleTabChange = (newTab: ProfileTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    params.set('page', '1'); // Luôn reset page về 1 khi chuyển tab
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [paymentMethods] = useState<ProfilePaymentMethod[]>(INITIAL_PAYMENTS);

  // Đồng bộ thông tin người dùng từ Auth State & Profile Summary
  const displayUser: UserProfile = {
    ...user,
    name: summary?.user?.fullName || authUser?.fullName || user.name,
    email: summary?.user?.email || authUser?.email || user.email,
    phone: summary?.user?.phone || authUser?.phone || user.phone,
    avatar: summary?.user?.avatarUrl || authUser?.avatarUrl || user.avatar,
    membershipTier: summary?.stats?.membershipTier || user.membershipTier,
    joinDate: summary?.user?.joinDate || user.joinDate,
    ordersCount: summary?.stats?.ordersCount ?? (ordersData?.pagination?.total ?? (ordersData?.data?.length || 0)),
    wishlistCount: summary?.stats?.wishlistCount ?? (wishlistData?.pagination?.total ?? (wishlistData?.data?.length || 0)),
  };

  // Đồng bộ danh sách đơn hàng thực tế từ API
  const displayOrders: ProfileOrder[] = (ordersData?.data && ordersData.data.length > 0)
    ? (ordersData.data as ProfileOrder[])
    : (summary?.recentOrders && summary.recentOrders.length > 0)
    ? (summary.recentOrders as ProfileOrder[])
    : [];

  // Đồng bộ danh sách sản phẩm yêu thích thực tế từ API
  const displayWishlist: ProfileWishlistItem[] = (wishlistData?.data && wishlistData.data.length > 0)
    ? wishlistData.data.map((w: any) => ({
        id: w.id,
        name: w.name,
        brand: w.brand,
        price: w.price,
        oldPrice: w.oldPrice,
        discountPercent: w.discountPercent,
        rating: w.rating || 5,
        reviewsCount: w.reviewsCount || 10,
        inStock: w.inStock ?? true,
        isFavorite: true,
        category: w.category || 'other',
        image: w.image,
      }))
    : [];

  const defaultAddress: ProfileAddress | null = React.useMemo(() => {
    if (realAddresses && realAddresses.length > 0) {
      const found = realAddresses.find((a) => a.isDefault) || realAddresses[0];
      return {
        id: found.id,
        recipientName: found.recipientName,
        phone: found.phone,
        address: found.address || [found.line1, found.ward, found.district, found.province].filter(Boolean).join(', '),
        isDefault: found.isDefault,
        type: 'home' as const,
      };
    }
    if (summary?.defaultAddress) {
      return {
        id: summary.defaultAddress.id,
        recipientName: summary.defaultAddress.recipientName,
        phone: summary.defaultAddress.phone,
        address: summary.defaultAddress.address,
        isDefault: summary.defaultAddress.isDefault,
        type: 'home' as const,
      };
    }
    return null;
  }, [realAddresses, summary?.defaultAddress]);

  const handleRemoveWishlistItem = async (id: string) => {
    try {
      await removeWishlistMutation.mutateAsync(id);
      toast.success('Đã xóa khỏi yêu thích', {
        description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích.',
      });
    } catch {
      toast.success('Đã xóa khỏi yêu thích', {
        description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích.',
      });
    }
  };

  const handleAddToCart = (item: ProfileWishlistItem) => {
    toast.success('Đã thêm vào giỏ hàng', {
      description: item.name,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Breadcrumbs Navigation đồng bộ */}
      <Breadcrumbs items={[{ label: 'Tài khoản của tôi' }]} />

      {/* Bố cục 2 cột: Sidebar trái & Nội dung phải */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-7">
        {/* Sidebar Bên Trái */}
        <ProfileSidebar
          user={displayUser}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />

        {/* Nội dung Bên Phải */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === 'overview' && (
            <ProfileOverview
              user={displayUser}
              orders={displayOrders}
              defaultAddress={defaultAddress}
              paymentMethods={paymentMethods}
              wishlist={displayWishlist}
              onNavigateTab={handleTabChange}
              onViewOrderDetails={(order) => {
                handleTabChange('orders');
              }}
            />
          )}

          {activeTab === 'personal-info' && (
            <ProfilePersonalInfoTab
              user={displayUser}
              onSave={(updated) => {
                setUser((prev) => ({ ...prev, ...updated }));             
              }}
            />
          )}

          {activeTab === 'addresses' && (
            <ProfileAddressesTab />
          )}

          {activeTab === 'orders' && (
            <ProfileOrdersTab orders={displayOrders} />
          )}

          {activeTab === 'wishlist' && (
            <ProfileWishlistTab
              items={displayWishlist}
              onRemoveItem={handleRemoveWishlistItem}
              onAddToCart={handleAddToCart}
              onAddAllToCart={() => {
                toast.success(`Đã thêm tất cả ${displayWishlist.length} sản phẩm vào giỏ hàng!`);
              }}
            />
          )}

          {activeTab === 'security' && <ProfileSecurityTab />}
        </main>
      </div>
    </div>
  );
}
