import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Scale, FileText, Lock, Mail, Phone, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | CommerceOS',
  description:
    'Quy chế hoạt động và điều khoản sử dụng sàn giao dịch thương mại điện tử CommerceOS.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-6 py-2 sm:py-5 space-y-3.5 sm:space-y-2">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Văn bản pháp lý' },
            { label: 'Điều khoản dịch vụ' },
          ]}
        />

        {/* 2-Column Documentation Layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
          {/* Cột trái: Điều hướng & Mục lục */}
          <aside className="w-full lg:w-64 shrink-0 space-y-3">
            {/* Bộ chuyển đổi văn bản pháp lý */}
            <div className="bg-white border border-gray-200/70 rounded-xl p-2.5 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1 block">
                Văn bản pháp lý
              </span>
              <Link
                href="/terms"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điều khoản dịch vụ</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
              <Link
                href="/privacy"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-gray-50 text-xs font-medium transition"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Chính sách bảo mật</span>
                </div>
              </Link>
            </div>

            {/* Mục lục nhanh */}
            <div className="bg-white border border-gray-200/70 rounded-xl p-3 shadow-2xs space-y-1.5 hidden lg:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 py-0.5 block">
                Mục lục quy chế
              </span>
              <nav className="space-y-1 text-xs text-gray-600">
                <a href="#dieu-1" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  1. Định nghĩa & Phạm vi
                </a>
                <a href="#dieu-2" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  2. Tài khoản & Bảo mật
                </a>
                <a href="#dieu-3" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  3. Đặt hàng & Thanh toán
                </a>
                <a href="#dieu-4" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  4. Giao nhận & Đổi trả
                </a>
                <a href="#dieu-5" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  5. Hàng chính hãng & Sở hữu trí tuệ
                </a>
              </nav>
            </div>

            {/* Hộp hỗ trợ pháp lý */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 space-y-1 text-xs text-emerald-900 hidden lg:block">
              <span className="font-bold text-[11px] block">Cần hỗ trợ quy chế?</span>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Đội ngũ pháp chế luôn sẵn sàng giải đáp thắc mắc của bạn:
              </p>
              <div className="pt-1 space-y-1 text-[11px] text-emerald-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-emerald-600" />
                  <span>support@commerceos.vn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Hotline: 1900 6868</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Cột phải: Nội dung văn bản với font chữ tinh gọn */}
          <article className="flex-1 min-w-0 w-full bg-white border border-gray-200/70 rounded-xl p-4 sm:p-6 shadow-2xs space-y-5">
            {/* Header văn bản */}
            <div className="space-y-1.5 pb-3 border-b border-gray-100">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                <Scale className="w-3 h-3 text-emerald-600" />
                <span>Quy chế hoạt động sàn TMĐT</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                Điều Khoản Sử Dụng Dịch Vụ
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Áp dụng cho mọi thành viên tham gia giao dịch trên sàn thương mại điện tử CommerceOS.
              </p>
              <div className="text-[11px] text-gray-400 font-medium">
                Phiên bản hiệu lực: Tháng 11/2026
              </div>
            </div>

            {/* Nội dung chi tiết các điều */}
            <div className="space-y-5 text-xs text-gray-600 leading-relaxed">
              {/* Điều 1 */}
              <section id="dieu-1" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  Định nghĩa và Phạm vi dịch vụ
                </h2>
                <p>
                  <strong>CommerceOS</strong> là nền tảng sàn giao dịch thương mại điện tử kết nối giữa các đơn vị kinh doanh, thương hiệu chính hãng (Người bán) và người tiêu dùng (Người mua). Chúng tôi cung cấp hạ tầng công nghệ, hệ thống danh mục sản phẩm, cổng đặt hàng, quản lý vận chuyển và hỗ trợ giải quyết khiếu nại.
                </p>
              </section>

              {/* Điều 2 */}
              <section id="dieu-2" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  Tài khoản và Trách nhiệm bảo mật
                </h2>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Người dùng phải từ đủ 15 tuổi trở lên hoặc có sự đồng ý, giám sát của người đại diện hợp pháp khi tham gia giao dịch.
                  </li>
                  <li>
                    Bạn có trách nhiệm cung cấp thông tin chính xác, đầy đủ khi đăng ký (bao gồm họ tên, số điện thoại, địa chỉ nhận hàng và email).
                  </li>
                  <li>
                    Bạn chịu trách nhiệm duy trì tính bảo mật của mật khẩu và toàn bộ hoạt động phát sinh dưới tài khoản của mình. Thông báo ngay cho CommerceOS nếu phát hiện truy cập trái phép.
                  </li>
                </ul>
              </section>

              {/* Điều 3 */}
              <section id="dieu-3" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  Đặt hàng, Giá cả và Thanh toán
                </h2>
                <p>
                  Mọi giá hiển thị trên website đã bao gồm thuế Giá trị gia tăng (VAT) theo quy định hiện hành, chưa bao gồm cước phí vận chuyển (nếu có). Cước phí vận chuyển sẽ được hiển thị rõ ràng tại bước Thanh toán trước khi bạn xác nhận đặt mua.
                </p>
                <p>
                  CommerceOS hỗ trợ hình thức thanh toán khi nhận hàng (COD). Người mua có quyền đồng kiểm ngoại quan gói hàng theo chính sách kiểm hàng trước khi thanh toán.
                </p>
              </section>

              {/* Điều 4 */}
              <section id="dieu-4" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  Chính sách Giao nhận và Đổi trả
                </h2>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Thời gian giao hàng tiêu chuẩn dao động từ 1 - 3 ngày làm việc đối với nội thành và 2 - 5 ngày làm việc đối với các tỉnh thành khác.
                  </li>
                  <li>
                    Người mua được quyền yêu cầu đổi trả hoặc hoàn tiền trong vòng <strong>7 ngày</strong> kể từ thời điểm nhận hàng thành công nếu sản phẩm có lỗi từ nhà sản xuất, bể vỡ do vận chuyển hoặc giao sai mẫu mã.
                  </li>
                  <li>
                    Sản phẩm đổi trả phải còn nguyên tem mác, phụ kiện, hóa đơn và chưa qua sử dụng.
                  </li>
                </ul>
              </section>

              {/* Điều 5 */}
              <section id="dieu-5" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    5
                  </span>
                  Cam kết Hàng chính hãng và Quyền sở hữu trí tuệ
                </h2>
                <p>
                  CommerceOS nghiêm cấm triệt để việc buôn bán hàng giả, hàng nhái, hàng vi phạm quyền sở hữu trí tuệ. Người bán vi phạm sẽ bị khóa tài khoản vĩnh viễn và chuyển giao cơ quan thẩm quyền xử lý theo pháp luật Việt Nam.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
