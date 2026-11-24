'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { customZodResolver } from '@/lib/zod-resolver';
import {
  sellerGeneralSchema,
  SellerGeneralFormData,
  sellerBrandingSchema,
  SellerBrandingFormData,
  sellerShippingSchema,
  SellerShippingFormData,
  sellerPolicySchema,
  SellerPolicyFormData,
} from '@/features/seller/schemas/seller-settings.schema';
import {
  Settings,
  Save,
  Store,
  Image as ImageIcon,
  Truck,
  Mail,
  Phone,
  MapPin,
  Info,
  Eye,
  ExternalLink,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  Clock,
  Calendar,
  Share2,
  ChevronDown,
  CheckCircle2,
  Star,
  SlidersHorizontal,
  LayoutGrid,
  Globe,
  Play,
  Music2,
  AtSign,
  Loader2,
  Upload,
  Trash2,
  Camera,
  Sparkles,
  BadgeCheck,
  RefreshCw,
  PackageCheck,
  BadgePercent,
  Warehouse,
  Zap,
  RotateCcw,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { DEFAULT_SELLER_AVATAR, DEFAULT_SHOP_BANNER } from '@/constants/default-images';
import { toast } from 'sonner';
import {
  useSellerShop,
  useUpdateSellerShop,
  useUploadShopLogo,
  useUploadShopBanner,
} from '@/features/seller';

type SettingsTab =
  | 'general'
  | 'branding'
  | 'shipping'
  | 'policies';

// Helpers lấy dữ liệu khởi tạo chuẩn từ API (không dùng mock mẫu)
const getInitialGeneralData = (shop: any): SellerGeneralFormData => ({
  name: shop?.name || '',
  description: shop?.description || '',
  category: shop?.category || 'Điện tử - Công nghệ',
  email: shop?.email || '',
  phone: shop?.phone || '',
  address: shop?.address || '',
  allowOrders: shop?.allowOrders ?? true,
  showOutOfStock: shop?.showOutOfStock ?? false,
  requireAuthCheckout: shop?.requireAuthCheckout ?? true,
  operatingType: (shop?.operatingType as 'always' | 'custom') || 'always',
  openTime: shop?.openTime || '08:00',
  closeTime: shop?.closeTime || '22:00',
  facebookUrl: shop?.facebookUrl || '',
  youtubeUrl: shop?.youtubeUrl || '',
  tiktokUrl: shop?.tiktokUrl || '',
  xUrl: shop?.xUrl || '',
});

const getInitialBrandingData = (shop: any): SellerBrandingFormData => ({
  logoKey: shop?.logoUrl || '',
  bannerUrl: shop?.bannerUrl || '',
  slogan: shop?.slogan || '',
  brandStory: shop?.brandStory || '',
});

const getInitialShippingData = (shop: any): SellerShippingFormData => {
  let parsedCarriers = { ghn: false, ghtk: false, viettelPost: false, express: false };
  if (shop?.supportedCarriers) {
    try {
      const parsed = JSON.parse(shop.supportedCarriers);
      if (typeof parsed === 'object' && parsed !== null) {
        parsedCarriers = { ...parsedCarriers, ...parsed };
      }
    } catch {
      // ignore
    }
  }
  return {
    flatShippingFee: shop?.flatShippingFee !== undefined ? Number(shop.flatShippingFee) : 0,
    enableFreeShipping: shop?.enableFreeShipping ?? false,
    freeShippingThreshold:
      shop?.freeShippingThreshold !== undefined ? Number(shop.freeShippingThreshold) : 0,
    pickupContactName: shop?.pickupContactName || '',
    pickupPhone: shop?.pickupPhone || '',
    pickupAddress: shop?.pickupAddress || '',
    pickupNote: shop?.pickupNote || '',
    carriers: parsedCarriers,
    allowInspection: shop?.allowInspection ?? true,
    dispatchTime: (shop?.dispatchTime as '24h' | '48h') || '24h',
  };
};

const getInitialPolicyData = (shop: any): SellerPolicyFormData => ({
  holidayMode: shop?.holidayMode ?? false,
  holidayMessage: shop?.holidayMessage || '',
  enableReturn: shop?.enableReturn ?? true,
  returnPeriodDays: shop?.returnPeriodDays !== undefined ? Number(shop.returnPeriodDays) : 7,
  requireUnboxVideo: shop?.requireUnboxVideo ?? true,
  returnPolicyNote:
    shop?.returnPolicyNote ||
    'Sản phẩm còn nguyên tem mác, nguyên seal, chưa qua sử dụng và có video quay lúc mở kiện hàng.',
  warrantyType: (shop?.warrantyType as any) || 'shop',
  warrantyPeriodMonths: shop?.warrantyPeriodMonths !== undefined ? Number(shop.warrantyPeriodMonths) : 12,
  warrantyPolicyNote:
    shop?.warrantyPolicyNote ||
    'Bảo hành các lỗi kỹ thuật từ nhà sản xuất. Không bảo hành các trường hợp rơi vỡ, cấn móp hoặc vào nước.',
});

export function SellerSettingsTab() {
  const [currentTab, setCurrentTab] = useState<SettingsTab>('general');
  const { data: shop, isLoading } = useSellerShop();
  const updateShop = useUpdateSellerShop();
  const uploadLogoMutation = useUploadShopLogo();
  const uploadBannerMutation = useUploadShopBanner();
  const isSaving = updateShop.isPending;
  const isUploadingLogo = uploadLogoMutation.isPending;
  const isUploadingBanner = uploadBannerMutation.isPending;

  // File input refs
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  // 1. React Hook Form cho Tab Thông tin chung (General)
  const {
    register: registerGeneral,
    handleSubmit: handleSubmitGeneral,
    watch: watchGeneral,
    reset: resetGeneral,
    setValue: setValueGeneral,
    formState: { errors: generalErrors, isDirty: isDirtyGeneral },
  } = useForm<SellerGeneralFormData>({
    resolver: customZodResolver(sellerGeneralSchema),
    defaultValues: getInitialGeneralData(shop),
    mode: 'onTouched',
  });

  // 2. React Hook Form cho Tab Hình ảnh & Thương hiệu (Branding)
  const {
    register: registerBranding,
    handleSubmit: handleSubmitBranding,
    watch: watchBranding,
    reset: resetBranding,
    setValue: setValueBranding,
    formState: { errors: brandingErrors, isDirty: isDirtyBranding },
  } = useForm<SellerBrandingFormData>({
    resolver: customZodResolver(sellerBrandingSchema),
    defaultValues: getInitialBrandingData(shop),
    mode: 'onTouched',
  });

  // 3. React Hook Form cho Tab Vận chuyển (Shipping)
  const {
    register: registerShipping,
    handleSubmit: handleSubmitShipping,
    watch: watchShipping,
    reset: resetShipping,
    setValue: setValueShipping,
    formState: { errors: shippingErrors, isDirty: isDirtyShipping },
  } = useForm<SellerShippingFormData>({
    resolver: customZodResolver(sellerShippingSchema),
    defaultValues: getInitialShippingData(shop),
    mode: 'onTouched',
  });

  // 4. React Hook Form cho Tab Chính sách cửa hàng (Policies)
  const {
    register: registerPolicy,
    handleSubmit: handleSubmitPolicy,
    watch: watchPolicy,
    reset: resetPolicy,
    setValue: setValuePolicy,
    formState: { errors: policyErrors, isDirty: isDirtyPolicy },
  } = useForm<SellerPolicyFormData>({
    resolver: customZodResolver(sellerPolicySchema),
    defaultValues: getInitialPolicyData(shop),
    mode: 'onTouched',
  });

  // Theo dõi dữ liệu thời gian thực (Live Preview)
  const watchedGeneral = watchGeneral();
  const watchedBranding = watchBranding();
  const watchedShipping = watchShipping();
  const watchedPolicy = watchPolicy();

  // Đồng bộ dữ liệu khi shop được tải từ API
  useEffect(() => {
    if (shop) {
      resetGeneral(getInitialGeneralData(shop));
      resetBranding(getInitialBrandingData(shop));
      resetShipping(getInitialShippingData(shop));
      resetPolicy(getInitialPolicyData(shop));
    }
  }, [shop, resetGeneral, resetBranding, resetShipping, resetPolicy]);

  // Upload Logo trực tiếp lên Cloudinary
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 5MB');
      return;
    }
    try {
      const res = await uploadLogoMutation.mutateAsync(file);
      setValueBranding('logoKey', res.url, { shouldDirty: true });
      toast.success('Tải logo lên thành công!');
    } catch (err: any) {
      toast.error('Tải logo thất bại', {
        description: err?.response?.data?.message || 'Không thể tải ảnh logo lên.',
      });
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Upload Banner / Ảnh bìa trực tiếp lên Cloudinary
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh bìa tối đa 5MB');
      return;
    }
    try {
      const res = await uploadBannerMutation.mutateAsync(file);
      setValueBranding('bannerUrl', res.url, { shouldDirty: true });
      toast.success('Tải ảnh bìa lên thành công!');
    } catch (err: any) {
      toast.error('Tải ảnh bìa thất bại', {
        description: err?.response?.data?.message || 'Không thể tải ảnh bìa lên.',
      });
    } finally {
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // 1. Submit độc lập cho Tab Thông tin chung (General)
  const onSaveGeneral = handleSubmitGeneral(async (data) => {
    try {
      await updateShop.mutateAsync(data);
      resetGeneral(data);
      toast.success('Lưu thông tin chung thành công!', {
        description: 'Thông tin cơ bản của gian hàng đã được cập nhật.',
      });
    } catch (err: any) {
      toast.error('Lưu thông tin thất bại', {
        description: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.',
      });
    }
  });

  // 2. Submit độc lập cho Tab Hình ảnh & Thương hiệu (Branding)
  const onSaveBranding = handleSubmitBranding(async (data) => {
    try {
      await updateShop.mutateAsync(data);
      resetBranding(data);
      toast.success('Lưu thương hiệu thành công!', {
        description: 'Logo, ảnh bìa banner, slogan và câu chuyện thương hiệu đã được cập nhật.',
      });
    } catch (err: any) {
      toast.error('Lưu thương hiệu thất bại', {
        description: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thương hiệu.',
      });
    }
  });

  // 3. Submit độc lập cho Tab Vận chuyển (Shipping)
  const onSaveShipping = handleSubmitShipping(async (data) => {
    try {
      await updateShop.mutateAsync({
        ...data,
        supportedCarriers: JSON.stringify(data.carriers),
      });
      resetShipping(data);
      toast.success('Lưu cấu hình vận chuyển thành công!', {
        description: 'Biểu phí, chính sách freeship và thông tin kho xuất hàng đã được cập nhật.',
      });
    } catch (err: any) {
      toast.error('Lưu cấu hình vận chuyển thất bại', {
        description: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình vận chuyển.',
      });
    }
  });

  // 4. Submit độc lập cho Tab Chính sách (Policies)
  const onSavePolicy = handleSubmitPolicy(async (data) => {
    try {
      await updateShop.mutateAsync(data as any);
      resetPolicy(data);
      toast.success('Lưu chính sách thành công!', {
        description: 'Chính sách bảo hành, đổi trả và chế độ tạm nghỉ đã được cập nhật.',
      });
    } catch (err: any) {
      toast.error('Lưu chính sách thất bại', {
        description: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu chính sách.',
      });
    }
  });

  // Dispatcher lưu theo tab hiện tại
  const handleSaveCurrentTab = () => {
    if (currentTab === 'general') return onSaveGeneral();
    if (currentTab === 'branding') return onSaveBranding();
    if (currentTab === 'shipping') return onSaveShipping();
    if (currentTab === 'policies') return onSavePolicy();
    toast.info('Tab này hiện chưa có cài đặt cần lưu.');
  };

  // Hoàn tác các thay đổi chưa lưu về giá trị gốc của shop
  const handleDiscardCurrentTab = () => {
    if (currentTab === 'general') {
      resetGeneral(getInitialGeneralData(shop));
      
      return;
    }
    if (currentTab === 'branding') {
      resetBranding(getInitialBrandingData(shop));
      return;
    }
    if (currentTab === 'shipping') {
      resetShipping(getInitialShippingData(shop));
      return;
    }
    if (currentTab === 'policies') {
      resetPolicy(getInitialPolicyData(shop));
      return;
    }
  };

  // Lấy tên hiển thị của tab
  const getTabTitle = (tab: SettingsTab) => {
    switch (tab) {
      case 'general':
        return 'Thông tin chung';
      case 'branding':
        return 'Hình ảnh & Thương hiệu';
      case 'shipping':
        return 'Vận chuyển';
      case 'policies':
        return 'Chính sách cửa hàng';
      default:
        return 'Cài đặt';
    }
  };

  // Kiểm tra tab hiện tại có thay đổi chưa lưu hay không (Phong cách Shopify)
  const isCurrentTabDirty =
    (currentTab === 'general' && isDirtyGeneral) ||
    (currentTab === 'branding' && isDirtyBranding) ||
    (currentTab === 'shipping' && isDirtyShipping) ||
    (currentTab === 'policies' && isDirtyPolicy);

  // Hiển thị loading skeleton khi đang tải cấu hình shop từ server
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-gray-100 rounded-xl p-12 text-gray-500 shadow-2xs animate-in fade-in duration-200">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <p className="text-xs font-medium text-gray-600">Đang tải cấu hình cửa hàng từ hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-24 animate-in fade-in duration-200 text-xs">
      {/* 1. Header (Font chữ nhỏ gọn, tinh tế) */}
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 stroke-[2.2]" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Cài đặt cửa hàng
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Tùy chỉnh thông tin và cấu hình cửa hàng của bạn
          </p>
        </div>
      </div>

      {/* 2. Thanh Tabs Phân Mục Cài Đặt (4 Tab tinh gọn, BỎ BORDER, CÓ VẠCH GẠCH CHÂN XANH DƯỚI TAB ACTIVE) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-1.5 scrollbar-none border-b border-gray-200/70">
        {[
          { id: 'general', label: 'Thông tin chung', icon: Store },
          { id: 'branding', label: 'Hình ảnh & Thương hiệu', icon: ImageIcon },
          { id: 'shipping', label: 'Vận chuyển', icon: Truck },
          { id: 'policies', label: 'Chính sách cửa hàng', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <div key={tab.id} className="flex flex-col items-center shrink-0">
              <button
                type="button"
                onClick={() => setCurrentTab(tab.id as SettingsTab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 font-bold bg-emerald-50/40'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
              {/* Vạch gạch chân màu xanh ngọc dưới tab đang chọn, không viền border hộp */}
              {isActive ? (
                <div className="w-full h-[2.5px] bg-emerald-600 rounded-full mt-1 shadow-2xs" />
              ) : (
                <div className="w-full h-[2.5px] bg-transparent mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {currentTab === 'general' ? (
        <>
          {/* 3. Phần giữa: Thông tin cửa hàng (Trái) & Xem trước cửa hàng (Phải) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Cột trái: Form thông tin cửa hàng (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Thông tin cửa hàng
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Cập nhật thông tin cơ bản về cửa hàng của bạn
                </p>
              </div>

              <div className="space-y-4">
                {/* Tên cửa hàng */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 whitespace-nowrap pt-1.5">
                    Tên cửa hàng *
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={50}
                        {...registerGeneral('name')}
                        className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition pr-12 ${
                          generalErrors.name
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-gray-200 focus:border-emerald-500'
                        }`}
                        placeholder="Nhập tên cửa hàng của bạn..."
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono pointer-events-none">
                        {(watchedGeneral.name || '').length}/50
                      </span>
                    </div>
                    {generalErrors.name && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {generalErrors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mô tả cửa hàng */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 pt-1.5 whitespace-nowrap">
                    Mô tả cửa hàng
                  </label>
                  <div className="flex-1 min-w-0 relative">
                    <textarea
                      rows={3}
                      maxLength={500}
                      {...registerGeneral('description')}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition resize-none pb-5 leading-relaxed ${
                        generalErrors.description
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="Nhập mô tả ngắn gọn về cửa hàng của bạn..."
                    />
                    <span className="absolute right-2.5 bottom-1.5 text-[10px] text-gray-400 font-mono pointer-events-none">
                      {(watchedGeneral.description || '').length}/500
                    </span>
                    {generalErrors.description && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {generalErrors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Danh mục chính */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Danh mục chính
                  </label>
                  <div className="flex-1 min-w-0 relative flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <LayoutGrid className="w-3.5 h-3.5 text-sky-500 mr-2 shrink-0" />
                    <select
                      {...registerGeneral('category')}
                      className="w-full text-xs text-gray-800 bg-transparent focus:outline-none appearance-none cursor-pointer pr-5 font-normal"
                    >
                      <option value="Điện tử - Công nghệ">Điện tử - Công nghệ</option>
                      <option value="Thời trang & Phụ kiện">Thời trang & Phụ kiện</option>
                      <option value="Nhà cửa & Đời sống">Nhà cửa & Đời sống</option>
                      <option value="Làm đẹp & Sức khỏe">Làm đẹp & Sức khỏe</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Email liên hệ */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 whitespace-nowrap pt-1.5">
                    Email liên hệ
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                      <Mail className="w-3.5 h-3.5 text-sky-500 mr-2 shrink-0" />
                      <input
                        type="email"
                        {...registerGeneral('email')}
                        className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
                        placeholder="shop@example.com"
                      />
                    </div>
                    {generalErrors.email && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {generalErrors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 whitespace-nowrap pt-1.5">
                    Số điện thoại
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                      <Phone className="w-3.5 h-3.5 text-sky-500 mr-2 shrink-0" />
                      <input
                        type="tel"
                        {...registerGeneral('phone')}
                        className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
                        placeholder="Nhập số điện thoại liên hệ..."
                      />
                    </div>
                    {generalErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {generalErrors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Địa chỉ cửa hàng */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                  <label className="w-32 sm:w-36 shrink-0 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Địa chỉ cửa hàng
                  </label>
                  <div className="flex-1 min-w-0 relative flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      {...registerGeneral('address')}
                      className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
                      placeholder="Nhập địa chỉ cửa hàng..."
                    />
                  </div>
                </div>
              </div>

              {/* Box thông báo gợi ý xanh nhạt */}
              <div className="bg-[#ecfdf5] border border-emerald-100/90 rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-emerald-800">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Thông tin này sẽ được hiển thị trên trang cửa hàng của bạn.</span>
              </div>
            </div>

            {/* Cột phải: Xem trước cửa hàng (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Xem trước cửa hàng
                  </h3>
                </div>
                <a
                  href="/shop"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                >
                  <span>Xem trang cửa hàng</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Khung widget xem trước */}
              <div className="flex-1 flex flex-col border border-gray-100 rounded-xl p-3 sm:p-3.5 bg-white space-y-3">
                {/* Header shop preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar Shop xanh lá logo CommerceOS hoặc ảnh Logo tải lên */}
                    <img
                      src={watchedBranding.logoKey || shop?.logoUrl || DEFAULT_SELLER_AVATAR}
                      alt={watchedGeneral.name || 'Cửa hàng'}
                      className="w-9 h-9 rounded-xl object-cover border border-emerald-200/80 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-900 text-xs truncate">
                          {watchedGeneral.name || shop?.name || 'Chưa đặt tên'}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 text-white shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-gray-700">4.8</span>
                        <span>(12k đánh giá)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-md text-[11px] font-semibold transition cursor-pointer shrink-0"
                  >
                    Theo dõi
                  </button>
                </div>

                {/* Banner Quảng Cáo Hero trong khung Xem trước (Cân đối chiều cao, lấp đầy tự nhiên) */}
                <div className="flex-1 rounded-xl bg-gradient-to-r from-[#dcfce7] via-[#ecfdf5] to-[#f0fdf4] border border-emerald-100/60 p-4 sm:p-4.5 flex items-center justify-between relative overflow-hidden min-h-[190px]">
                  <div className="relative z-10 max-w-[55%] space-y-1.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
                      Khám phá <br />
                      Sản phẩm tuyệt vời
                    </h4>
                    <p className="text-[10px] text-gray-600 font-medium">
                      Chất lượng tạo nên giá trị
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-full shadow-2xs transition mt-2 cursor-pointer whitespace-nowrap"
                    >
                      <span>Mua sắm ngay</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Ảnh sản phẩm tai nghe trắng + cây cảnh */}
                  <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                    <img
                      src="/images/store-preview-headphones.jpg"
                      alt="Tai nghe cao cấp"
                      className="w-full h-full object-contain drop-shadow-md rounded-xl"
                    />
                  </div>

                  {/* 3 chấm carousel indicator ở góc dưới */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <span className="w-2.5 h-1 rounded-full bg-emerald-600" />
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Hàng dưới: 3 Khối Cấu hình - Thời gian - Mạng xã hội (3 Cột) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Cột 1: Cấu hình cửa hàng */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Cấu hình cửa hàng
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Tùy chỉnh các thiết lập hoạt động của cửa hàng
                </p>
              </div>

              <div className="space-y-3 pt-0.5">
                {/* Toggle 1: Cho phép đặt hàng */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <ShoppingCart className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        Cho phép đặt hàng
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Bật/tắt khả năng đặt hàng trên cửa hàng
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValueGeneral('allowOrders', !watchedGeneral.allowOrders, { shouldDirty: true })}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedGeneral.allowOrders ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedGeneral.allowOrders ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Hiển thị sản phẩm đã hết hàng */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <Eye className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        Hiển thị sản phẩm đã hết hàng
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Cho phép hiển thị sản phẩm hết hàng
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValueGeneral('showOutOfStock', !watchedGeneral.showOutOfStock, { shouldDirty: true })}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedGeneral.showOutOfStock ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedGeneral.showOutOfStock ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Yêu cầu xác thực khi thanh toán */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        Yêu cầu xác thực khi thanh toán
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Bắt buộc đăng nhập để mua hàng
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValueGeneral('requireAuthCheckout', !watchedGeneral.requireAuthCheckout, { shouldDirty: true })}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedGeneral.requireAuthCheckout ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedGeneral.requireAuthCheckout ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Cột 2: Thời gian hoạt động */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Thời gian hoạt động
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Thiết lập thời gian cửa hàng hoạt động
                </p>
              </div>

              <div className="space-y-2.5 pt-0.5">
                {/* Lựa chọn 1: Luôn mở cửa */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setValueGeneral('operatingType', 'always', { shouldDirty: true })}
                    className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5"
                  >
                    {watchedGeneral.operatingType === 'always' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div onClick={() => setValueGeneral('operatingType', 'always', { shouldDirty: true })}>
                    <p className="text-xs font-semibold text-gray-900">Luôn mở cửa</p>
                    <p className="text-[10px] text-gray-400">Cửa hàng hoạt động 24/7</p>
                  </div>
                </label>

                {/* Lựa chọn 2: Theo khung giờ */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setValueGeneral('operatingType', 'custom', { shouldDirty: true })}
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      watchedGeneral.operatingType === 'custom'
                        ? 'border-emerald-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {watchedGeneral.operatingType === 'custom' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div onClick={() => setValueGeneral('operatingType', 'custom', { shouldDirty: true })}>
                    <p className="text-xs font-semibold text-gray-900">
                      Theo khung giờ
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Tùy chỉnh thời gian cụ thể
                    </p>
                  </div>
                </label>

                {/* Ô chọn khoảng thời gian */}
                <div className="bg-[#f8fafc] border border-slate-200/90 rounded-lg px-3 py-2 flex items-center justify-between text-[11px] text-gray-700 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="whitespace-nowrap">
                      Từ <strong>{watchedGeneral.openTime}</strong> → Đến <strong>{watchedGeneral.closeTime}</strong>
                    </span>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" />
                </div>
              </div>
            </div>

            {/* Cột 3: Liên kết mạng xã hội */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Liên kết mạng xã hội
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Kết nối với các kênh mạng xã hội
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Facebook */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    {...registerGeneral('facebookUrl')}
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Nhập link Facebook..."
                  />
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/80">
                    <Play className="w-3.5 h-3.5 fill-rose-600" />
                  </div>
                  <input
                    type="url"
                    {...registerGeneral('youtubeUrl')}
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Nhập link YouTube..."
                  />
                </div>

                {/* TikTok */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0 border border-gray-200">
                    <Music2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    {...registerGeneral('tiktokUrl')}
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Nhập link TikTok..."
                  />
                </div>

                {/* X (Twitter) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center shrink-0 border border-gray-200">
                    <AtSign className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    {...registerGeneral('xUrl')}
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
                    placeholder="Nhập link X (Twitter)..."
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : currentTab === 'branding' ? (
        <>
          {/* File input ẩn cho Logo và Banner */}
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
          />
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Cột trái: Cấu hình Logo, Banner & Khẩu hiệu (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3.5">
              {/* Card 1: Logo & Ảnh đại diện gian hàng */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Logo & Ảnh đại diện gian hàng
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                    Ảnh đại diện xuất hiện ở trang cửa hàng, giỏ hàng và chi tiết đơn hàng
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                  {/* Khung avatar preview */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border-2 border-emerald-100/80 shadow-xs shrink-0 flex items-center justify-center overflow-hidden group">
                    <img
                      src={watchedBranding.logoKey || shop?.logoUrl || DEFAULT_SELLER_AVATAR}
                      alt="Logo Shop"
                      className="w-full h-full object-cover"
                    />

                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Hành động & Hướng dẫn */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingLogo ? 'Đang tải lên...' : 'Tải ảnh logo'}</span>
                      </button>

                      {watchedBranding.logoKey && (
                        <button
                          type="button"
                          onClick={() => setValueBranding('logoKey', '', { shouldDirty: true })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Gỡ ảnh</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-500 leading-relaxed">
                      <p className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Định dạng hỗ trợ: PNG, JPG, WEBP (Tối đa 5MB)
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Kích thước chuẩn: Hình vuông tỷ lệ 1:1 (Khuyến nghị 300x300px trở lên)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Ảnh bìa Banner gian hàng */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Ảnh bìa Banner gian hàng
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                    Banner khổ rộng hiển thị nổi bật ở phần đầu trang gian hàng của bạn
                  </p>
                </div>

                {/* Banner preview */}
                <div className="space-y-3">
                  <div className="relative w-full aspect-[24/8] min-h-[140px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs group">
                    {watchedBranding.bannerUrl ? (
                      <img
                        src={watchedBranding.bannerUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/80 border border-dashed border-gray-200 text-gray-400 gap-1.5 p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-600">Chưa thiết lập ảnh bìa</p>
                        <p className="text-[10px] text-gray-400">Tải lên ảnh banner để nổi bật thương hiệu cửa hàng</p>
                      </div>
                    )}

                    {/* Gradient overlay preview với Tên shop & Slogan (chỉ khi có bannerUrl hoặc slogan) */}
                    {(watchedBranding.bannerUrl || watchedBranding.slogan) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40 flex items-center justify-end pr-5 pointer-events-none">
                        <div className="text-right text-white drop-shadow-md">
                          <p className="text-sm sm:text-base font-extrabold tracking-tight">
                            {watchedGeneral.name || shop?.name || 'Tên cửa hàng'}
                          </p>
                          {watchedBranding.slogan && (
                            <p className="text-[10px] sm:text-xs text-gray-100 italic mt-0.5 max-w-[200px]">
                              {watchedBranding.slogan}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {isUploadingBanner && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-medium">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang tải ảnh bìa lên Cloudinary...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploadingBanner}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
                      >
                        {isUploadingBanner ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingBanner ? 'Đang tải lên...' : 'Đổi ảnh bìa'}</span>
                      </button>

                      {watchedBranding.bannerUrl && (
                        <button
                          type="button"
                          onClick={() => setValueBranding('bannerUrl', '', { shouldDirty: true })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Dùng ảnh mặc định</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400">
                      Tỷ lệ khuyến nghị: <strong>4:1</strong> (1200x300px hoặc 1600x400px)
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Khẩu hiệu & Giới thiệu thương hiệu */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Khẩu hiệu & Thông điệp thương hiệu
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                    Thông điệp giúp khách hàng ghi nhớ thương hiệu và giá trị cốt lõi
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Slogan */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-gray-700">
                        Khẩu hiệu gian hàng (Slogan)
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {(watchedBranding.slogan || '').length}/80
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={80}
                      {...registerBranding('slogan')}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition ${
                        brandingErrors.slogan
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="Ví dụ: Công nghệ kiến tạo tương lai"
                    />
                    {brandingErrors.slogan && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {brandingErrors.slogan.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      Hiển thị trực tiếp trên góc phải Banner ở trang chi tiết cửa hàng.
                    </p>
                  </div>

                  {/* Brand Story */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-gray-700">
                        Câu chuyện thương hiệu / Cam kết dịch vụ
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {(watchedBranding.brandStory || '').length}/800
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={800}
                      {...registerBranding('brandStory')}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition resize-none leading-relaxed ${
                        brandingErrors.brandStory
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="Chia sẻ về hành trình, xuất xứ sản phẩm hoặc cam kết chính hãng của bạn..."
                    />
                    {brandingErrors.brandStory && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">
                        {brandingErrors.brandStory.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Xem trước giao diện gian hàng hoàn chỉnh (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Xem trước gian hàng
                    </h3>
                  </div>
                  <a
                    href={`/shop/${shop?.slug || 'apple-flagship-store'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                  >
                    <span>Xem trang thực tế</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[11px] text-gray-500">
                  Đây là cách giao diện đầu trang Shop sẽ hiển thị với khách hàng khi họ ghé thăm gian hàng của bạn.
                </p>

                {/* Khung mô phỏng Header chuẩn của Shop */}
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {/* Banner */}
                  <div className="relative w-full aspect-[24/8] min-h-[120px] bg-gray-100 overflow-hidden">
                    {watchedBranding.bannerUrl ? (
                      <img
                        src={watchedBranding.bannerUrl}
                        alt={watchedGeneral.name || 'Store'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100/80 text-gray-400 gap-1 p-2 text-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                        <span className="text-[10px] text-gray-400">Chưa có ảnh bìa</span>
                      </div>
                    )}
                    {(watchedBranding.bannerUrl || watchedBranding.slogan) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 flex items-center justify-end pr-4 pointer-events-none">
                        <div className="text-right text-white drop-shadow-md">
                          <p className="text-xs sm:text-sm font-extrabold tracking-tight">
                            {watchedGeneral.name || shop?.name || 'Tên cửa hàng'}
                          </p>
                          {watchedBranding.slogan && (
                            <p className="text-[9px] sm:text-[10px] text-gray-100 italic mt-0.5 max-w-[150px]">
                              {watchedBranding.slogan}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile info: Avatar tròn đè lên banner + thông tin bên dưới */}
                  <div className="px-3 pb-3 pt-0">
                    <div className="flex items-center gap-3">
                      {/* Avatar đè lên banner */}
                      <div className="relative w-14 h-14 rounded-full bg-white border-2 border-white ring-1 ring-black/5 shadow-md -mt-7 shrink-0 overflow-hidden z-10 flex items-center justify-center">
                        {watchedBranding.logoKey ? (
                          <img
                            src={watchedBranding.logoKey}
                            alt={watchedGeneral.name || 'Store'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                            {(watchedGeneral.name || shop?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Tên & badge */}
                      <div className="min-w-0 pt-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900 text-xs truncate">
                            {watchedGeneral.name || shop?.name || 'Tên cửa hàng'}
                          </span>
                          <BadgeCheck className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-700">4.8</span>
                          <span>(1.2k)</span>
                          <span>•</span>
                          <span>2.4k theo dõi</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 py-1.5 px-2.5 bg-gray-900 text-white text-[10px] font-semibold rounded-lg text-center"
                      >
                        + Theo dõi
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-1.5 px-2.5 border border-gray-200 text-gray-700 text-[10px] font-semibold rounded-lg text-center"
                      >
                        Nhắn tin
                      </button>
                    </div>
                  </div>
                </div>

                {/* Box mẹo tối ưu thương hiệu */}
                <div className="bg-[#ecfdf5] border border-emerald-100 rounded-lg p-3 space-y-1 text-emerald-900 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lợi ích thương hiệu chuyên nghiệp</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-relaxed pl-5">
                    Ảnh bìa rõ nét cùng logo nhận diện thương hiệu giúp tăng tỷ lệ chốt đơn và tạo ấn tượng uy tín với khách mua hàng trên sàn CommerceOS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : currentTab === 'shipping' ? (
        <>
          {/* Giao diện Tab Vận chuyển (Shipping) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Cột trái: Cấu hình Phí ship, Freeship & Kho hàng (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* 1. Biểu phí & Chính sách vận chuyển */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Biểu phí & Chính sách giao hàng
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Thiết lập phí ship mặc định áp dụng cho tất cả đơn hàng từ cửa hàng của bạn
                </p>
              </div>

              {/* Ô nhập phí ship cố định */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Phí vận chuyển tiêu chuẩn cho mỗi đơn hàng *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      {...registerShipping('flatShippingFee', { valueAsNumber: true })}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 font-semibold focus:outline-none transition pr-8 ${
                        shippingErrors.flatShippingFee
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="25000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      ₫
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setValueShipping('flatShippingFee', 0, { shouldDirty: true })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        watchedShipping.flatShippingFee === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Freeship (0đ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValueShipping('flatShippingFee', 20000, { shouldDirty: true })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        watchedShipping.flatShippingFee === 20000
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      20k
                    </button>
                    <button
                      type="button"
                      onClick={() => setValueShipping('flatShippingFee', 25000, { shouldDirty: true })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        watchedShipping.flatShippingFee === 25000
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      25k
                    </button>
                    <button
                      type="button"
                      onClick={() => setValueShipping('flatShippingFee', 30000, { shouldDirty: true })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        watchedShipping.flatShippingFee === 30000
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      30k
                    </button>
                  </div>
                </div>
                {shippingErrors.flatShippingFee && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {shippingErrors.flatShippingFee.message}
                  </p>
                )}
              </div>

              {/* Box Cấu hình Freeship trợ giá */}
              <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <BadgePercent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Chính sách Miễn phí vận chuyển từ Shop
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Tự động giảm 100% phí ship khi khách mua đủ giá trị tối thiểu
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('enableFreeShipping', !watchedShipping.enableFreeShipping, {
                        shouldDirty: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.enableFreeShipping ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.enableFreeShipping ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {watchedShipping.enableFreeShipping && (
                  <div className="pt-2 border-t border-emerald-100/80 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                      Miễn phí ship cho đơn hàng đạt từ:
                    </span>
                    <div className="relative w-44">
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        {...registerShipping('freeShippingThreshold', { valueAsNumber: true })}
                        className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-emerald-800 font-bold focus:outline-none transition pr-8 ${
                          shippingErrors.freeShippingThreshold
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-emerald-200 focus:border-emerald-500'
                        }`}
                        placeholder="300000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                        ₫
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      (Ví dụ: {Number(watchedShipping.freeShippingThreshold || 0).toLocaleString('vi-VN')}₫)
                    </span>
                  </div>
                )}
                {shippingErrors.freeShippingThreshold && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {shippingErrors.freeShippingThreshold.message}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Địa chỉ kho xuất hàng (Pickup Address) */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Địa chỉ kho xuất hàng & lấy hàng
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Địa điểm để bưu tá (shipper) tới nhận hàng khi bạn xác nhận gửi đơn
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Người liên hệ kho */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Người phụ trách kho *
                    </label>
                    <input
                      type="text"
                      {...registerShipping('pickupContactName')}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition ${
                        shippingErrors.pickupContactName
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="Nhập họ tên người phụ trách kho..."
                    />
                    {shippingErrors.pickupContactName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {shippingErrors.pickupContactName.message}
                      </p>
                    )}
                  </div>

                  {/* SĐT kho */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Số điện thoại hotline kho *
                    </label>
                    <input
                      type="tel"
                      {...registerShipping('pickupPhone')}
                      className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition ${
                        shippingErrors.pickupPhone
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-gray-200 focus:border-emerald-500'
                      }`}
                      placeholder="Nhập số điện thoại lấy hàng..."
                    />
                    {shippingErrors.pickupPhone && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {shippingErrors.pickupPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Địa chỉ chi tiết */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Địa chỉ kho bãi chi tiết *
                  </label>
                  <input
                    type="text"
                    {...registerShipping('pickupAddress')}
                    className={`w-full px-3 py-1.5 text-xs bg-white border rounded-lg text-gray-800 focus:outline-none transition ${
                      shippingErrors.pickupAddress
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-gray-200 focus:border-emerald-500'
                    }`}
                    placeholder="Nhập địa chỉ chi tiết kho xuất hàng..."
                  />
                  {shippingErrors.pickupAddress && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {shippingErrors.pickupAddress.message}
                    </p>
                  )}
                </div>

                {/* Ghi chú shipper */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Ghi chú lấy hàng cho shipper
                  </label>
                  <textarea
                    rows={2}
                    {...registerShipping('pickupNote')}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                    placeholder="Ghi chú thêm cho bưu tá (ví dụ: kho trong ngõ, gọi trước 15 phút)..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Quy định đóng gói & Giao nhận */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Quy định đóng gói & Giao nhận
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Thiết lập tiêu chuẩn cam kết thời gian chuẩn bị và chính sách nhận hàng
                </p>
              </div>

              <div className="space-y-3 pt-0.5">
                {/* Thời gian chuẩn bị */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 ">
                    Thời gian chuẩn bị và gửi hàng dự kiến
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                    <label
                      onClick={() => setValueShipping('dispatchTime', '24h', { shouldDirty: true })}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        watchedShipping.dispatchTime === '24h'
                          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        {watchedShipping.dispatchTime === '24h' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900">Trong vòng 24 giờ</p>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                            Chuẩn giao nhanh
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Tăng cơ hội hiển thị ưu tiên trên sàn
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setValueShipping('dispatchTime', '48h', { shouldDirty: true })}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                        watchedShipping.dispatchTime === '48h'
                          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500/20'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        {watchedShipping.dispatchTime === '48h' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900">Trong vòng 48 giờ</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Phù hợp sản phẩm thủ công, đặt làm riêng
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Đồng kiểm */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">
                      Cho phép đồng kiểm khi giao hàng
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Người mua được kiểm tra ngoại quan gói hàng trước khi nhận & thanh toán
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('allowInspection', !watchedShipping.allowInspection, {
                        shouldDirty: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.allowInspection ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.allowInspection ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Đối tác vận chuyển & Xem trước (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Đối tác vận chuyển */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Đơn vị vận chuyển liên kết
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 pl-5">
                  Bật/tắt các đối tác vận chuyển mà shop muốn tiếp nhận đơn
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* GHN */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-600 font-black text-[10px] flex items-center justify-center shrink-0">
                      GHN
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        Giao Hàng Nhanh (GHN)
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Giao 1 - 3 ngày • Mạng lưới toàn quốc
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('carriers.ghn', !watchedShipping.carriers?.ghn, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.carriers?.ghn ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.carriers?.ghn ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* GHTK */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0">
                      GHTK
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        Giao Hàng Tiết Kiệm (GHTK)
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Giao 1 - 3 ngày • Tối ưu chi phí
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('carriers.ghtk', !watchedShipping.carriers?.ghtk, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.carriers?.ghtk ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.carriers?.ghtk ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Viettel Post */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200/80 text-red-600 font-black text-[10px] flex items-center justify-center shrink-0">
                      VTPost
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        Viettel Post
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Giao 2 - 4 ngày • Phủ sóng huyện xã
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('carriers.viettelPost', !watchedShipping.carriers?.viettelPost, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.carriers?.viettelPost ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.carriers?.viettelPost ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Hỏa tốc */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200/80 text-purple-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-purple-600 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        Hỏa tốc nội thành (2H - 4H)
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Giao siêu tốc trong ngày (Hà Nội & TP.HCM)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setValueShipping('carriers.express', !watchedShipping.carriers?.express, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      watchedShipping.carriers?.express ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        watchedShipping.carriers?.express ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              {shippingErrors.carriers && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {shippingErrors.carriers.message || (shippingErrors.carriers as any)?.root?.message}
                </p>
              )}
            </div>

            {/* Live Preview Giỏ hàng */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                  Xem trước dòng phí vận chuyển
                </h3>
              </div>
              <p className="text-[11px] text-gray-400">
                Hiển thị mô phỏng cách phí giao hàng xuất hiện tại giỏ hàng của người mua:
              </p>

              {/* Thẻ mô phỏng Cart Shop Group */}
              <div className="border border-gray-200/80 rounded-xl p-3 bg-white space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-900">
                      {watchedGeneral.name || shop?.name || 'Tên cửa hàng'}
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-semibold rounded">
                      Chính hãng
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">Đơn hàng mẫu: 350.000₫</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Truck className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Giao dự kiến 2 - 3 ngày</span>
                  </div>

                  <div className="text-right">
                    {watchedShipping.enableFreeShipping && watchedShipping.freeShippingThreshold <= 350000 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400 line-through">
                          {Number(watchedShipping.flatShippingFee || 0).toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          Miễn phí
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-gray-900">
                        {watchedShipping.flatShippingFee === 0
                          ? 'Miễn phí'
                          : `${Number(watchedShipping.flatShippingFee || 0).toLocaleString('vi-VN')}₫`}
                      </span>
                    )}
                  </div>
                </div>

                {watchedShipping.enableFreeShipping && (
                  <div className="bg-emerald-50/60 rounded-md p-2 flex items-center gap-1.5 text-[10px] text-emerald-800">
                    <BadgePercent className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      Đơn hàng đạt từ {Number(watchedShipping.freeShippingThreshold || 0).toLocaleString('vi-VN')}₫ được Shop miễn phí vận chuyển 100%.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    ) : (
      <>
        {/* Giao diện Tab 5: Chính sách cửa hàng (Policies) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Cột trái: Form cấu hình Chế độ tạm nghỉ, Đổi trả & Bảo hành (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* 1. Chế độ tạm nghỉ bán (Holiday / Vacation Mode) */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-200/60">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                        Chế độ tạm nghỉ bán / Nghỉ lễ
                      </h3>
                      {watchedPolicy.holidayMode && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                          Đang bật
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Tạm ngừng nhận đơn hàng khi shop đi du lịch, nghỉ Tết hoặc tạm đóng cửa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setValuePolicy('holidayMode', !watchedPolicy.holidayMode, {
                      shouldDirty: true,
                    })
                  }
                  className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    watchedPolicy.holidayMode ? 'bg-amber-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      watchedPolicy.holidayMode ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {watchedPolicy.holidayMode && (
                <div className="space-y-3 pt-1 border-t border-gray-100 animate-in fade-in duration-150">
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Khi bật chế độ này, người mua vẫn có thể xem các sản phẩm trong gian hàng của bạn nhưng nút "Thêm vào giỏ" và "Mua ngay" sẽ bị tạm khóa cho đến khi bạn tắt chế độ nghỉ.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Thông điệp hẹn ngày mở lại gửi khách hàng
                    </label>
                    <input
                      type="text"
                      maxLength={250}
                      {...registerPolicy('holidayMessage')}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-amber-500"
                      placeholder="Ví dụ: Shop tạm nghỉ Tết từ 28/01 đến 05/02. Các đơn hàng sẽ được gửi ngay sau kỳ nghỉ!"
                    />
                    <p className="text-[10px] text-gray-400">
                      Lời nhắn này sẽ xuất hiện nổi bật ở đầu trang gian hàng và trang chi tiết sản phẩm.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Chính sách Đổi trả & Hoàn tiền (Return & Refund) */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-emerald-100">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Chính sách Đổi trả & Hoàn tiền
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Cam kết quyền lợi đổi trả sản phẩm cho khách hàng khi có phát sinh sự cố
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setValuePolicy('enableReturn', !watchedPolicy.enableReturn, {
                      shouldDirty: true,
                    })
                  }
                  className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    watchedPolicy.enableReturn ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      watchedPolicy.enableReturn ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {watchedPolicy.enableReturn && (
                <div className="space-y-3.5 pt-0.5 border-t border-gray-100">
                  {/* Thời hạn đổi trả */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-gray-700">
                        Thời hạn chấp nhận đổi trả kể từ ngày nhận hàng *
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {watchedPolicy.returnPeriodDays} ngày
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { days: 7, label: '7 ngày', sub: 'Tiêu chuẩn sàn' },
                        { days: 15, label: '15 ngày', sub: 'Tăng uy tín' },
                        { days: 30, label: '30 ngày', sub: 'Cam kết cao nhất' },
                      ].map((item) => (
                        <button
                          key={item.days}
                          type="button"
                          onClick={() =>
                            setValuePolicy('returnPeriodDays', item.days, {
                              shouldDirty: true,
                            })
                          }
                          className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                            watchedPolicy.returnPeriodDays === item.days
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400/20'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yêu cầu video unbox */}
                  <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">
                        Yêu cầu video mở hộp (Unbox video)
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Khách hàng cần quay video rõ nét lúc khui kiện hàng để được hỗ trợ giải quyết nhanh
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setValuePolicy('requireUnboxVideo', !watchedPolicy.requireUnboxVideo, {
                          shouldDirty: true,
                        })
                      }
                      className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        watchedPolicy.requireUnboxVideo ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          watchedPolicy.requireUnboxVideo ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Điều kiện đổi trả chi tiết */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Quy định & Điều kiện đổi trả chi tiết
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      {...registerPolicy('returnPolicyNote')}
                      className="w-full px-3 mt-1 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                      placeholder="Sản phẩm còn nguyên tem mác, nguyên seal, chưa qua sử dụng và có video quay lúc mở kiện hàng..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Chính sách Bảo hành (Warranty Policy) */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                  Chính sách Bảo hành sản phẩm
                </h3>
              </div>

              <div className="space-y-3.5 pt-0.5">
                {/* Loại hình bảo hành */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Hình thức bảo hành chính *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {[
                      { id: 'shop', label: 'Bảo hành bởi Shop', desc: 'Gửi về kho shop kiểm tra' },
                      { id: 'manufacturer', label: 'Bảo hành chính hãng', desc: 'Tại TTBH hãng trên toàn quốc' },
                      { id: 'electronic', label: 'Bảo hành điện tử', desc: 'Kích hoạt theo Serial/IMEI' },
                      { id: 'none', label: 'Không bảo hành', desc: 'Mặt hàng tiêu hao / phụ kiện' },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() =>
                          setValuePolicy('warrantyType', opt.id as any, { shouldDirty: true })
                        }
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                          watchedPolicy.warrantyType === opt.id
                            ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500/20'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          {watchedPolicy.warrantyType === opt.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Thời gian bảo hành */}
                {watchedPolicy.warrantyType !== 'none' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-gray-700">
                        Thời hạn bảo hành mặc định
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {watchedPolicy.warrantyPeriodMonths} tháng
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1, 3, 6, 12, 24, 36].map((months) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() =>
                            setValuePolicy('warrantyPeriodMonths', months, { shouldDirty: true })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            watchedPolicy.warrantyPeriodMonths === months
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {months} tháng
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ghi chú hướng dẫn bảo hành */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Quy trình tiếp nhận & Địa chỉ gửi bảo hành
                  </label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    {...registerPolicy('warrantyPolicyNote')}
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                    placeholder="Bảo hành các lỗi kỹ thuật từ nhà sản xuất. Không bảo hành các trường hợp rơi vỡ, cấn móp hoặc vào nước..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Xem trước Huy hiệu trên Trang Sản phẩm (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Khung mô phỏng Trust Badges trên PDP */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Xem trước cam kết trên sản phẩm
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Trang chi tiết</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Đây là các huy hiệu quyền lợi khách hàng sẽ nhìn thấy bên dưới nút Mua hàng:
              </p>

              {/* Thẻ mô phỏng widget PDP */}
              <div className="border border-gray-200/80 rounded-xl p-3.5 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900">
                    Quyền lợi & Cam kết từ {watchedGeneral.name || shop?.name || 'Shop'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Badge 1: Đổi trả */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {watchedPolicy.enableReturn
                          ? `Đổi trả miễn phí trong ${watchedPolicy.returnPeriodDays} ngày`
                          : 'Không áp dụng đổi trả'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {watchedPolicy.requireUnboxVideo
                          ? 'Yêu cầu video unbox kiện hàng nguyên vẹn'
                          : 'Áp dụng cho sản phẩm lỗi từ nhà sản xuất'}
                      </p>
                    </div>
                  </div>

                  {/* Badge 2: Bảo hành */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {watchedPolicy.warrantyType === 'none'
                          ? 'Sản phẩm không áp dụng bảo hành'
                          : `Bảo hành ${watchedPolicy.warrantyPeriodMonths} tháng ${
                              watchedPolicy.warrantyType === 'manufacturer'
                                ? 'chính hãng'
                                : watchedPolicy.warrantyType === 'electronic'
                                ? 'điện tử'
                                : 'tại shop'
                            }`}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Tiếp nhận và xử lý nhanh chóng theo chính sách cam kết
                      </p>
                    </div>
                  </div>

                  {/* Badge 3: Đồng kiểm */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Đồng kiểm ngoại quan khi nhận hàng
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Khách được kiểm tra bao bì gói hàng cùng bưu tá trước khi thanh toán
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner Holiday mode preview nếu đang bật */}
                {watchedPolicy.holidayMode && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {watchedPolicy.holidayMessage || 'Cửa hàng đang tạm nghỉ bán.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thẻ Insight / Tip bán hàng */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100 rounded-xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs">Mẹo gia tăng chuyển đổi</h4>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Các gian hàng có <strong>chính sách đổi trả từ 7 ngày trở lên</strong> và thông tin bảo hành rõ ràng ghi nhận tỷ lệ chốt đơn cao hơn <strong>32%</strong> và giảm tới <strong>65%</strong> các khiếu nại tranh chấp sau bán hàng.
              </p>
            </div>
          </div>
        </div>
      </>
    )}

      {/* Floating Sticky Save Bar (Phong cách Shopify / Shopee) - Chỉ xuất hiện khi có thay đổi chưa lưu */}
      {isCurrentTabDirty && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-xl z-50 px-4 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-gray-900/95 backdrop-blur-md text-white border border-gray-700/80 shadow-2xl rounded-2xl p-3 px-4 sm:px-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  Bạn có thay đổi chưa lưu
                </p>
                <p className="text-[10px] text-gray-400 truncate hidden sm:block">
                  Cài đặt {getTabTitle(currentTab).toLowerCase()} sẽ được cập nhật khi bạn lưu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscardCurrentTab}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentTab}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
