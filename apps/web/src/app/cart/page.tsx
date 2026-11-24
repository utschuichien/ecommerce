import React from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { CartView } from '../../components/cart/CartView';

export const metadata: Metadata = {
  title: 'Giỏ hàng | CommerceOS',
  description: 'Xem lại danh sách sản phẩm đã chọn và tiến hành thanh toán an toàn',
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2.5">
        <CartView />
      </main>
      <Footer />
    </div>
  );
}
