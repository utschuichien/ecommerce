'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ShoppingCart,
  Package,
  TrendingUp,
  Download,
  Calendar,
  ChevronDown,
  Trophy,
  ArrowRight,
  BarChart3,
  Tag,
  Users,
  Lightbulb,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSellerAnalytics } from '@/features/seller';
import { SellerTabType } from './seller-types';
import { SellerDropdown } from './common/SellerDropdown';

interface SellerAnalyticsTabProps {
  onNavigateTab?: (tab: SellerTabType) => void;
}

// Dữ liệu biểu đồ doanh thu theo các mốc thời gian
interface ChartDataPoint {
  date: string;
  amount: number; // đơn vị triệu VNĐ
  label: string;
  x: number; // percentage 0 - 100
  y: number; // Y coordinate in viewBox (50tr = top, 0tr = bottom)
}

export function SellerAnalyticsTab({ onNavigateTab }: SellerAnalyticsTabProps) {
  // Khoảng thời gian chính: 7 ngày, 30 ngày, 90 ngày
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  // Custom Hook (React Query)
  const { data: analyticsData } = useSellerAnalytics(timeRange);

  const kpi = analyticsData?.kpi || {
    totalRevenue: 0,
    totalRevenueFormatted: '0đ',
    totalOrders: 0,
    itemsSold: 0,
  };

  const topProducts = analyticsData?.topProducts || [];
  const paymentBreakdown = analyticsData?.paymentBreakdown || [];

  // Bộ lọc ngày tổng thể (Dropdown góc phải)
  const periodOptions = [
    { label: '7 ngày qua', value: '7' },
    { label: '30 ngày qua', value: '30' },
    { label: '90 ngày qua', value: '90' },
  ];

  // Bộ lọc thời gian hiệu suất
  const [metricFilter, setMetricFilter] = useState('30 ngày gần nhất');
  const metricOptions = [
    { label: '30 ngày gần nhất', value: '30 ngày gần nhất' },
    { label: '7 ngày gần nhất', value: '7 ngày gần nhất' },
    { label: 'Toàn thời gian', value: 'Toàn thời gian' },
  ];

  // Dữ liệu biểu đồ từ API
  const currentChartData = analyticsData?.revenueChart || [];
  const [activePointIndex, setActivePointIndex] = useState<number>(0);

  // Tính toán trục Y và đường cong SVG động
  const maxAmount = currentChartData.length > 0 ? Math.max(...currentChartData.map((d) => d.amount), 0) : 0;
  const yMax = maxAmount > 0 ? Math.ceil(maxAmount * 1.25) : 50;

  const chartYAxis = [
    { label: `${yMax}tr`, y: 25 },
    { label: `${Math.round(yMax * 0.8)}tr`, y: 60 },
    { label: `${Math.round(yMax * 0.6)}tr`, y: 95 },
    { label: `${Math.round(yMax * 0.4)}tr`, y: 130 },
    { label: `${Math.round(yMax * 0.2)}tr`, y: 165 },
    { label: '0tr', y: 195 },
  ];

  // Tạo đường dẫn cong mượt (Smooth Bezier SVG path)
  const generateSvgPaths = (data: ChartDataPoint[]) => {
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] };

    // Chuyển đổi x % sang tọa độ viewBox 0..600 và y dựa trên yMax
    const points = data.map((d) => ({
      x: (d.x / 100) * 560 + 25,
      y: 195 - (yMax > 0 ? (d.amount / yMax) * 170 : 0),
    }));

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const areaPath = `${linePath} L ${lastPoint.x} 195 L ${firstPoint.x} 195 Z`;

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = generateSvgPaths(currentChartData);
  const activePoint = currentChartData[activePointIndex] || currentChartData[0];
  const activeSvgCoord = points[activePointIndex] || points[0];

  const handleExport = () => {
    toast.info('Đang tạo báo cáo', {
      description: 'Đang chuẩn bị file doanh thu Excel (.xlsx) để tải xuống...',
    });
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* 1. Header & Bộ lọc thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 stroke-[2.2]" />
            <h1 className="text-xl font-bold text-gray-950 tracking-tight">
              Thống kê & Doanh thu
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi hiệu suất kinh doanh và phân tích doanh thu của cửa hàng
          </p>
        </div>

        {/* Dropdown chọn khoảng ngày */}
        <SellerDropdown
          value={timeRange}
          onChange={(val) => setTimeRange(val as typeof timeRange)}
          options={periodOptions}
          icon={<Calendar className="w-3.5 h-3.5 text-gray-500" />}
          placeholder="Thời gian"
        />
      </div>

      {/* 2. Hàng 3 Thẻ KPI chính (Đã bỏ thẻ Đánh giá) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Thẻ 1: Tổng doanh thu */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Tổng doanh thu</span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {kpi.totalRevenueFormatted}
            </span>
          </div>
        </div>

        {/* Thẻ 2: Tổng đơn hàng */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Tổng đơn hàng</span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {kpi.totalOrders}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Sản phẩm đã bán */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] text-gray-500 font-medium block">Sản phẩm đã bán</span>
            <span className="text-sm sm:text-base font-bold text-gray-900 block leading-tight mt-0.5">
              {kpi.itemsSold}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Phần giữa: Biểu đồ thời gian (Trái) & Phân bổ phương thức thanh toán (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Cột trái: Biểu đồ doanh thu theo thời gian (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          {/* Tiêu đề & Nút chuyển tab thời gian */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                Doanh thu theo thời gian
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-medium">
                {(['7', '30', '90'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setTimeRange(r);
                      setActivePointIndex(0);
                    }}
                    className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                      timeRange === r
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {r} ngày
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition cursor-pointer"
                title="Tải xuống báo cáo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Biểu đồ SVG tương tác */}
          <div className="relative w-full h-[210px] select-none">
            {/* Tooltip hiển thị giá trị điểm hover */}
            {activePoint && activeSvgCoord && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(activeSvgCoord.x / 600) * 100}%`,
                  top: `${(activeSvgCoord.y / 210) * 100}%`,
                  marginTop: '-10px',
                }}
              >
                <div className="bg-white border border-gray-100 shadow-md rounded-lg px-2.5 py-1 text-center whitespace-nowrap">
                  <div className="text-[10px] text-gray-500 font-medium">{activePoint.date}</div>
                  <div className="flex items-center gap-1 font-bold text-gray-900 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{activePoint.label}</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-white border-r border-b border-gray-100 transform rotate-45 mx-auto -mt-1" />
              </div>
            )}

            <svg
              viewBox="0 0 600 210"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lưới ngang (Grid lines) & Nhãn trục Y */}
              {chartYAxis.map((line, idx) => (
                <g key={idx}>
                  <text
                    x="2"
                    y={line.y + 3}
                    className="text-[9px] fill-gray-400 font-normal select-none"
                  >
                    {line.label}
                  </text>
                  <line
                    x1="30"
                    y1={line.y}
                    x2="595"
                    y2={line.y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </g>
              ))}

              {/* Vùng bóng mờ bên dưới đường cong */}
              {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

              {/* Đường cong doanh thu chính */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Đường dóng đứng (Vertical line) tại điểm đang active */}
              {activeSvgCoord && (
                <line
                  x1={activeSvgCoord.x}
                  y1={activeSvgCoord.y}
                  x2={activeSvgCoord.x}
                  y2={195}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
              )}

              {/* Các điểm nút (Data points) */}
              {points.map((pt, idx) => {
                const isActive = idx === activePointIndex;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setActivePointIndex(idx)}
                    onClick={() => setActivePointIndex(idx)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
                    {isActive ? (
                      <>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5.5"
                          fill="#10b981"
                          opacity="0.25"
                          className="animate-ping"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3.5"
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Trục X nhãn ngày tháng dưới biểu đồ */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 pl-7 pr-1">
              {currentChartData.length > 0 ? (
                currentChartData
                  .filter(
                    (_, i) =>
                      i === 0 ||
                      i === currentChartData.length - 1 ||
                      i % Math.max(1, Math.floor(currentChartData.length / 5)) === 0
                  )
                  .map((d) => <span key={d.date}>{d.date}</span>)
              ) : (
                <span className="text-gray-400">Không có dữ liệu</span>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Doanh thu theo phương thức thanh toán (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5">
              Doanh thu theo phương thức thanh toán
            </h3>
          </div>

          {/* Biểu đồ Donut + Legend */}
          {paymentBreakdown.length > 0 ? (
            <div className="flex items-center justify-between sm:justify-around gap-2.5 py-3 my-auto">
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  {(() => {
                    let accumulatedOffset = 0;
                    return paymentBreakdown.map((item, idx) => {
                      const color =
                        item.method === 'COD'
                          ? '#0284c7'
                          : item.method === 'WALLET'
                          ? '#f59e0b'
                          : '#10b981';
                      const strokeDash = (item.percent / 100) * 238.76;
                      const offset = -accumulatedOffset;
                      accumulatedOffset += strokeDash;
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={color}
                          strokeWidth="10"
                          strokeDasharray={`${strokeDash.toFixed(1)} 238.8`}
                          strokeDashoffset={offset.toFixed(1)}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    {kpi.totalRevenueFormatted}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">Tổng doanh thu</span>
                </div>
              </div>

              {/* Chú thích Legend */}
              <div className="space-y-2 text-xs">
                {paymentBreakdown.map((item, idx) => {
                  const color =
                    item.method === 'COD'
                      ? '#0284c7'
                      : item.method === 'WALLET'
                      ? '#f59e0b'
                      : '#10b981';
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[11px] text-gray-600">{item.label}</span>
                      </div>
                      <span className="font-bold text-xs text-gray-900">{item.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              Chưa có dữ liệu thanh toán trong khoảng thời gian này
            </div>
          )}
        </div>
      </div>

      {/* 4. Phần dưới: Sản phẩm bán chạy (Trái) & Hiệu suất kinh doanh (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Khối Trái: Sản phẩm bán chạy */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                Sản phẩm bán chạy
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('products')}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Danh sách top 3 sản phẩm */}
          <div className="space-y-2">
            {topProducts.length > 0 ? (
              topProducts.map((prod) => (
                <div
                  key={prod.rank}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${prod.rankBg}`}
                    >
                      {prod.rank}
                    </div>

                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Đã bán {prod.soldCount} sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-bold text-xs text-gray-900">
                      {prod.revenue}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                Chưa có sản phẩm nào
              </div>
            )}
          </div>
        </div>

        {/* Khối Phải: Hiệu suất kinh doanh */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                Hiệu suất kinh doanh
              </h3>
            </div>

            <SellerDropdown
              value={metricFilter}
              onChange={(val) => setMetricFilter(val)}
              options={metricOptions}
            />
          </div>

          {/* 4 Thẻ chỉ số hiệu suất nhỏ */}
          {(() => {
            const days = timeRange === '7' ? 7 : timeRange === '90' ? 90 : 30;
            const avgDaily = Math.round(kpi.totalRevenue / days);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Doanh thu TB / ngày */}
                <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-lg p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-md bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">Doanh thu TB</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 pl-0.5">{avgDaily.toLocaleString('vi-VN')}đ</div>
                </div>

                {/* 2. Đơn hoàn tất */}
                <div className="bg-blue-50/40 border border-blue-100/60 rounded-lg p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-md bg-blue-100/80 text-blue-600 flex items-center justify-center">
                      <ShoppingCart className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">Đơn hoàn tất</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 pl-0.5">{kpi.totalOrders} đơn</div>
                </div>

                {/* 3. Sản phẩm bán */}
                <div className="bg-purple-50/40 border border-purple-100/60 rounded-lg p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-md bg-purple-100/80 text-purple-600 flex items-center justify-center">
                      <Package className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">Sản phẩm bán</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 pl-0.5">{kpi.itemsSold} món</div>
                </div>

                {/* 4. Khách hàng mới */}
                <div className="bg-amber-50/40 border border-amber-100/60 rounded-lg p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-md bg-amber-100/80 text-amber-600 flex items-center justify-center">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium truncate">
                      Khách mới
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 pl-0.5">{kpi.totalOrders > 0 ? kpi.totalOrders : 0} khách</div>
                </div>
              </div>
            );
          })()}

          {/* Banner thông tin vận hành */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              Cửa hàng ghi nhận <strong>{kpi.totalOrders} đơn hàng</strong> trong kỳ. Tiếp tục duy trì chất lượng phục vụ nhé!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
