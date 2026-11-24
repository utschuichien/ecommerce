'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Wallet,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Percent,
  CreditCard,
  Building2,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAdminPayouts, useSettlePayout } from '@/features/admin';
import { formatVND } from '@/lib/api-client';

export function AdminPayoutsTab() {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedShopName, setSelectedShopName] = useState<string>('');
  const [settlingAmount, setSettlingAmount] = useState<number>(0);

  const { data: payoutsData, isLoading, isFetching, refetch } = useAdminPayouts();
  const settleMutation = useSettlePayout();

  const summary = payoutsData?.summary || {
    totalDeliveredGMV: 0,
    totalPlatformCommission: 0,
    totalNetPayout: 0,
    cycleType: 'T+3 Tự động hàng tuần',
  };

  const shops = payoutsData?.items || [];

  const handleSettleConfirm = () => {
    if (!selectedShopId) return;
    settleMutation.mutate(selectedShopId, {
      onSettled: () => setSelectedShopId(null),
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Thống kê tài chính sàn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 block uppercase">
              Doanh Thu Đã Giao
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-gray-950">{formatVND(summary.totalDeliveredGMV)}</p>
          <span className="text-[10px] text-gray-400">Từ các đơn hàng DELIVERED</span>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 block uppercase">
              Hoa Hồng Sàn (5%)
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-blue-700">{formatVND(summary.totalPlatformCommission)}</p>
          <span className="text-[10px] text-gray-400">Doanh thu phí dịch vụ sàn</span>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 block uppercase">
              Số Dư Chờ Giải Ngân
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-emerald-700">{formatVND(summary.totalNetPayout)}</p>
          <span className="text-[10px] text-gray-400">Thực nhận về các gian hàng</span>
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 block uppercase">
              Chu Kỳ Quyết Toán
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-purple-700">T+3 Tự động</p>
          <span className="text-[10px] text-gray-400">Quyết toán sau khi giao 3 ngày</span>
        </div>
      </div>

      {/* 2. Bảng kê đối soát & giải ngân các gian hàng */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-950">
              Bảng Kê Doanh Thu & Sổ Cái Giải Ngân
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Theo dõi đối soát, tính toán hoa hồng sàn và kích hoạt giải ngân cho người bán
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200/60 text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs">Đang đối soát số dư các gian hàng...</span>
          </div>
        ) : shops.length === 0 ? (
          <div className="p-14 text-center text-gray-400 text-xs">
            Chưa có gian hàng nào phát sinh đơn hàng cần giải ngân.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4">Chủ sở hữu & Liên hệ</th>
                  <th className="py-3 px-4 text-center">Đơn thành công</th>
                  <th className="py-3 px-4 text-right">Doanh thu giao</th>
                  <th className="py-3 px-4 text-right">Hoa hồng (5%)</th>
                  <th className="py-3 px-4 text-right">Thực nhận</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map((shop) => (
                  <tr key={shop.shopId} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <span>{shop.shopName}</span>
                          <span className="block text-[10px] text-gray-400 font-mono font-normal">
                            @{shop.shopSlug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <span className="font-medium text-gray-900 block">{shop.ownerName}</span>
                      <span className="text-[10px] text-gray-400">
                        {shop.ownerEmail || shop.ownerPhone || 'Không có liên hệ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                      {shop.deliveredOrdersCount} / {shop.totalOrdersCount}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-gray-900">
                      {formatVND(shop.deliveredRevenue)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                      -{formatVND(shop.commissionFee)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatVND(shop.netPayout)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {shop.deliveredRevenue > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Sẵn sàng giải ngân
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          Đã cân đối (0đ)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {shop.netPayout > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedShopId(shop.shopId);
                            setSelectedShopName(shop.shopName);
                            setSettlingAmount(shop.netPayout);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Giải ngân</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xác nhận giải ngân */}
      {selectedShopId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200/80 shadow-xl w-full max-w-sm p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-950">Xác nhận lệnh giải ngân?</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <p>
                Bạn sắp tạo lệnh giải ngân doanh thu cho gian hàng <strong>{selectedShopName}</strong>:
              </p>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <span className="text-[11px] text-gray-500 block">Số tiền thực nhận chuyển khoản:</span>
                <span className="text-base font-bold text-emerald-700">{formatVND(settlingAmount)}</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Giao dịch giải ngân sẽ được đối soát và ghi nhận hoàn tất vào tài khoản liên kết của người bán.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedShopId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSettleConfirm}
                disabled={settleMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5"
              >
                {settleMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận giải ngân</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
