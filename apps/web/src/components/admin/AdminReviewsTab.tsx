'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  Package,
} from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { ProductImage } from '@/components/common/ProductImage';
import { useAdminReviews, useDeleteReview } from '@/features/admin';

export function AdminReviewsTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: reviewsData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminReviews({
    page,
    limit: 10,
    search: searchTerm || undefined,
    rating: ratingFilter,
  });

  const deleteMutation = useDeleteReview();

  const reviews = reviewsData?.items || [];
  const pagination = reviewsData?.pagination || { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate(deleteTargetId, {
      onSettled: () => setDeleteTargetId(null),
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Bộ lọc */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo nội dung, tên sản phẩm hoặc người đánh giá..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400">
              Tổng số đánh giá: <strong>{pagination.totalItems}</strong>
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200/60 text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Lọc theo số sao */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setRatingFilter(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              ratingFilter === undefined
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
            }`}
          >
            Tất cả đánh giá
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setRatingFilter(stars)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                ratingFilter === stars
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Danh sách Đánh giá */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs">Đang tải danh sách đánh giá...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <MessageSquare className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Chưa có đánh giá nào cần xử lý</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Các đánh giá từ khách hàng sau khi nhận hàng thành công sẽ hiển thị tại đây để Quản trị viên kiểm duyệt nội dung.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 hover:bg-gray-50/50 transition space-y-3 text-xs">
                {/* Header review: User info & Product info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      src={rev.user.avatar}
                      name={rev.user.name}
                      size="sm"
                      className="rounded-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{rev.user.name}</span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full font-medium">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Đã mua hàng
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars & Delete action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(rev.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa vi phạm</span>
                    </button>
                  </div>
                </div>

                {/* Sản phẩm được đánh giá */}
                <div className="p-2.5 bg-gray-50/80 rounded-lg border border-gray-200/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                    <ProductImage src={rev.product.image} alt={rev.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{rev.product.name}</p>
                    <p className="text-[10px] text-gray-400">Cửa hàng: {rev.product.shopName}</p>
                  </div>
                </div>

                {/* Nội dung bình luận */}
                <p className="text-gray-800 leading-relaxed">
                  {rev.comment || <em className="text-gray-400">Không có bình luận chữ.</em>}
                </p>

                {/* Phản hồi từ shop (nếu có) */}
                {rev.sellerReply && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-blue-900 text-[11px]">
                    <span className="font-bold block mb-0.5">Phản hồi của Shop:</span>
                    <span>{rev.sellerReply}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Phân trang căn giữa */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              limit={pagination.limit}
              onPageChange={(p) => setPage(p)}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </div>

      {/* Modal Xác nhận xóa - Dùng ConfirmDeleteModal dùng chung */}
      <ConfirmDeleteModal
        isOpen={!!deleteTargetId}
        title="Xóa đánh giá vi phạm?"
        description="Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này khỏi hệ thống? Thao tác này không thể hoàn tác."
        confirmText="Xóa đánh giá"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
