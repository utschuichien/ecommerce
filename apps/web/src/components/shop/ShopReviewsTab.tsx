'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  ThumbsUp,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import { ShopReviewItem } from './shop-types';

interface ShopReviewsTabProps {
  ratingScore: number;
  reviewsCount: string | number;
  reviews: ShopReviewItem[];
  shopName?: string;
}

export function ShopReviewsTab({
  ratingScore,
  reviewsCount,
  reviews = [],
  shopName = 'Người bán',
}: ShopReviewsTabProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const countDisplay = typeof reviewsCount === 'number' ? `${reviewsCount}` : reviewsCount;

  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            Đánh giá từ khách hàng
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Nhận xét thực tế từ những khách hàng đã mua sản phẩm tại {shopName}
          </p>
        </div>

        {/* Điểm tổng quan nhỏ gọn */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50/80 border border-amber-100 px-3 py-1.5 rounded-xl">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-extrabold text-gray-900 text-sm">
            {ratingScore || 5.0} / 5
          </span>
          <span className="text-xs text-gray-500">
            ({countDisplay} lượt đánh giá)
          </span>
        </div>
      </div>

      {/* Danh sách đánh giá hoặc Trạng thái trống */}
      {reviews.length === 0 ? (
        <div className="py-14 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto border border-gray-100">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            Chưa có đánh giá nào
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Gian hàng này hiện chưa có bài đánh giá nào. Hãy là một trong những người đầu tiên đặt hàng và để lại trải nghiệm nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-gray-100">
          {reviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                        {rev.author}
                      </h4>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Đã mua hàng</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'fill-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">· {rev.date}</span>
                    </div>
                  </div>
                </div>

                {rev.productVariant && (
                  <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    Phân loại: {rev.productVariant}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-800 leading-relaxed pl-12">
                {rev.comment}
              </p>

              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2 pl-12">
                  {rev.images.map((img, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-lg border border-gray-100 overflow-hidden relative"
                    >
                      <Image
                        src={img}
                        alt="Ảnh đánh giá"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {rev.sellerResponse && (
                <div className="ml-12 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Phản hồi từ {shopName}:</span>
                  </p>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    {rev.sellerResponse}
                  </p>
                </div>
              )}

              <div className="pl-12 flex items-center gap-4 text-[11px] text-gray-400">
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-emerald-600 transition cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Hữu ích ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
