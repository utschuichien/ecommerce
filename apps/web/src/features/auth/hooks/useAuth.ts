import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/useAuthStore';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { AuthResponse, UserProfile } from '../types/auth.types';

export const AUTH_QUERY_KEYS = {
  ME: ['auth', 'me'] as const,
  ADDRESSES: ['auth', 'addresses'] as const,
  SUMMARY: ['auth', 'summary'] as const,
  SESSIONS: ['auth', 'sessions'] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, response.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, response.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.ME });
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.ADDRESSES });
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery<UserProfile, Error>({
    queryKey: AUTH_QUERY_KEYS.ME,
    queryFn: async () => {
      const user = await authApi.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// 5. Hook cập nhật thông tin cá nhân
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<UserProfile, Error, { fullName?: string; phone?: string }>({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, updatedUser);
    },
  });
}

// 6. Hook đổi mật khẩu
export function useChangePassword() {
  return useMutation<{ message: string }, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (data) => authApi.changePassword(data),
  });
}

// 7. Hooks quản lý địa chỉ giao hàng
export function useAddresses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.ADDRESSES,
    queryFn: () => authApi.getAddresses(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => authApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ADDRESSES });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => authApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ADDRESSES });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => authApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ADDRESSES });
    },
  });
}

// 8. Hook tải lên ảnh đại diện
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<UserProfile, Error, File>({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, updatedUser);
    },
  });
}

// 9. Hook cập nhật địa chỉ
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: any }) =>
      authApi.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.ADDRESSES });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SUMMARY });
    },
  });
}

// 10. Hook lấy tổng quan hồ sơ tài khoản
export function useProfileSummary() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.SUMMARY,
    queryFn: () => authApi.getProfileSummary(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}

// 11. Hook danh sách phiên đăng nhập
export function useSessions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.SESSIONS,
    queryFn: () => authApi.getActiveSessions(),
    enabled: isAuthenticated,
  });
}

// 12. Hook thu hồi 1 phiên đăng nhập
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSIONS });
    },
  });
}

// 13. Hook đăng xuất khỏi tất cả các thiết bị khác
export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.revokeAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSIONS });
    },
  });
}


export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const changePasswordMutation = useChangePassword();
  const currentUserQuery = useCurrentUser();

  return {
    user: user || currentUserQuery.data || null,
    isAuthenticated,
    accessToken,
    isLoadingUser: currentUserQuery.isLoading,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
  };
}
