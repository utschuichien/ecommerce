import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDropdown } from './AdminDropdown';

describe('Component: AdminDropdown', () => {
  const options = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Tạm khóa' },
  ];

  it('Hiển thị nhãn của tùy chọn đang được chọn', () => {
    render(
      <AdminDropdown
        value="ACTIVE"
        onChange={vi.fn()}
        options={options}
      />
    );

    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    // Menu xổ xuống ban đầu không hiển thị
    expect(screen.queryByText('Tạm khóa')).not.toBeInTheDocument();
  });

  it('Mở menu danh sách lựa chọn khi click vào dropdown button', () => {
    render(
      <AdminDropdown
        value="ALL"
        onChange={vi.fn()}
        options={options}
      />
    );

    const triggerBtn = screen.getByRole('button', { name: /tất cả trạng thái/i });
    fireEvent.click(triggerBtn);

    // Sau khi click mở, toàn bộ các option xuất hiện
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Tạm khóa')).toBeInTheDocument();
  });

  it('Gọi callback onChange với giá trị mới và đóng dropdown sau khi chọn', () => {
    const handleChange = vi.fn();
    render(
      <AdminDropdown
        value="ALL"
        onChange={handleChange}
        options={options}
      />
    );

    // Mở menu
    fireEvent.click(screen.getByRole('button', { name: /tất cả trạng thái/i }));

    // Chọn option 'Tạm khóa'
    const inactiveOption = screen.getByRole('button', { name: /tạm khóa/i });
    fireEvent.click(inactiveOption);

    expect(handleChange).toHaveBeenCalledWith('INACTIVE');
    // Dropdown đóng lại
    expect(screen.queryByRole('button', { name: /tạm khóa/i })).not.toBeInTheDocument();
  });

  it('Đóng dropdown khi click ra ngoài (mousedown outside)', () => {
    render(
      <div>
        <div data-testid="outside-area">Vùng bên ngoài</div>
        <AdminDropdown
          value="ALL"
          onChange={vi.fn()}
          options={options}
        />
      </div>
    );

    // Mở dropdown
    fireEvent.click(screen.getByRole('button', { name: /tất cả trạng thái/i }));
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();

    // Click ra ngoài
    fireEvent.mouseDown(screen.getByTestId('outside-area'));
    expect(screen.queryByText('Đang hoạt động')).not.toBeInTheDocument();
  });
});
