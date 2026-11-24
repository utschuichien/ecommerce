import React from 'react';
import { Metadata } from 'next';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { CheckoutView } from '../../components/checkout/CheckoutView';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Thanh toán đơn hàng | CommerceOS',
  description: 'Điền thông tin nhận hàng và thanh toán an toàn, bảo mật tại CommerceOS',
};

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Header />

        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-3.5 pb-6 sm:pb-8">
          <CheckoutView />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
