import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Component: Pagination', () => {
  it('Không hiển thị thanh phân trang nếu tổng số trang <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('Hiển thị đầy đủ danh sách các số trang khi totalPages <= 7', () => {
    render(
      <Pagination page={2} totalPages={5} onPageChange={vi.fn()} />
    );

    // Kiểm tra có các nút trang 1, 2, 3, 4, 5
    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole('button', { name: String(p) })).toBeInTheDocument();
    }
  });

  it('Đánh dấu trạng thái active (nền emerald) trên nút trang hiện tại', () => {
    render(
      <Pagination page={3} totalPages={5} onPageChange={vi.fn()} />
    );

    const activeBtn = screen.getByRole('button', { name: '3' });
    expect(activeBtn.className).toContain('bg-emerald-600');
    expect(activeBtn.className).toContain('text-white');

    const inactiveBtn = screen.getByRole('button', { name: '1' });
    expect(inactiveBtn.className).not.toContain('bg-emerald-600');
  });

  it('Vô hiệu hóa nút "Trước" khi đang ở trang 1 và nút "Sau" khi ở trang cuối', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} onPageChange={vi.fn()} />
    );

    const prevBtn = screen.getByTitle('Trang trước');
    const nextBtn = screen.getByTitle('Trang sau');

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Chuyển sang trang cuối (trang 5)
    rerender(
      <Pagination page={5} totalPages={5} onPageChange={vi.fn()} />
    );

    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it('Gọi callback onPageChange với số trang chính xác khi click số trang, nút Trước, nút Sau', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={3} totalPages={10} onPageChange={handlePageChange} />
    );

    // 1. Click chọn trực tiếp trang 4
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(handlePageChange).toHaveBeenCalledWith(4);

    // 2. Click nút "Trước" (trang 3 -> 2)
    fireEvent.click(screen.getByTitle('Trang trước'));
    expect(handlePageChange).toHaveBeenCalledWith(2);

    // 3. Click nút "Sau" (trang 3 -> 4)
    fireEvent.click(screen.getByTitle('Trang sau'));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('Hiển thị dấu ba chấm ellipsis (...) khi tổng số trang lớn (> 7)', () => {
    render(
      <Pagination page={5} totalPages={20} onPageChange={vi.fn()} />
    );

    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
