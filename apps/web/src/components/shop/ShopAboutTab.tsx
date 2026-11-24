'use client';

import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  Package,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { ShopInfo } from './shop-types';

interface ShopAboutTabProps {
  shop: ShopInfo;
}

export function ShopAboutTab({ shop }: ShopAboutTabProps) {
  return (
    <div className="space-y-5">
      {/* 1. Giới thiệu gian hàng */}
      <div className="bg-white border border-gray-200/70 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-gray-900">
          Về gian hàng {shop.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {shop.description ||
            `${shop.name} là gian hàng uy tín trên hệ thống, chuyên cung cấp các sản phẩm chất lượng với dịch vụ hỗ trợ chu đáo.`}
        </p>

        {/* Cam kết mua hàng cơ bản */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block">Sản phẩm đảm bảo</span>
              <span className="text-[11px] text-gray-500">
                Cam kết hàng đúng mô tả, kiểm tra đóng gói kỹ lưỡng trước khi gửi.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block">Đổi trả theo quy định</span>
              <span className="text-[11px] text-gray-500">
                Hỗ trợ đổi trả thuận tiện nếu sản phẩm có lỗi phát sinh do người bán hoặc vận chuyển.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thông tin liên hệ & địa chỉ */}
      <div className="bg-white border border-gray-200/70 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm sm:text-base font-bold text-gray-900">
            Thông tin liên hệ
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-700 block">Địa chỉ</span>
              <p className="text-gray-900 mt-0.5">
                {shop.address || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-700 block">Hotline</span>
              <p className="text-gray-900 font-medium mt-0.5">
                {shop.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-700 block">Email hỗ trợ</span>
              <p className="text-gray-900 mt-0.5">
                {shop.email || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-700 block">Thời gian tham gia</span>
              <p className="text-gray-900 mt-0.5">
                {shop.joinDate || 'Gần đây'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
