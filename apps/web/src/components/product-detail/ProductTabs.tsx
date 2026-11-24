'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  HelpCircle,
  Send,
  MessageSquare,
  Camera,
  X,
} from 'lucide-react';
import { Product } from '../mock/mock-data';
import { CatalogProductDetail } from '@/features/catalog/types/catalog.types';
import { useProductReviews } from '@/features/reviews';

interface ProductTabsProps {
  product: Product | CatalogProductDetail | any;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'reviews' | 'faq'>('info');
  const [isExpanded, setIsExpanded] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  // Bộ lọc đánh giá
  const [selectedStar, setSelectedStar] = useState<number | undefined>(undefined);
  const [filterWithPhotos, setFilterWithPhotos] = useState<boolean | undefined>(undefined);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Lấy dữ liệu đánh giá thực tế từ API
  const { data: reviewsResponse, isLoading: isLoadingReviews } = useProductReviews(
    product.slug || product.id,
    { rating: selectedStar, hasImages: filterWithPhotos },
  );

  const reviewSummary = reviewsResponse?.summary;
  const reviewsList = reviewsResponse?.items || [];
  const totalReviewsCount = reviewSummary?.totalReviews ?? product.reviewsCount ?? 0;
  const averageRating = reviewSummary?.averageRating ?? product.rating;

  const features: string[] = product.features || (product as any).attributes?.features || [];
  const specs: Record<string, string> = product.specs || (product as any).specifications || {};
  const faqs: any[] = (product as any).faqs || [];

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestionSent(true);
    setNewQuestion('');
    setTimeout(() => setQuestionSent(false), 3000);
  };

  const handleResetFilters = () => {
    setSelectedStar(undefined);
    setFilterWithPhotos(undefined);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-lg shadow-2xs overflow-hidden">
      {/* 1. Thanh Tabs Header */}
      <div className="flex items-center border-b border-gray-100 px-3 sm:px-5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`py-3 px-3.5 text-xs font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'info'
              ? 'text-emerald-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Thông tin sản phẩm</span>
          {activeTab === 'info' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`py-3 px-3.5 text-xs font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'specs'
              ? 'text-emerald-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Thông số kỹ thuật</span>
          {activeTab === 'specs' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-3.5 text-xs font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'text-emerald-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Đánh giá ({totalReviewsCount})</span>
          {activeTab === 'reviews' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`py-3 px-3.5 text-xs font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'faq'
              ? 'text-emerald-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Hỏi đáp</span>
          {activeTab === 'faq' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* 2. Nội dung Tab (Tab Panels) với min-height ổn định tránh giật layout */}
      <div className="p-4 sm:p-5 min-h-[300px]">
        {/* TAB 1: THÔNG TIN SẢN PHẨM */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Cột trái: Tính năng nổi bật */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-850">
                Tính năng nổi bật
              </h3>

              {features.length > 0 ? (
                <div className="space-y-3">
                  {features.map((feat: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span className="text-xs sm:text-[13px] text-gray-700 leading-relaxed">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Chưa có thông tin tính năng nổi bật.
                </p>
              )}
            </div>

            {/* Cột phải: Mô tả sản phẩm */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-850">
                Mô tả sản phẩm
              </h3>

              {product.fullDescription || product.description ? (
                <>
                  <div
                    className={`text-xs sm:text-[13px] text-gray-600 leading-relaxed space-y-2.5 transition-all ${
                      isExpanded ? '' : 'line-clamp-4'
                    }`}
                  >
                    <p>{product.fullDescription || product.description}</p>
                  </div>

                  {String(product.fullDescription || product.description).length > 250 && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer pt-1"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Chưa có mô tả chi tiết cho sản phẩm này.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: THÔNG SỐ KỸ THUẬT */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-850">
              Bảng thông số kỹ thuật chi tiết
            </h3>

            {Object.keys(specs).length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(specs).map(([label, value], idx) => (
                      <tr
                        key={label}
                        className={idx % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}
                      >
                        <td className="w-1/3 py-2.5 px-3.5 font-medium text-gray-600 border-b border-gray-100">
                          {label}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-800 border-b border-gray-100">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Chưa có bảng thông số kỹ thuật cho sản phẩm này.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: ĐÁNH GIÁ (REVIEWS) */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {totalReviewsCount > 0 ? (
              <>
                {/* 1. Tóm tắt điểm số & Thanh phân bổ sao */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-5 bg-gray-50/70 rounded-lg border border-gray-100">
                  {/* Điểm trung bình */}
                  <div className="text-center sm:text-left sm:border-r border-gray-200 sm:pr-8 shrink-0">
                    <div className="flex items-baseline justify-center sm:justify-start gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                        {averageRating ? Number(averageRating).toFixed(1) : '5.0'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">/ 5</span>
                    </div>

                    <div className="flex items-center gap-1 justify-center sm:justify-start pt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            (averageRating || 5) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-400 pt-1">
                      {totalReviewsCount} lượt đánh giá thực tế
                    </div>
                  </div>

                  {/* Thanh tiến độ số lượng từng sao */}
                  <div className="flex-1 w-full space-y-1.5 text-xs">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = reviewSummary?.distribution?.[s as 1 | 2 | 3 | 4 | 5] || 0;
                      const percent = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;

                      return (
                        <div key={s} className="flex items-center gap-2.5">
                          <span className="w-10 text-[11px] text-gray-500 font-medium">
                            {s} sao
                          </span>
                          <div className="flex-1 h-2 bg-gray-200/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] text-gray-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Dải nút bộ lọc đánh giá */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-gray-100 pb-3">
                  <span className="text-xs text-gray-500 font-medium mr-1">
                    Lọc theo:
                  </span>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer border ${
                      selectedStar === undefined && !filterWithPhotos
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tất cả ({totalReviewsCount})
                  </button>

                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = reviewSummary?.distribution?.[s as 1 | 2 | 3 | 4 | 5] || 0;
                    const isSelected = selectedStar === s && !filterWithPhotos;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSelectedStar(s);
                          setFilterWithPhotos(undefined);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer border ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700 shadow-2xs'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {s} Sao ({count})
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setFilterWithPhotos(true);
                      setSelectedStar(undefined);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer border flex items-center gap-1 ${
                      filterWithPhotos
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-700 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Có hình ảnh ({reviewSummary?.countWithImages || 0})</span>
                  </button>
                </div>

                {/* 3. Danh sách các bài đánh giá */}
                {isLoadingReviews ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Đang tải đánh giá...
                  </div>
                ) : reviewsList.length > 0 ? (
                  <div className="space-y-3.5 pt-1">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 border border-gray-100 rounded-lg space-y-2.5 bg-white shadow-2xs"
                      >
                        {/* Hàng trên: Tác giả, số sao, ngày */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {rev.avatar ? (
                              <img
                                src={rev.avatar}
                                alt={rev.author}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center">
                                {rev.author.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-gray-900">
                                  {rev.author}
                                </span>
                                {rev.isVerified && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded font-medium">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Đã mua hàng</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-0.5">
                                <span>
                                  {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                                {rev.variant && (
                                  <>
                                    <span>·</span>
                                    <span>{rev.variant}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Số sao */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  rev.rating >= star
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Nội dung nhận xét */}
                        {rev.comment && (
                          <p className="text-xs text-gray-700 leading-relaxed font-normal pt-0.5">
                            {rev.comment}
                          </p>
                        )}

                        {/* Hình ảnh đính kèm (nếu có) */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rev.images.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => setLightboxImage(imgUrl)}
                                className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-50 hover:opacity-90 transition cursor-pointer"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review ảnh ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Khối phản hồi chính thức từ người bán (Seller Reply) */}
                        {rev.sellerReply && (
                          <div className="mt-3 p-3 bg-gray-50/90 rounded-md border-l-2 border-emerald-600 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-emerald-800 text-[11px]">
                                Phản hồi từ Người bán 🏬
                              </span>
                              {rev.repliedAt && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(rev.repliedAt).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 leading-relaxed font-normal">
                              {rev.sellerReply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-6 text-center">
                    Không có đánh giá nào phù hợp với bộ lọc đã chọn.
                  </p>
                )}
              </>
            ) : (
              <div className="py-12 text-center space-y-2 bg-gray-50/50 rounded-lg">
                <Star className="w-7 h-7 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-600 font-medium">
                  Chưa có đánh giá nào
                </p>
                <p className="text-[11px] text-gray-400">
                  Sản phẩm này chưa có lượt đánh giá nào từ khách hàng.
                </p>
              </div>
            )}
          </div>
        )}

        {/* LIGHTBOX PHÓNG TO ẢNH REVIEW */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-xl max-h-[85vh]">
              <img
                src={lightboxImage}
                alt="Phóng to ảnh"
                className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md font-bold text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: HỎI ĐÁP (FAQ & Q&A) */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-850">
                Câu hỏi thường gặp
              </h4>

              {faqs.length > 0 ? (
                <div className="space-y-2.5">
                  {faqs.map((faqItem: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                      <div className="font-medium text-gray-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{faqItem.question}</span>
                      </div>
                      <p className="text-gray-600 pl-5">{faqItem.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Chưa có câu hỏi thường gặp nào cho sản phẩm này.
                </p>
              )}
            </div>

            {/* Form gửi câu hỏi */}
            <form onSubmit={handleSendQuestion} className="space-y-2.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-700 block">
                Đặt câu hỏi cho người bán
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn về sản phẩm này..."
                  className="flex-1 text-xs px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </div>
              {questionSent && (
                <p className="text-[11px] text-emerald-600 font-medium animate-fade-in">
                  ✓ Câu hỏi của bạn đã được gửi tới người bán!
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
