'use client';

import React from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Video,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ShopInfo } from './shop-types';

interface ShopPoliciesTabProps {
  shop: ShopInfo;
}

export function ShopPoliciesTab({ shop }: ShopPoliciesTabProps) {
  const returnPeriod = shop.returnPeriodDays ?? 7;
  const isReturnEnabled = shop.enableReturn !== false;
  const isHoliday = Boolean(shop.holidayMode);

  // Warranty display text
  const warrantyPeriod = shop.warrantyPeriodMonths;
  let warrantyTypeText = 'Bảo hành chính hãng';
  if (shop.warrantyType === 'OFFICIAL') {
    warrantyTypeText = 'Bảo hành chính hãng tại trung tâm ủy quyền';
  } else if (shop.warrantyType === 'SHOP') {
    warrantyTypeText = 'Bảo hành trực tiếp tại gian hàng';
  } else if (shop.warrantyType === 'ELECTRONIC') {
    warrantyTypeText = 'Bảo hành điện tử qua số điện thoại mua hàng';
  } else if (shop.warrantyType === 'NONE') {
    warrantyTypeText = 'Không áp dụng bảo hành';
  }

  return (
    <div className="space-y-5">
      {/* 1. Cảnh báo Tạm nghỉ bán hàng (Holiday Mode Banner) */}
      {isHoliday && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="p-2 bg-amber-100/90 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              Gian hàng đang trong chế độ tạm nghỉ bán
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {shop.holidayMessage ||
                'Gian hàng hiện đang tạm dừng nhận đơn mới để nghỉ lễ hoặc kiểm kê hàng hóa. Bạn vẫn có thể xem sản phẩm và thêm vào danh sách yêu thích.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Tổng quan cam kết (Highlight Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 font-medium block">Chính sách đổi trả</span>
            <span className="text-sm font-bold text-gray-800 truncate block">
              {isReturnEnabled ? `${returnPeriod} ngày đổi trả miễn phí` : 'Không hỗ trợ đổi trả'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 font-medium block">Cam kết bảo hành</span>
            <span className="text-sm font-bold text-gray-800 truncate block">
              {warrantyPeriod && shop.warrantyType !== 'NONE'
                ? `${warrantyPeriod} tháng bảo hành`
                : 'Theo tiêu chuẩn nhà SX'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-gray-500 font-medium block">Vận chuyển ưu đãi</span>
            <span className="text-sm font-bold text-gray-800 truncate block">
              {shop.enableFreeShipping
                ? shop.freeShippingThreshold
                  ? `Freeship từ ${Number(shop.freeShippingThreshold).toLocaleString('vi-VN')}₫`
                  : 'Freeship mọi đơn hàng'
                : 'Giao hàng tận nơi toàn quốc'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Chi tiết: Chính sách Đổi trả & Hoàn tiền */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Quy định Đổi trả & Hoàn tiền</h3>
            <p className="text-[11px] text-gray-500">
              Áp dụng cho mọi sản phẩm phát sinh đơn hàng tại gian hàng {shop.name}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-gray-600">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-800">Thời hạn khiếu nại đổi trả: </span>
              {isReturnEnabled ? (
                <span>
                  Trong vòng <strong className="text-emerald-700 font-bold">{returnPeriod} ngày</strong> kể từ thời điểm đơn vị vận chuyển cập nhật trạng thái đơn hàng đã giao thành công.
                </span>
              ) : (
                <span>Gian hàng hiện không hỗ trợ đổi trả theo nhu cầu cá nhân. Quý khách vui lòng kiểm tra kỹ trước khi nhận.</span>
              )}
            </div>
          </div>

          {shop.requireUnboxVideo && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <Video className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800">
                <span className="font-bold text-amber-900">Yêu cầu video mở hộp (Unbox Video): </span>
                Quý khách vui lòng quay video liền mạch từ lúc nhận gói hàng còn nguyên tem niêm phong đến khi kiểm tra sản phẩm để shop hỗ trợ giải quyết nhanh chóng nhất nếu có sự cố thiếu hàng hoặc bể vỡ do vận chuyển.
              </div>
            </div>
          )}

          {shop.returnPolicyNote && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-semibold text-gray-800 block text-[11px]">
                Chi tiết quy định từ Người bán:
              </span>
              <p className="whitespace-pre-line text-[11px] text-gray-600">
                {shop.returnPolicyNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Chi tiết: Chính sách Bảo hành */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Chính sách Bảo hành & Hỗ trợ kỹ thuật</h3>
            <p className="text-[11px] text-gray-500">
              Bảo vệ quyền lợi tối đa cho khách hàng khi sử dụng sản phẩm
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <span className="text-[11px] font-medium text-gray-500 block">Hình thức bảo hành</span>
            <span className="font-bold text-gray-800 text-sm block">{warrantyTypeText}</span>
            <span className="text-[11px] text-gray-500 block">
              {shop.warrantyType === 'OFFICIAL'
                ? 'Tiếp nhận trực tiếp tại các trung tâm bảo hành hãng trên toàn quốc.'
                : shop.warrantyType === 'SHOP'
                ? 'Gửi sản phẩm về địa chỉ kho của gian hàng để kỹ thuật viên kiểm tra.'
                : 'Kích hoạt tự động qua số điện thoại người mua trên hệ thống.'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <span className="text-[11px] font-medium text-gray-500 block">Thời gian bảo hành</span>
            <span className="font-bold text-emerald-700 text-sm block">
              {warrantyPeriod ? `${warrantyPeriod} tháng cam kết` : 'Theo chính sách của nhà sản xuất'}
            </span>
            <span className="text-[11px] text-gray-500 block">
              Tính từ ngày xuất kho hoặc ngày khách nhận hàng thành công.
            </span>
          </div>
        </div>

        {shop.warrantyPolicyNote && (
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
            <span className="font-semibold text-gray-800 block text-[11px]">
              Điều kiện tiếp nhận bảo hành:
            </span>
            <p className="whitespace-pre-line text-[11px] text-gray-600">
              {shop.warrantyPolicyNote}
            </p>
          </div>
        )}
      </div>

      {/* 5. Chi tiết: Chính sách Giao hàng & Vận chuyển */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Vận chuyển & Đóng gói</h3>
            <p className="text-[11px] text-gray-500">
              Quy trình đóng gói cẩn thận và liên kết các đơn vị vận chuyển hàng đầu
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-gray-600 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800">Miễn phí vận chuyển: </strong>
              {shop.enableFreeShipping ? (
                shop.freeShippingThreshold ? (
                  <span>
                    Hỗ trợ freeship cho các đơn hàng có giá trị từ{' '}
                    <strong className="text-emerald-700 font-bold">
                      {Number(shop.freeShippingThreshold).toLocaleString('vi-VN')}₫
                    </strong>.
                  </span>
                ) : (
                  <span>Áp dụng miễn phí vận chuyển cho toàn bộ đơn hàng của gian hàng.</span>
                )
              ) : (
                <span>Phí vận chuyển được tính linh hoạt theo khu vực giao hàng và đơn vị chuyển phát.</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800">Tiêu chuẩn đóng gói: </strong>
              Sản phẩm luôn được bọc xốp bóng khí (bubble wrap) nhiều lớp, niêm phong băng keo cẩn thận để tránh va đập trong quá trình luân chuyển.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

