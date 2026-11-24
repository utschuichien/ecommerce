'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { HomeView } from '../components/home/HomeView';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2.5">
        <HomeView
          onSelectProduct={(product) => {
            router.push(`/products/${product.slug}`);
          }}
          onNavigateToCatalog={() => {
            router.push('/products');
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
