'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  Sparkles,
  Percent,
  Coins,
  Truck,
  Calendar,
  Layers,
  Users,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CreateSellerVoucherPayload,
  SellerVoucherRecord,
  useCreateSellerVoucher,
} from '@/features/seller';

interface VoucherCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (voucher: SellerVoucherRecord) => void;
}

export function VoucherCreateModal({
  isOpen,
  onClose,
  onCreated,
}: VoucherCreateModalProps) {
  const createMutation = useCreateSellerVoucher();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING'>('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState<number>(20000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('50000');
  const [minOrderValue, setMinOrderValue] = useState<number>(100000);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [usagePerUser, setUsagePerUser] = useState<number>(1);

  // Mặc định từ hôm nay đến 30 ngày sau
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonth);

  useEffect(() => {
    if (isOpen) {
      handleGenerateCode();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(`SHOP${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      toast.error('Mã voucher không hợp lệ', {
        description: 'Mã voucher phải có ít nhất 3 ký tự in hoa/số.',
      });
      return;
    }

    if (!name.trim()) {
      toast.error('Thiếu tên chương trình', {
        description: 'Vui lòng nhập tên chương trình cho voucher.',
      });
      return;
    }

    if (type === 'PERCENTAGE') {
      if (discountValue < 1 || discountValue > 100) {
        toast.error('Tỷ lệ giảm giá không hợp lệ', {
          description: 'Phần trăm giảm giá phải nằm trong khoảng từ 1% đến 100%.',
        });
        return;
      }
    } else if (type === 'FIXED_AMOUNT') {
      if (discountValue < 1000) {
        toast.error('Mức giảm giá quá nhỏ', {
          description: 'Mức giảm giá tiền mặt tối thiểu là 1.000 VNĐ.',
        });
        return;
      }
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`);
    if (start >= end) {
      toast.error('Thời gian không hợp lệ', {
        description: 'Ngày kết thúc phải sau ngày bắt đầu.',
      });
      return;
    }

    const payload: CreateSellerVoucherPayload = {
      code: cleanCode,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      discountValue: type === 'FREE_SHIPPING' ? 0 : Number(discountValue),
      maxDiscountAmount:
        type === 'PERCENTAGE' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      minOrderValue: Number(minOrderValue) || 0,
      usageLimit: Number(usageLimit) || 100,
      usagePerUser: Number(usagePerUser) || 1,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isActive: true,
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success('Tạo voucher thành công!', {
        description: `Mã ${cleanCode} đã sẵn sàng áp dụng cho khách hàng của Shop.`,
      });
      if (onCreated && res.voucher) {
        onCreated(res.voucher);
      }
      onClose();
    } catch (err: any) {
      toast.error('Tạo voucher thất bại', {
        description: err?.response?.data?.message || 'Không thể tạo mã voucher. Vui lòng thử lại.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Tạo mã giảm giá mới cho Shop
              </h3>
              <p className="text-xs text-gray-400">
                Thiết lập mã khuyến mãi độc quyền để kích cầu doanh số bán hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Mã voucher & Nút tạo ngẫu nhiên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Mã Voucher <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Tạo mã ngẫu nhiên
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: SHOPGIAM30K"
                required
                maxLength={32}
                className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 uppercase bg-gray-50/50"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">3-32 ký tự viết hoa, số hoặc gạch nối</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tên chương trình voucher <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Giảm 20K đơn từ 150K"
                required
                maxLength={100}
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 2. Loại voucher */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Loại giảm giá <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('FIXED_AMOUNT')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                  type === 'FIXED_AMOUNT'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Coins className={`w-4 h-4 ${type === 'FIXED_AMOUNT' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-xs">Theo số tiền</div>
                  <div className="text-[10px] text-gray-400 font-normal">Giảm số tiền cố định (đ)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('PERCENTAGE')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                  type === 'PERCENTAGE'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Percent className={`w-4 h-4 ${type === 'PERCENTAGE' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-xs">Theo phần trăm</div>
                  <div className="text-[10px] text-gray-400 font-normal">Giảm theo tỷ lệ %</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('FREE_SHIPPING')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                  type === 'FREE_SHIPPING'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-semibold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Truck className={`w-4 h-4 ${type === 'FREE_SHIPPING' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div>
                  <div className="text-xs">Freeship</div>
                  <div className="text-[10px] text-gray-400 font-normal">Miễn phí ship Shop</div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Mức giảm & Giảm tối đa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {type !== 'FREE_SHIPPING' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {type === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={type === 'PERCENTAGE' ? 1 : 1000}
                    max={type === 'PERCENTAGE' ? 100 : 100000000}
                    step={type === 'PERCENTAGE' ? 1 : 1000}
                    required
                    className="w-full px-3 py-2 pr-8 text-xs font-semibold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    {type === 'PERCENTAGE' ? '%' : 'đ'}
                  </span>
                </div>
              </div>
            )}

            {type === 'PERCENTAGE' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giảm tối đa (VNĐ) <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Không giới hạn"
                    min={1000}
                    step={1000}
                    className="w-full px-3 py-2 pr-8 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    đ
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  min={0}
                  step={5000}
                  className="w-full px-3 py-2 pr-8 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  đ
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Để 0đ nếu áp dụng cho mọi đơn hàng</p>
            </div>
          </div>

          {/* 4. Giới hạn lượt dùng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                Tổng số lượt phát hành <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                min={1}
                max={100000}
                required
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                Lượt dùng tối đa mỗi khách
              </label>
              <input
                type="number"
                value={usagePerUser}
                onChange={(e) => setUsagePerUser(Number(e.target.value))}
                min={1}
                max={50}
                required
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 5. Thời gian hiệu lực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Ngày kết thúc <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 6. Mô tả thêm */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ghi chú / Điều kiện áp dụng <span className="text-gray-400 font-normal">(Tùy chọn)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Không áp dụng kèm các chương trình Flash Sale..."
              rows={2}
              className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Preview thẻ voucher */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {type === 'PERCENTAGE' ? `${discountValue}%` : type === 'FREE_SHIPPING' ? 'SHIP' : 'GIẢM'}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-gray-900">
                  {name || 'Tên chương trình voucher'}
                </div>
                <div className="text-[11px] text-gray-600">
                  Mã: <span className="font-mono font-semibold text-emerald-700">{code || 'MÃ VOUCHER'}</span> · Đơn tối thiểu: {Number(minOrderValue).toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
                Voucher của Shop
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !code.trim() || !name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tạo mã voucher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

