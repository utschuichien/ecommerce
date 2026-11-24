import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductBadge } from './ProductBadge';

describe('Component: ProductBadge', () => {
  it('Không render ra DOM khi badge rỗng hoặc undefined', () => {
    const { container } = render(<ProductBadge badge="" />);
    expect(container.firstChild).toBeNull();
  });

  it('Render nhãn "Giảm giá" với màu đỏ (bg-rose-500)', () => {
    render(<ProductBadge badge="Giảm giá" />);
    const badge = screen.getByText('Giảm giá').parentElement;
    expect(badge?.className).toContain('bg-rose-500');
  });

  it('Tự động thêm biểu tượng ngọn lửa 🔥 khi nhãn có chứa "Bán chạy"', () => {
    render(<ProductBadge badge="Bán chạy" />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('Bán chạy')).toBeInTheDocument();
  });

  it('Không lặp lại emoji nếu nhãn đã chứa sẵn icon ngọn lửa 🔥', () => {
    render(<ProductBadge badge="Bán chạy 🔥 Top 1" />);
    // Chỉ có 1 text node chứa 🔥 (không bị nhân đôi thêm 🔥 phía trước)
    const flameNodes = screen.getAllByText((content) => content.includes('🔥'));
    expect(flameNodes.length).toBe(1);
  });

  it('Áp dụng đúng màu theo thuộc tính badgeColor (red, green, blue)', () => {
    const { rerender } = render(<ProductBadge badge="Yêu thích" badgeColor="blue" />);
    const blueBadge = screen.getByText('Yêu thích').parentElement;
    expect(blueBadge?.className).toContain('bg-sky-500');

    rerender(<ProductBadge badge="Tiết kiệm" badgeColor="red" />);
    const redBadge = screen.getByText('Tiết kiệm').parentElement;
    expect(redBadge?.className).toContain('bg-rose-500');

    rerender(<ProductBadge badge="Hàng chuẩn" badgeColor="green" />);
    const greenBadge = screen.getByText('Hàng chuẩn').parentElement;
    expect(greenBadge?.className).toContain('bg-emerald-600');
  });
});
