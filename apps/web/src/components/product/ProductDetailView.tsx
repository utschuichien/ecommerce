'use client';

import React, { useState } from 'react';
import { CATALOG_PRODUCTS, Product } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';

interface ProductDetailViewProps {
  product?: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onNavigateHome: () => void;
  onNavigateCatalog: () => void;
}

export function ProductDetailView({
  product = CATALOG_PRODUCTS[0],
  onAddToCart,
  onNavigateHome,
  onNavigateCatalog,
}: ProductDetailViewProps) {
  const images = product.images || [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedCapacity, setSelectedCapacity] = useState(product.capacities?.[0] || '128GB');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    onAddToCart?.(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onNavigateHome} className="hover:text-emerald-600 transition">
          Trang chủ
        </button>
        <span>&gt;</span>
        <button onClick={onNavigateCatalog} className="hover:text-emerald-600 transition">
          {product.category}
        </button>
        <span>&gt;</span>
        <span className="font-semibold text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
        {/* Left: Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-col gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden p-1 transition ${
                    selectedImage === img
                      ? 'border-emerald-600 ring-2 ring-emerald-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Main Showcase Image */}
          <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-6 min-h-[380px] border border-gray-100">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[350px] object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Right: Info & Purchase */}
        <div className="space-y-5">
          {/* Discount Badge & Title */}
          <div>
            {product.discountPercent && (
              <span className="inline-block bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                Giảm giá
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span className="text-amber-400">★★★★★</span>
              <span className="font-semibold text-gray-800">{product.rating}</span>
              <span>({product.reviewsCount} đánh giá)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60">
            <span className="text-3xl font-extrabold text-emerald-800">
              {formatVND(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatVND(product.oldPrice)}
              </span>
            )}
            {product.discountPercent && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700">
                Màu sắc: <span className="font-normal text-gray-900">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      selectedColor === c.name
                        ? 'border-emerald-600 ring-2 ring-emerald-200 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Capacity Selection */}
          {product.capacities && product.capacities.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700">Dung lượng:</span>
              <div className="flex items-center gap-2">
                {product.capacities.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setSelectedCapacity(cap)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      selectedCapacity === cap
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Số lượng:</span>
              <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition transform active:scale-98 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button
                className="p-3.5 border border-gray-200 hover:border-rose-300 hover:text-rose-500 rounded-xl transition"
                title="Thêm vào yêu thích"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {addedNotice && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg animate-fadeIn flex items-center gap-2 font-medium">
                <span>✓ Đã thêm sản phẩm vào giỏ hàng thành công!</span>
              </div>
            )}
          </div>

          {/* 3 Commitment Badges */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-[11px] text-gray-600">
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50">
              <span className="text-base mb-1">🚚</span>
              <strong className="text-gray-900">Miễn phí vận chuyển</strong>
              <span className="text-gray-500">cho đơn từ 500.000đ</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50">
              <span className="text-base mb-1">🔄</span>
              <strong className="text-gray-900">Đổi trả trong 7 ngày</strong>
              <span className="text-gray-500">nếu có lỗi từ NSX</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50">
              <span className="text-base mb-1">🛡️</span>
              <strong className="text-gray-900">Bảo hành chính hãng</strong>
              <span className="text-gray-500">12 tháng toàn quốc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex border-b border-gray-100 text-sm font-semibold gap-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 transition relative ${
              activeTab === 'desc'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition relative ${
              activeTab === 'specs'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition relative ${
              activeTab === 'reviews'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Đánh giá ({product.reviewsCount})
          </button>
        </div>

        <div className="text-xs md:text-sm text-gray-600 leading-relaxed pt-2">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>
                {product.name} mang đến trải nghiệm mượt mà với hiệu năng tối ưu, camera sắc nét và thiết kế sang trọng. Đây là sự lựa chọn hoàn hảo cho những ai yêu thích công nghệ cao cấp và độ hoàn thiện tinh tế.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>Thiết kế cao cấp, khung viền nhôm bền bỉ.</li>
                <li>Màn hình Super Retina sống động, sắc nét dưới mọi góc nhìn.</li>
                <li>Thời lượng pin ấn tượng đáp ứng trọn vẹn cả ngày làm việc.</li>
              </ul>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="divide-y divide-gray-100">
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Thương hiệu</span>
                <span className="font-semibold text-gray-900">{product.brand}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Xuất xứ</span>
                <span className="font-semibold text-gray-900">Chính hãng</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Bảo hành</span>
                <span className="font-semibold text-gray-900">12 tháng</span>
              </div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  V
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs">Vũ Minh Q.</div>
                  <div className="text-amber-400 text-xs">★★★★★ - Rất hài lòng</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
