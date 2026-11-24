import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Headphones, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    tag: "Công nghệ tạo nên cuộc sống tốt đẹp hơn",
    title: "Sản phẩm chất lượng",
    highlight: "cho cuộc sống hiện đại",
    desc: "Khám phá hàng ngàn sản phẩm từ các nhà bán uy tín, đáp ứng mọi nhu cầu từ công nghệ, thời trang đến gia dụng.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&auto=format&fit=crop&q=80",
    alt: "Laptop và tai nghe trên bàn làm việc",
  },
  {
    tag: "Ưu đãi mỗi ngày",
    title: "Công nghệ mới nhất",
    highlight: "giá tốt mỗi ngày",
    desc: "Từ laptop, điện thoại đến phụ kiện thông minh, cập nhật liên tục các mẫu mới với mức giá hấp dẫn.",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&auto=format&fit=crop&q=80",
    alt: "Thiết bị công nghệ",
  },
  {
    tag: "Mua sắm an tâm",
    title: "Nhà bán uy tín",
    highlight: "giao hàng tận nơi",
    desc: "Mọi sản phẩm đều được kiểm duyệt, đổi trả dễ dàng và hỗ trợ tận tình trong suốt quá trình mua hàng.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&auto=format&fit=crop&q=80",
    alt: "Mua sắm trực tuyến",
  },
];

const BADGES = [
  { icon: Truck, title: "Miễn phí vận chuyển", sub: "cho đơn từ 500.000đ" },
  { icon: ShieldCheck, title: "Bảo hành chính hãng", sub: "lên đến 12 tháng" },
  { icon: Headphones, title: "Hỗ trợ 24/7", sub: "luôn sẵn sàng" },
];

export default function HeroBanner({  }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setIndex((i) => (i + 1) % SLIDES.length);

  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-100/80 bg-gray-50">
      {/* Ảnh nền bên phải, mờ dần sang trái */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[65%]">
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gray-50/90 lg:bg-transparent lg:bg-gradient-to-r lg:from-gray-50 lg:via-gray-50/40 lg:to-transparent" />
      </div>

      {/* Nội dung */}
      <div className="relative z-10 flex flex-col justify-center gap-3.5 px-5 pt-7 pb-14 sm:px-8 sm:py-8 lg:min-h-[300px] lg:max-w-[58%] lg:px-12">
        <span className="text-xs font-medium text-emerald-700">{slide.tag}</span>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug tracking-tight text-gray-900">
          {slide.title}
          <span className="block text-emerald-600">{slide.highlight}</span>
        </h1>

        <p className="max-w-md text-xs sm:text-sm leading-relaxed text-gray-600">
          {slide.desc}
        </p>

        <div>
          <Link
            href="/products"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 active:scale-95"
          >
            <span>Mua sắm ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Badge cam kết: một hàng, không viền */}
        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-gray-600">
          {BADGES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-gray-700" strokeWidth={1.75} />
              <div className="leading-snug">
                <strong className="block font-semibold text-xs text-gray-800">{title}</strong>
                <span className="text-xs text-gray-500">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phân trang góc dưới phải */}
      <div className="absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1 rounded-md border border-gray-200/70 bg-white/90 px-1.5 py-1 text-xs font-medium text-gray-700 shadow-xs backdrop-blur">
        <button
          onClick={prev}
          aria-label="Slide trước"
          className="cursor-pointer rounded p-0.5 hover:text-emerald-700"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-1">
          {index + 1}/{SLIDES.length}
        </span>
        <button
          onClick={next}
          aria-label="Slide sau"
          className="cursor-pointer rounded p-0.5 hover:text-emerald-700"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}