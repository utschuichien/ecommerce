'use client';

import React, { useState } from 'react';
import { MOCK_ORDERS } from '../mock/mock-data';
import { formatVND } from '../../lib/api-client';
import { Breadcrumbs } from '../common/Breadcrumbs';

export function AccountView() {
  const [activeMenu, setActiveMenu] = useState('profile');

  const menuItems = [
    { id: 'profile', label: 'Tài khoản của tôi', icon: '👤' },
    { id: 'orders', label: 'Đơn hàng', icon: '📦' },
    { id: 'address', label: 'Địa chỉ', icon: '📍' },
    { id: 'wishlist', label: 'Yêu thích', icon: '❤️' },
    { id: 'reviews', label: 'Đánh giá', icon: '⭐' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs items={[{ label: 'Tài khoản của tôi' }]} />

      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Trung tâm tài khoản</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý thông tin cá nhân và lịch sử đơn hàng của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Menu (3 cols) */}
        <aside className="md:col-span-3 bg-white border border-gray-100 rounded-2xl p-4 space-y-1 text-xs">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition ${
                activeMenu === item.id
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Center: Profile Details (5 cols) */}
        <section className="md:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Thông tin cá nhân</h2>
            <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
              Chỉnh sửa
            </button>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
              N
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Nguyễn Văn A</h3>
              <p className="text-xs text-gray-500">nguyenvana@example.com</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Thành viên thân thiết
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs pt-2">
            <div>
              <label className="block text-gray-500 mb-1">Họ và tên</label>
              <input
                type="text"
                defaultValue="Nguyễn Văn A"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Số điện thoại</label>
              <input
                type="text"
                defaultValue="0901 234 567"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Email</label>
              <input
                type="text"
                defaultValue="nguyenvana@example.com"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Right: Recent Orders (4 cols) */}
        <section className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Đơn hàng gần đây</h2>
            <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
              Xem tất cả &rarr;
            </button>
          </div>

          {/* Order Cards */}
          <div className="space-y-3">
            {MOCK_ORDERS.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-emerald-50/30 transition text-xs"
              >
                <img
                  src={ord.image}
                  alt={ord.id}
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 p-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <strong className="text-gray-900 font-bold truncate">#{ord.id}</strong>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.statusColor === 'green'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.statusColor === 'orange'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{ord.date}</div>
                  <div className="text-xs font-bold text-gray-900 mt-1">{formatVND(ord.total)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
