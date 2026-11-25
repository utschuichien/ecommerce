import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Lock, Scale, Mail, Phone, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật thông tin | CommerceOS',
  description:
    'Chính sách thu thập, lưu trữ, xử lý và bảo vệ dữ liệu cá nhân của khách hàng trên CommerceOS.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3.5 sm:space-y-2">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Văn bản pháp lý' },
            { label: 'Chính sách bảo mật' },
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
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-gray-50 text-xs font-medium transition"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-gray-400" />
                  <span>Điều khoản dịch vụ</span>
                </div>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chính sách bảo mật</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
            </div>

            {/* Mục lục nhanh */}
            <div className="bg-white border border-gray-200/70 rounded-xl p-3 shadow-2xs space-y-1.5 hidden lg:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 py-0.5 block">
                Mục lục bảo mật
              </span>
              <nav className="space-y-1 text-xs text-gray-600">
                <a href="#muc-1" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  1. Mục đích thu thập
                </a>
                <a href="#muc-2" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  2. Phạm vi dữ liệu
                </a>
                <a href="#muc-3" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  3. Chia sẻ với bên thứ ba
                </a>
                <a href="#muc-4" className="block px-2 py-1 rounded hover:bg-gray-50 hover:text-emerald-700 transition">
                  4. Quyền của người dùng
                </a>
              </nav>
            </div>

            {/* Hộp hỗ trợ pháp lý */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 space-y-1 text-xs text-emerald-900 hidden lg:block">
              <span className="font-bold text-[11px] block">Bảo vệ quyền riêng tư</span>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Yêu cầu trích xuất hoặc xóa dữ liệu cá nhân xin vui lòng liên hệ:
              </p>
              <div className="pt-1 space-y-1 text-[11px] text-emerald-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-emerald-600" />
                  <span>privacy@commerceos.vn</span>
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
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Bảo vệ quyền riêng tư & dữ liệu</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">
                Chính Sách Bảo Mật Thông Tin Cá Nhân
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                CommerceOS cam kết tuyệt đối bảo vệ quyền riêng tư và thông tin cá nhân của người dùng theo quy định pháp luật Việt Nam.
              </p>
              <div className="text-[11px] text-gray-400 font-medium">
                Hiệu lực từ: Tháng 11/2026
              </div>
            </div>

            {/* Nội dung chi tiết các mục */}
            <div className="space-y-5 text-xs text-gray-600 leading-relaxed">
              {/* Mục 1 */}
              <section id="muc-1" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  Mục đích thu thập dữ liệu cá nhân
                </h2>
                <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Xử lý đơn hàng, điều phối vận chuyển và giao bưu kiện tới đúng địa chỉ của bạn.</li>
                  <li>Thông báo trạng thái đơn mua, cập nhật bảo hành và hỗ trợ giải quyết thắc mắc khiếu nại.</li>
                  <li>Xác thực tài khoản, phòng chống các hành vi gian lận và nâng cao bảo mật hệ thống.</li>
                  <li>Cung cấp gợi ý sản phẩm phù hợp nếu bạn cho phép cá nhân hóa trải nghiệm.</li>
                </ul>
              </section>

              {/* Mục 2 */}
              <section id="muc-2" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  Phạm vi và Loại dữ liệu thu thập
                </h2>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Thông tin cơ bản:</strong> Họ tên, số điện thoại, địa chỉ nhận hàng, địa chỉ email.</li>
                  <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, nhật ký phiên đăng nhập, thông tin cookie hỗ trợ duy trì giỏ hàng.</li>
                  <li><strong>Thông tin giao dịch:</strong> Lịch sử đặt hàng, mã đơn, giá trị thanh toán, mã voucher sử dụng.</li>
                </ul>
              </section>

              {/* Mục 3 */}
              <section id="muc-3" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  Chia sẻ thông tin với bên thứ ba
                </h2>
                <p>
                  CommerceOS <strong>cam kết không bán, chia sẻ hoặc thương mại hóa</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Thông tin chỉ được chuyển giao trong phạm vi bắt buộc cho:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Đơn vị vận chuyển đối tác (để in phiếu gửi và giao kiện hàng).</li>
                  <li>Cổng thanh toán bảo mật (xác thực và đối soát giao dịch).</li>
                  <li>Cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp theo quy định pháp luật.</li>
                </ul>
              </section>

              {/* Mục 4 */}
              <section id="muc-4" className="space-y-1.5 scroll-mt-20">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 pb-1 border-b border-gray-100">
                  <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  Quyền của bạn đối với dữ liệu cá nhân
                </h2>
                <p>
                  Bạn có toàn quyền truy cập, kiểm tra, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào tại mục <Link href="/profile" className="text-emerald-700 underline font-semibold">Tài khoản của tôi</Link> hoặc liên hệ đội ngũ chăm sóc khách hàng của CommerceOS.
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
