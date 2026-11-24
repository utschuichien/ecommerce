'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { customZodResolver } from './zod-resolver';
import {
  User,
  Phone,
  Home,
  FileText,
  Truck,
  Building2,
  MapPin,
  Navigation,
  BookOpen,
  Plus,
  Check,
} from 'lucide-react';
import { RecipientInfo, ShippingMethod } from './checkout-types';
import { recipientSchema, RecipientFormData } from './checkout.schema';
import { LocationSelect } from './LocationSelect';
import { Checkbox } from '../ui/checkbox';
import { formatVND } from '../../lib/api-client';
import { useAddresses } from '../../features/auth/hooks/useAuth';
import { UserAddress } from '../../features/auth/types/auth.types';
import rawLocations from '../../data/vietnam-locations.json';

interface CheckoutRecipientFormProps {
  recipient: RecipientInfo;
  onChangeRecipient: (data: Partial<RecipientInfo>) => void;
  shippingMethods: ShippingMethod[];
  selectedShippingId: 'standard' | 'express';
  onSelectShipping: (id: 'standard' | 'express') => void;
  onValidSubmit?: (data: RecipientFormData) => void;
}

// Kiểu dữ liệu địa giới hành chính từ vietnam-locations.json
interface DistrictData {
  name: string;
  wards: string[];
}

interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

const vietnamLocations = rawLocations as ProvinceData[];

// Helper chuẩn hóa tên địa danh để so khớp linh hoạt giữa DB và JSON
function normalizeLocation(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(thành phố|tỉnh|quận|huyện|thị xã|thị trấn|phường|xã)\s+/i, '')
    .trim();
}

export function CheckoutRecipientForm({
  recipient,
  onChangeRecipient,
  shippingMethods,
  selectedShippingId,
  onSelectShipping,
  onValidSubmit,
}: CheckoutRecipientFormProps) {
  // Lấy danh sách địa chỉ đã lưu trong DB (nếu người dùng đã đăng nhập)
  const { data: savedAddresses = [] } = useAddresses();
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  // Khởi tạo React Hook Form với Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, touchedFields },
  } = useForm<RecipientFormData>({
    resolver: customZodResolver(recipientSchema),
    defaultValues: {
      fullName: recipient.fullName || '',
      phone: recipient.phone || '',
      province: recipient.province?.trim() || '',
      district: recipient.district?.trim() || '',
      ward: recipient.ward?.trim() || '',
      line1: recipient.line1 || recipient.address || '',
      saveToAddressBook: recipient.saveToAddressBook ?? false,
      note: recipient.note || '',
    },
    mode: 'onTouched',
  });

  const currentProvince = watch('province');
  const currentDistrict = watch('district');
  const currentWard = watch('ward');

  // 1. Chỉ điền sẵn tỉnh/huyện/xã khi trong DB thực sự có địa chỉ lưu sẵn
  useEffect(() => {
    const hasDbProvince = Boolean(recipient.province && recipient.province.trim());
    const provinceMatch = hasDbProvince
      ? (vietnamLocations.find(
          (p) =>
            p.name === recipient.province ||
            normalizeLocation(p.name) === normalizeLocation(recipient.province),
        )?.name || recipient.province)
      : '';

    reset({
      fullName: recipient.fullName || '',
      phone: recipient.phone || '',
      province: provinceMatch || '',
      district: hasDbProvince ? (recipient.district || '') : '',
      ward: hasDbProvince ? (recipient.ward || '') : '',
      line1: recipient.line1 || recipient.address || '',
      saveToAddressBook: recipient.saveToAddressBook ?? false,
      note: recipient.note || '',
    });
  }, [recipient, reset]);

  // 2. Danh sách 63 Tỉnh / Thành phố từ vietnam-locations.json
  const provinceOptions = useMemo(() => {
    return vietnamLocations.map((p) => p.name);
  }, []);

  // 3. Tìm đối tượng Tỉnh / Thành phố đang chọn
  const selectedProvinceData = useMemo(() => {
    if (!currentProvince) return null;
    const norm = normalizeLocation(currentProvince);
    return (
      vietnamLocations.find(
        (p) =>
          p.name === currentProvince || normalizeLocation(p.name) === norm,
      ) || null
    );
  }, [currentProvince]);

  // 4. Danh sách Quận / Huyện phụ thuộc vào Tỉnh / Thành phố
  const districtOptions = useMemo(() => {
    return selectedProvinceData?.districts.map((d) => d.name) || [];
  }, [selectedProvinceData]);

  // 5. Tìm đối tượng Quận / Huyện đang chọn
  const selectedDistrictData = useMemo(() => {
    if (!selectedProvinceData || !currentDistrict) return null;
    const norm = normalizeLocation(currentDistrict);
    return (
      selectedProvinceData.districts.find(
        (d) =>
          d.name === currentDistrict || normalizeLocation(d.name) === norm,
      ) || null
    );
  }, [selectedProvinceData, currentDistrict]);

  // 6. Danh sách Phường / Xã phụ thuộc vào Quận / Huyện
  const wardOptions = useMemo(() => {
    return selectedDistrictData?.wards || [];
  }, [selectedDistrictData]);

  // Xử lý khi chọn Tỉnh / Thành phố
  const handleProvinceChange = (prov: string) => {
    setValue('province', prov, { shouldValidate: true });
    // Reset quận huyện và phường xã khi đổi tỉnh
    setValue('district', '', { shouldValidate: false });
    setValue('ward', '', { shouldValidate: false });
    setSelectedSavedId(null);

    syncToParent({ province: prov, district: '', ward: '' });
  };

  // Xử lý khi chọn Quận / Huyện
  const handleDistrictChange = (dist: string) => {
    setValue('district', dist, { shouldValidate: true });
    // Reset phường xã khi đổi quận
    setValue('ward', '', { shouldValidate: false });
    setSelectedSavedId(null);

    syncToParent({ district: dist, ward: '' });
  };

  // Xử lý khi chọn Phường / Xã
  const handleWardChange = (w: string) => {
    setValue('ward', w, { shouldValidate: true });
    setSelectedSavedId(null);
    syncToParent({ ward: w });
  };

  // Đồng bộ nhanh dữ liệu sang cha
  const syncToParent = (data: Partial<RecipientInfo>) => {
    onChangeRecipient(data);
  };

  // Khi chọn một địa chỉ có sẵn từ sổ địa chỉ DB
  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedSavedId(addr.id);

    // Tìm tỉnh thành phố tương ứng trong file JSON để đồng bộ dropdown
    const matchedProv =
      vietnamLocations.find(
        (p) =>
          p.name === addr.province ||
          normalizeLocation(p.name) === normalizeLocation(addr.province),
      )?.name || addr.province;

    const matchedDistObj = vietnamLocations
      .find((p) => p.name === matchedProv)
      ?.districts.find(
        (d) =>
          d.name === addr.district ||
          normalizeLocation(d.name) === normalizeLocation(addr.district),
      );

    const matchedDist = matchedDistObj?.name || addr.district;
    const matchedWard =
      matchedDistObj?.wards.find(
        (w) =>
          w === addr.ward ||
          normalizeLocation(w) === normalizeLocation(addr.ward),
      ) || addr.ward;

    reset({
      fullName: addr.recipientName,
      phone: addr.phone,
      province: matchedProv,
      district: matchedDist,
      ward: matchedWard,
      line1: addr.line1,
      saveToAddressBook: false,
      note: watch('note') || '',
    });

    onChangeRecipient({
      fullName: addr.recipientName,
      phone: addr.phone,
      province: matchedProv,
      district: matchedDist,
      ward: matchedWard,
      line1: addr.line1,
      address: addr.line1,
    });
  };

  // Nhập địa chỉ hoàn toàn mới
  const handleUseNewAddress = () => {
    setSelectedSavedId('new');
    reset({
      fullName: watch('fullName') || '',
      phone: watch('phone') || '',
      province: '',
      district: '',
      ward: '',
      line1: '',
      saveToAddressBook: true,
      note: watch('note') || '',
    });

    onChangeRecipient({
      province: '',
      district: '',
      ward: '',
      line1: '',
      address: '',
    });
  };

  const onSubmitForm = (data: RecipientFormData) => {
    // Ghép địa chỉ đầy đủ
    const fullAddr = [data.line1, data.ward, data.district, data.province]
      .filter(Boolean)
      .join(', ');

    onChangeRecipient({
      ...data,
      address: fullAddr,
    });

    onValidSubmit?.(data);
  };

  return (
    <form
      id="checkout-recipient-form"
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-4"
    >
      {/* Tiêu đề & phụ đề trang giao hàng */}
      <div className="space-y-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          Thông tin giao hàng
        </h1>
        <p className="text-xs text-gray-500">
          Vui lòng cung cấp thông tin chính xác để đơn hàng được giao nhanh chóng và đúng hẹn.
        </p>
      </div>

      {/* SỔ ĐỊA CHỈ TỪ DATABASE (Nếu người dùng đã lưu địa chỉ trước đó) */}
      {savedAddresses.length > 0 && (
        <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                Sổ địa chỉ của bạn ({savedAddresses.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={handleUseNewAddress}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedSavedId === 'new'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Giao đến địa chỉ mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedAddresses.map((addr) => {
              const isSelected = selectedSavedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-50/30 shadow-2xs'
                      : 'border-gray-200/70 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {addr.recipientName}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-600 shrink-0">
                        {addr.phone}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed pr-5">
                    {[addr.line1, addr.ward, addr.district, addr.province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {isSelected && (
                    <div className="absolute right-2.5 bottom-2.5 text-emerald-600">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CARD 1: THÔNG TIN LIÊN HỆ & ĐỊA CHỈ NHẬN HÀNG */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100/80">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Chi tiết địa chỉ nhận hàng
          </h2>
        </div>

        {/* Hàng 1: Họ tên & SĐT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Họ và tên */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Họ và tên người nhận <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                {...register('fullName', {
                  onChange: (e) => syncToParent({ fullName: e.target.value }),
                })}
                placeholder="Ví dụ: Nguyễn Văn An"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition ${
                  errors.fullName
                    ? 'border-rose-300 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                    : 'border-gray-200/80 hover:border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <span>{errors.fullName.message}</span>
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                {...register('phone', {
                  onChange: (e) => syncToParent({ phone: e.target.value }),
                })}
                placeholder="Ví dụ: 0912345678"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition ${
                  errors.phone
                    ? 'border-rose-300 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                    : 'border-gray-200/80 hover:border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Hàng 2: Tỉnh / Thành phố & Quận / Huyện & Phường / Xã (Custom Searchable Selects từ JSON) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Tỉnh / Thành phố */}
          <LocationSelect
            label="Tỉnh / Thành phố"
            placeholder="Chọn Tỉnh / TP"
            searchPlaceholder="Tìm Tỉnh / Thành phố..."
            value={currentProvince}
            onChange={handleProvinceChange}
            options={provinceOptions}
            required
            icon={Building2}
            error={errors.province?.message}
          />

          {/* Quận / Huyện */}
          <LocationSelect
            label="Quận / Huyện"
            placeholder="Chọn Quận / Huyện"
            searchPlaceholder="Tìm Quận / Huyện..."
            value={currentDistrict}
            onChange={handleDistrictChange}
            options={districtOptions}
            disabled={!currentProvince}
            disabledMessage="Chọn Tỉnh trước"
            required
            icon={MapPin}
            error={errors.district?.message}
          />

          {/* Phường / Xã */}
          <LocationSelect
            label="Phường / Xã"
            placeholder="Chọn Phường / Xã"
            searchPlaceholder="Tìm Phường / Xã..."
            value={currentWard}
            onChange={handleWardChange}
            options={wardOptions}
            disabled={!currentDistrict}
            disabledMessage="Chọn Huyện trước"
            required
            icon={Navigation}
            error={errors.ward?.message}
          />
        </div>

        {/* Hàng 3: Số nhà, tên đường cụ thể */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-gray-700">
            Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà...){' '}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Home className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              {...register('line1', {
                onChange: (e) =>
                  syncToParent({
                    line1: e.target.value,
                    address: e.target.value,
                  }),
              })}
              placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Tòa nhà FPT, Tầng 5"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition ${
                errors.line1
                  ? 'border-rose-300 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                  : 'border-gray-200/80 hover:border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
              }`}
            />
          </div>
          {errors.line1 && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <span>{errors.line1.message}</span>
            </p>
          )}
        </div>

        {/* Ghi chú đơn hàng */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-gray-700">
            Ghi chú giao hàng (Tùy chọn)
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <textarea
              rows={2}
              {...register('note', {
                onChange: (e) => syncToParent({ note: e.target.value }),
              })}
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
              className="w-full pl-10 pr-3.5 py-2 bg-white border border-gray-200/80 hover:border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
            />
          </div>
          {errors.note && (
            <p className="text-xs text-rose-600 font-medium">
              {errors.note.message}
            </p>
          )}
        </div>

        {/* Lưu địa chỉ vào danh bạ */}
        <div className="pt-2">
          <Checkbox
            id="saveToAddressBook"
            checked={watch('saveToAddressBook')}
            onCheckedChange={(checked) => {
              setValue('saveToAddressBook', checked);
              syncToParent({ saveToAddressBook: checked });
            }}
            label={
              <span className="text-xs text-gray-700 select-none">
                Lưu địa chỉ này vào sổ địa chỉ để sử dụng cho lần mua sắm tiếp theo
              </span>
            }
          />
        </div>
      </div>

      {/* CARD 2: PHƯƠNG THỨC GIAO HÀNG */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100/80">
          <Truck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Phương thức vận chuyển
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shippingMethods.map((method) => {
            const isSelected = selectedShippingId === method.id;
            return (
              <div
                key={method.id}
                onClick={() => onSelectShipping(method.id)}
                className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-50/25 shadow-2xs'
                    : 'border-gray-200/70 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={isSelected}
                      onChange={() => onSelectShipping(method.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                      {method.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {method.estimate}
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-semibold text-emerald-700 shrink-0 ml-2">
                  {formatVND(method.price)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
