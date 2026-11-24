import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

describe('Component: ConfirmDeleteModal', () => {
  it('Không render ra DOM khi isOpen = false', () => {
    const { container } = render(
      <ConfirmDeleteModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('Render đầy đủ tiêu đề, tên đối tượng, thông tin cảnh báo khi isOpen = true', () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Xóa danh mục sản phẩm"
        itemName="Đồ gia dụng"
        itemInfo="Có 15 sản phẩm thuộc danh mục này"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Xóa danh mục sản phẩm')).toBeInTheDocument();
    expect(screen.getByText('“Đồ gia dụng”')).toBeInTheDocument();
    expect(screen.getByText('Có 15 sản phẩm thuộc danh mục này')).toBeInTheDocument();
    expect(screen.getByText('Hủy bỏ')).toBeInTheDocument();
    expect(screen.getByText('Xóa vĩnh viễn')).toBeInTheDocument();
  });

  it('Kích hoạt callback onClose khi bấm nút Hủy bỏ hoặc nút X góc trên', () => {
    const handleClose = vi.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    // Click nút Hủy bỏ
    fireEvent.click(screen.getByRole('button', { name: /hủy bỏ/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click nút X (title="Đóng")
    fireEvent.click(screen.getByTitle('Đóng'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('Kích hoạt callback onConfirm khi bấm nút xác nhận xóa', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        confirmText="Đồng ý xóa"
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /đồng ý xóa/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('Vô hiệu hóa (disabled) các nút bấm và hiển thị spinner khi isLoading = true', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDeleteModal
        isOpen={true}
        isLoading={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /hủy bỏ/i });
    const confirmBtn = screen.getByRole('button', { name: /xóa vĩnh viễn/i });
    const closeBtn = screen.getByTitle('Đóng');

    expect(cancelBtn).toBeDisabled();
    expect(confirmBtn).toBeDisabled();
    expect(closeBtn).toBeDisabled();

    // Thử click khi disabled
    fireEvent.click(confirmBtn);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('Đổi màu sắc tương ứng theo variant (danger | warning | info)', () => {
    const { rerender } = render(
      <ConfirmDeleteModal
        isOpen={true}
        variant="warning"
        confirmText="Cảnh báo tiếp tục"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const warningBtn = screen.getByRole('button', { name: /cảnh báo tiếp tục/i });
    expect(warningBtn.className).toContain('bg-amber-600');

    rerender(
      <ConfirmDeleteModal
        isOpen={true}
        variant="info"
        confirmText="Xác nhận lưu"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const infoBtn = screen.getByRole('button', { name: /xác nhận lưu/i });
    expect(infoBtn.className).toContain('bg-emerald-600');
  });
});
