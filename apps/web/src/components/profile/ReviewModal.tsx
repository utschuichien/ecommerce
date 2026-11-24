'use client';

import React, { useState } from 'react';
import { Star, X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useCreateReview } from '@/features/reviews';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  product: {
    id: string;
    name: string;
    image?: string;
    variant?: string;
    variantId?: string;
  };
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

export function ReviewModal({
  isOpen,
  onClose,
  orderId,
  product,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [imageInput, setImageInput] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);

  const createReviewMutation = useCreateReview();

  if (!isOpen) return null;

  const handleAddImage = () => {
    const trimmed = imageInput.trim();
    if (!trimmed) return;
    if (images.length >= 5) {
      toast.error('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    createReviewMutation.mutate(
      {
        orderId,
        productId: product.id,
        variantId: product.variantId,
        rating,
        comment: comment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4 border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Đánh giá sản phẩm
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Đơn hàng #{orderId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-gray-300">No Image</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 truncate">
              {product.name}
            </h4>
            {product.variant && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                Phân loại: {product.variant}
              </p>
            )}
          </div>
        </div>

        {/* Form đánh giá */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Chọn số sao */}
          <div className="text-center space-y-2 py-2 bg-amber-50/40 rounded-xl border border-amber-100/60">
            <span className="text-xs text-gray-600 font-medium block">
              Chất lượng sản phẩm
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-amber-600">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Ô nhập nhận xét */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 block">
              Nhận xét chi tiết
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm về chất lượng sản phẩm, dịch vụ đóng gói và tốc độ giao hàng của người bán nhé..."
              className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-gray-400"
            />
          </div>

          {/* Đính kèm ảnh chụp thực tế */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 block">
              Hình ảnh thực tế (tùy chọn)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Dán link ảnh chụp sản phẩm (URL)..."
                className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={!imageInput.trim() || images.length >= 5}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-40"
              >
                + Thêm
              </button>
            </div>

            {/* Danh sách ảnh đã đính kèm */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group"
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] hover:bg-rose-600 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={createReviewMutation.isPending}
              className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {createReviewMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hoàn tất & Gửi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

