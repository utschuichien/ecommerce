'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  Store,
  Shield,
  Loader2,
} from 'lucide-react';
import { useAdminUsers, useUpdateUser, AdminUserItem } from '@/features/admin';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { DEFAULT_CUSTOMER_AVATAR } from '@/constants/default-images';

interface AdminUsersTabProps {
  initialSearch?: string;
}

export function AdminUsersTab({ initialSearch = '' }: AdminUsersTabProps) {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Modal đổi trạng thái / vai trò
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [statusTargetUser, setStatusTargetUser] = useState<{
    user: AdminUserItem;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
  } | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminUsers({
    page,
    limit: 10,
    role: roleFilter,
    status: statusFilter,
    search: searchTerm || undefined,
  });

  // Tự động tìm kiếm tức thì sau 300ms debounce khi người dùng gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Đồng bộ nếu initialSearch thay đổi từ ngoài Header
  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchInput) {
      setSearchInput(initialSearch);
      setSearchTerm(initialSearch.trim());
      setPage(1);
    }
  }, [initialSearch]);

  const updateUserMutation = useUpdateUser();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleResetFilter = () => {
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  };

  const handleToggleStatus = async (user: AdminUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateUserMutation.mutateAsync({
      userId: user.id,
      data: { status: nextStatus },
    });
  };

  const handlePromoteRole = async (user: AdminUserItem, role: 'CUSTOMER' | 'SELLER' | 'ADMIN') => {
    await updateUserMutation.mutateAsync({
      userId: user.id,
      data: { role },
    });
    setSelectedUser(null);
  };

  const rolePills = [
    { key: 'ALL', label: 'Tất cả vai trò' },
    { key: 'CUSTOMER', label: 'Khách hàng' },
    { key: 'SELLER', label: 'Người bán' },
    { key: 'ADMIN', label: 'Quản trị viên' },
  ];

  const statusPills = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'ACTIVE', label: 'Hoạt động' },
    { key: 'SUSPENDED', label: 'Bị khóa' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Thanh công cụ & Bộ lọc */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm có debounce thời gian thực */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
              className="w-full pl-9 pr-14 py-2 text-xs rounded-lg bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200/50 hover:border-gray-200/80 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition placeholder-gray-400"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isFetching && (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              )}
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Nút làm mới */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Các hàng nút lọc */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-50 text-xs">
          {/* Lọc Vai trò */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Vai trò:</span>
            {rolePills.map((pill) => {
              const isActive = roleFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => {
                    setRoleFilter(pill.key);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block h-4 w-px bg-gray-200" />

          {/* Lọc Trạng thái */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Trạng thái:</span>
            {statusPills.map((pill) => {
              const isActive = statusFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(pill.key);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Bảng danh sách Người dùng */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          /* Trạng thái Empty */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full overflow-hidden mx-auto shadow-xs border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
              <img
                src={DEFAULT_CUSTOMER_AVATAR}
                alt="Người dùng"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Không tìm thấy người dùng nào</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Không có tài khoản người dùng nào khớp với bộ lọc vai trò, trạng thái hoặc từ khóa tìm kiếm của bạn.
            </p>
            {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Thông tin liên hệ</th>
                  <th className="py-3 px-4 text-center">Vai trò</th>
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4 text-center">Đơn hàng</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((user) => {
                  const isActive = user.status === 'ACTIVE';
                  const isSuspended = user.status === 'SUSPENDED';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={(user as any).avatarUrl}
                            name={user.fullName}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 block truncate">
                              {user.fullName || 'Chưa đặt tên'}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              ID: {user.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-gray-900 block">{user.email}</span>
                        <span className="text-[11px] text-gray-400 block">{user.phone || 'Chưa cập nhật SĐT'}</span>
                      </td>

                      {/* Role Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {user.roles.map((r) => {
                            const isAdm = r === 'ADMIN';
                            const isSel = r === 'SELLER';
                            return (
                              <span
                                key={r}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  isAdm
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : isSel
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Shop */}
                      <td className="py-3.5 px-4">
                        {user.shop ? (
                          <div className="flex items-center gap-1.5 text-gray-800">
                            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium truncate">{user.shop.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {user.ordersCount}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Hoạt động
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3" /> Tạm khóa
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Khóa / Mở khóa */}
                          <button
                            type="button"
                            onClick={() =>
                              setStatusTargetUser({
                                user,
                                nextStatus: isActive ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            disabled={updateUserMutation.isPending}
                            title={isActive ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                              isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Nút Phân quyền */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                          >
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span>Vai trò</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Phân trang căn giữa */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center">
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.totalItems}
              limit={data.pagination.limit}
              onPageChange={(p) => setPage(p)}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </div>

      {/* 4. Modal gán vai trò */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">Cập nhật vai trò</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Chọn vai trò bổ sung cho tài khoản <strong>{selectedUser.fullName || selectedUser.email}</strong>:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handlePromoteRole(selectedUser, 'CUSTOMER')}
                disabled={selectedUser.roles.includes('CUSTOMER') || updateUserMutation.isPending}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Khách hàng (CUSTOMER)</span>
                {selectedUser.roles.includes('CUSTOMER') && (
                  <span className="text-[10px] text-gray-400">Đã có</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handlePromoteRole(selectedUser, 'SELLER')}
                disabled={selectedUser.roles.includes('SELLER') || updateUserMutation.isPending}
                className="w-full py-2 px-3 rounded-lg border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center justify-between transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Người bán (SELLER)</span>
                {selectedUser.roles.includes('SELLER') && (
                  <span className="text-[10px] text-blue-500">Đã có</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handlePromoteRole(selectedUser, 'ADMIN')}
                disabled={selectedUser.roles.includes('ADMIN') || updateUserMutation.isPending}
                className="w-full py-2 px-3 rounded-lg border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center justify-between transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Quản trị viên (ADMIN)</span>
                {selectedUser.roles.includes('ADMIN') && (
                  <span className="text-[10px] text-purple-500">Đã có</span>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal xác nhận Khóa / Mở khóa Tài khoản - Dùng ConfirmDeleteModal dùng chung */}
      <ConfirmDeleteModal
        isOpen={!!statusTargetUser}
        title={
          statusTargetUser?.nextStatus === 'SUSPENDED'
            ? 'Khóa tài khoản người dùng?'
            : 'Mở khóa tài khoản?'
        }
        itemName={statusTargetUser?.user.fullName || statusTargetUser?.user.email}
        description={
          statusTargetUser?.nextStatus === 'SUSPENDED'
            ? 'Tài khoản này sẽ bị khóa. Người dùng sẽ bị buộc đăng xuất và không thể tiếp tục thực hiện giao dịch trên sàn.'
            : 'Tài khoản này sẽ được mở khóa và người dùng có thể đăng nhập hoạt động bình thường trở lại.'
        }
        itemInfo={
          statusTargetUser?.user.email
            ? `Email: ${statusTargetUser.user.email} • ID: ${statusTargetUser.user.id}`
            : undefined
        }
        confirmText={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
        }
        cancelText="Hủy bỏ"
        variant={statusTargetUser?.nextStatus === 'SUSPENDED' ? 'danger' : 'info'}
        icon={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? (
            <UserX className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <UserCheck className="w-6 h-6 stroke-[2.2]" />
          )
        }
        confirmIcon={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? (
            <UserX className="w-3.5 h-3.5" />
          ) : (
            <UserCheck className="w-3.5 h-3.5" />
          )
        }
        isLoading={updateUserMutation.isPending}
        onClose={() => setStatusTargetUser(null)}
        onConfirm={async () => {
          if (!statusTargetUser) return;
          await updateUserMutation.mutateAsync({
            userId: statusTargetUser.user.id,
            data: { status: statusTargetUser.nextStatus },
          });
          setStatusTargetUser(null);
        }}
      />

      {/* 5. Modal xác nhận Khóa / Mở khóa Tài khoản - Dùng ConfirmDeleteModal dùng chung */}
      <ConfirmDeleteModal
        isOpen={!!statusTargetUser}
        title={
          statusTargetUser?.nextStatus === 'SUSPENDED'
            ? 'Khóa tài khoản người dùng?'
            : 'Mở khóa tài khoản?'
        }
        itemName={statusTargetUser?.user.fullName || statusTargetUser?.user.email}
        description={
          statusTargetUser?.nextStatus === 'SUSPENDED'
            ? 'Tài khoản này sẽ bị khóa. Người dùng sẽ bị buộc đăng xuất và không thể tiếp tục thực hiện giao dịch trên sàn.'
            : 'Tài khoản này sẽ được mở khóa và người dùng có thể đăng nhập hoạt động bình thường trở lại.'
        }
        itemInfo={
          statusTargetUser?.user.email
            ? `Email: ${statusTargetUser.user.email} • ID: ${statusTargetUser.user.id}`
            : undefined
        }
        confirmText={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
        }
        cancelText="Hủy bỏ"
        variant={statusTargetUser?.nextStatus === 'SUSPENDED' ? 'danger' : 'info'}
        icon={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? (
            <UserX className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <UserCheck className="w-6 h-6 stroke-[2.2]" />
          )
        }
        confirmIcon={
          statusTargetUser?.nextStatus === 'SUSPENDED' ? (
            <UserX className="w-3.5 h-3.5" />
          ) : (
            <UserCheck className="w-3.5 h-3.5" />
          )
        }
        isLoading={updateUserMutation.isPending}
        onClose={() => setStatusTargetUser(null)}
        onConfirm={async () => {
          if (!statusTargetUser) return;
          await updateUserMutation.mutateAsync({
            userId: statusTargetUser.user.id,
            data: { status: statusTargetUser.nextStatus },
          });
          setStatusTargetUser(null);
        }}
      />
    </div>
  );
}
