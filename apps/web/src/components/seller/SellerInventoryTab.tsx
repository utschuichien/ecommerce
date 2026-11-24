'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Box,
  Download,
  AlertTriangle,
  Package,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  Edit,
  History,
  Eye,
  Check,
} from 'lucide-react';
import { Pagination } from '@/components/common';
import { toast } from 'sonner';
import {
  useSellerInventory,
  useSellerInventoryStats,
  useAdjustSellerInventory,
  useSellerCategories,
} from '@/features/seller';
import { StockAdjustModal, InventoryItemRecord } from './modals';
import { SellerDropdown, SellerFilterPopover } from './common/SellerDropdown';

export function SellerInventoryTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItemRecord | null>(null);

  // Bộ lọc nâng cao: Sắp xếp theo mức tồn, Lọc mức tồn chi tiết
  const [sortBy, setSortBy] = useState<string>('NEWEST');
  const [stockLevel, setStockLevel] = useState<string>('ALL');

  // Custom Hooks (React Query)
  const { data: categories = [] } = useSellerCategories();
  const { data: statsData } = useSellerInventoryStats();
  const { data: inventoryData, isLoading } = useSellerInventory({
    search: searchQuery || undefined,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    sortBy,
    stockLevel: stockLevel === 'ALL' ? undefined : stockLevel,
    page,
    limit: 6,
  });
  const adjustStockMutation = useAdjustSellerInventory();

  // Dữ liệu kho hàng thực tế từ DB
  const items: InventoryItemRecord[] = inventoryData?.items || [];

  const totalItems = inventoryData?.pagination?.totalItems ?? 0;
  const totalPages = inventoryData?.pagination?.totalPages ?? 1;

  const stats = statsData || {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStockQuantity: '0',
  };

  // Danh sách options cho bộ lọc
  const categoryOptions = useMemo(() => [
    { label: 'Tất cả danh mục', value: 'ALL' },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
  ], [categories]);

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: 'ALL' },
    { label: 'Còn hàng', value: 'IN_STOCK' },
    { label: 'Sắp hết hàng', value: 'LOW_STOCK' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
  ];

  // Lọc danh sách tồn kho
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  // Checkbox chọn tất cả
  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Cập nhật số lượng tồn kho từ Modal qua custom hook mutation
  const handleSaveStock = async (itemId: string, newStock: number, reason: string) => {
    try {
      await adjustStockMutation.mutateAsync({
        itemId,
        newStock,
        reason,
      });
      toast.success('Điều chỉnh tồn kho', {
        description: 'Số lượng tồn kho đã được đồng bộ hệ thống.',
      });
    } catch (err: any) {
      toast.error('Điều chỉnh thất bại', {
        description: err?.response?.data?.message || 'Không thể điều chỉnh tồn kho lúc này.',
      });
    }
  };

  // Xuất file báo cáo tồn kho
  const handleExportFile = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Sản phẩm,Thương hiệu,Biến thể,SKU,Tồn kho,Trạng thái']
        .concat(
          items.map(
            (i) =>
              `"${i.name}","${i.brand}","${i.variant}","${i.sku}",${i.stock},"${i.statusLabel}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_ton_kho_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Xuất file thành công', {
      description: 'Báo cáo tồn kho đã được tải về máy tính.',
    });
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* 1. BREADCRUMB */}
      {/* 2. TIÊU ĐỀ TRANG + NÚT XUẤT FILE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
            <h1 className="text-xl font-bold text-gray-950 tracking-tight">
              Quản lý kho hàng
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi và quản lý tồn kho sản phẩm trong cửa hàng của bạn
          </p>
        </div>

        {/* Nút Xuất file */}
        <button
          type="button"
          onClick={handleExportFile}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50/60 hover:bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-2xs transition active:scale-95"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>Xuất file</span>
        </button>
      </div>

      {/* 3. BỐN Ô THỐNG KÊ (ĐỒNG BỘ HIỂN THỊ SỐ CHUẨN XÁC) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Ô 1: Tổng sản phẩm */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Tổng sản phẩm
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.totalProducts ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 2: Sắp hết hàng */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Sắp hết hàng
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.lowStock ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 3: Hết hàng */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Hết hàng
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.outOfStock ?? 0}
            </span>
          </div>
        </div>

        {/* Ô 4: Tồn kho hiện tại */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">
              Tồn kho hiện tại
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {stats.totalStockQuantity || '0'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200/90 rounded-lg text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 shadow-2xs transition"
          />
        </div>

        {/* Cụm bộ lọc Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Lọc danh mục */}
          <SellerDropdown
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            options={categoryOptions}
            placeholder="Danh mục"
          />

          {/* Lọc trạng thái */}
          <SellerDropdown
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val as typeof selectedStatus);
              setPage(1);
            }}
            options={statusOptions}
            placeholder="Trạng thái"
          />

          {/* Popover Bộ lọc nâng cao */}
          <SellerFilterPopover
            title="Bộ lọc kho hàng"
            activeCount={
              (sortBy !== 'NEWEST' ? 1 : 0) + (stockLevel !== 'ALL' ? 1 : 0)
            }
            onReset={() => {
              setSortBy('NEWEST');
              setStockLevel('ALL');
              setPage(1);
            }}
            sections={[
              {
                id: 'sortBy',
                title: 'Sắp xếp theo',
                currentValue: sortBy,
                onChange: (v) => {
                  setSortBy(v);
                  setPage(1);
                },
                options: [
                  { label: 'Mới cập nhật', value: 'NEWEST' },
                  { label: 'Tồn kho: Thấp đến cao', value: 'STOCK_ASC' },
                  { label: 'Tồn kho: Cao đến thấp', value: 'STOCK_DESC' },
                  { label: 'Tên: A - Z', value: 'NAME_ASC' },
                ],
              },
              {
                id: 'stockLevel',
                title: 'Mức tồn kho',
                currentValue: stockLevel,
                onChange: (v) => {
                  setStockLevel(v);
                  setPage(1);
                },
                options: [
                  { label: 'Tất cả', value: 'ALL' },
                  { label: 'Hết hàng (= 0)', value: 'OUT_OF_STOCK' },
                  { label: 'Sắp hết (<= 10)', value: 'LOW_STOCK' },
                  { label: 'An toàn (> 10)', value: 'SAFE' },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* 5. BẢNG DANH SÁCH KHO HÀNG */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-600 font-semibold select-none">
                <th className="py-3.5 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th className="py-3.5 px-3 min-w-[220px]">Sản phẩm</th>
                <th className="py-3.5 px-3 min-w-[130px]">Biến thể</th>
                <th className="py-3.5 px-3 min-w-[130px]">SKU</th>
                <th className="py-3.5 px-3 min-w-[90px]">Tồn kho</th>
                <th className="py-3.5 px-3 min-w-[120px]">Trạng thái</th>
                <th className="py-3.5 px-3 min-w-[100px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/60 transition ${
                      isSelected ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                    </td>

                    {/* Sản phẩm (Ảnh + Tên + Thương hiệu) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-950 truncate hover:text-emerald-600 transition cursor-pointer">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {item.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Biến thể */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {item.variant}
                      </span>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs text-gray-600">
                        {item.sku}
                      </span>
                    </td>

                    {/* Tồn kho */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-gray-950 text-sm">
                        {item.stock}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                          item.statusColor === 'green'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : item.statusColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.statusColor === 'green'
                              ? 'bg-emerald-500'
                              : item.statusColor === 'amber'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{item.statusLabel}</span>
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center transition cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu thao tác */}
                        {activeMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-40 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustingItem(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-700 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Cập nhật tồn kho</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info(`Xem lịch sử nhập xuất của SKU: ${item.sku}`);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5 text-gray-500" />
                                <span>Lịch sử biến động</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="font-semibold text-gray-700">
                        {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || stockLevel !== 'ALL' || sortBy !== 'NEWEST'
                          ? 'Không tìm thấy sản phẩm nào trong kho hàng'
                          : 'Kho hàng hiện đang trống'}
                      </span>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || stockLevel !== 'ALL' || sortBy !== 'NEWEST'
                          ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc'
                          : 'Bắt đầu thêm sản phẩm vào gian hàng để theo dõi và quản lý tồn kho'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. PHÂN TRANG (CHÍNH XÁC NHƯ MẪU THIẾT KẾ) */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={6}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* 7. MODAL ĐIỀU CHỈNH TỒN KHO NHANH */}
      <StockAdjustModal
        isOpen={Boolean(adjustingItem)}
        item={adjustingItem}
        onClose={() => setAdjustingItem(null)}
        onSave={handleSaveStock}
      />
    </div>
  );
}
