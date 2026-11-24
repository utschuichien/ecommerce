'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface InventoryItemRecord {
  id: string;
  name: string;
  brand: string;
  variant: string;
  sku: string;
  stock: number;
  image: string;
  category: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  statusLabel: string;
  statusColor: 'green' | 'amber' | 'rose';
  updatedAt?: string;
}

interface StockAdjustModalProps {
  isOpen: boolean;
  item: InventoryItemRecord | null;
  onClose: () => void;
  onSave: (itemId: string, newStock: number, reason: string) => void;
}

export function StockAdjustModal({
  isOpen,
  item,
  onClose,
  onSave,
}: StockAdjustModalProps) {
  const [adjustType, setAdjustType] = useState<'SET' | 'ADD' | 'SUBTRACT'>('SET');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('Kiểm kê định kỳ');

  useEffect(() => {
    if (item) {
      setAmount(String(item.stock));
      setAdjustType('SET');
      setReason('Kiểm kê định kỳ');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const currentStock = item.stock;
  const numAmount = parseInt(amount, 10) || 0;

  let resultingStock = currentStock;
  if (adjustType === 'SET') {
    resultingStock = Math.max(0, numAmount);
  } else if (adjustType === 'ADD') {
    resultingStock = currentStock + Math.max(0, numAmount);
  } else if (adjustType === 'SUBTRACT') {
    resultingStock = Math.max(0, currentStock - Math.max(0, numAmount));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resultingStock < 0) {
      toast.error('Tồn kho không hợp lệ', {
        description: 'Số lượng tồn kho không thể nhỏ hơn 0.',
      });
      return;
    }

    onSave(item.id, resultingStock, reason);
    toast.success('Đã cập nhật tồn kho', {
      description: `${item.name} · Số lượng mới: ${resultingStock}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Điều chỉnh tồn kho
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Mã SKU: {item.sku}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin sản phẩm & biến thể */}
        <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-gray-900 truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-semibold text-gray-500">
                {item.brand}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                {item.variant}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Tồn kho hiện tại:{' '}
              <span className="font-bold text-gray-900">{currentStock}</span>
            </p>
          </div>
        </div>

        {/* Form điều chỉnh */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Kiểu điều chỉnh */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Phương thức cập nhật
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('SET');
                  setAmount(String(currentStock));
                }}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                  adjustType === 'SET'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đặt số lượng
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('ADD');
                  setAmount('10');
                }}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                  adjustType === 'ADD'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-3 h-3" /> Nhập thêm
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('SUBTRACT');
                  setAmount('1');
                }}
                className={`py-2 px-2.5 rounded-lg border text-center font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                  adjustType === 'SUBTRACT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Minus className="w-3 h-3" /> Xuất bớt
              </button>
            </div>
          </div>

          {/* Ô nhập số lượng */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {adjustType === 'SET'
                ? 'Số lượng tồn kho mới *'
                : adjustType === 'ADD'
                ? 'Số lượng nhập thêm *'
                : 'Số lượng xuất kho *'}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 font-bold text-gray-900 transition"
              required
            />
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              → Tồn kho sau cập nhật:{' '}
              <span className="font-bold text-base text-gray-950">
                {resultingStock}
              </span>{' '}
              sản phẩm
            </p>
          </div>

          {/* Lý do điều chỉnh */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Lý do điều chỉnh
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition cursor-pointer bg-white"
            >
              <option value="Kiểm kê định kỳ">Kiểm kê định kỳ</option>
              <option value="Nhập hàng mới từ nhà cung cấp">Nhập hàng mới từ nhà cung cấp</option>
              <option value="Xuất chuyển kho / Bán trực tiếp">Xuất chuyển kho / Bán trực tiếp</option>
              <option value="Hàng lỗi / Hư hỏng">Hàng lỗi / Hư hỏng cần loại bỏ</option>
              <option value="Khách trả hàng / Hoàn kho">Khách trả hàng / Hoàn kho</option>
            </select>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Xác nhận cập nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
