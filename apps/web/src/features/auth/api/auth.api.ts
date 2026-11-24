import { apiClient } from '../../../lib/api-client';
import {
  AuthResponse,
  UserProfile,
  ApiStandardResponse,
  UserAddress,
  ForgotPasswordResponse,
  VerifyOtpResponse,
  ResetPasswordResponse,
} from '../types/auth.types';
import { LoginInput, RegisterInput, CreateAddressInput } from '../schemas/auth.schema';

export const authApi = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiStandardResponse<AuthResponse>>(
      '/auth/login',
      {
        email: data.email,
        password: data.password,
      },
    );
    return response.data?.data || (response.data as unknown as AuthResponse);
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiStandardResponse<AuthResponse>>(
      '/auth/register',
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      },
    );
    return response.data?.data || (response.data as unknown as AuthResponse);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<ApiStandardResponse<UserProfile>>(
      '/auth/me',
    );
    return response.data?.data || (response.data as unknown as UserProfile);
  },

  async refresh(): Promise<AuthResponse> {
    const response = await apiClient.post<ApiStandardResponse<AuthResponse>>(
      '/auth/refresh',
    );
    return response.data?.data || (response.data as unknown as AuthResponse);
  },

  async updateProfile(data: { fullName?: string; phone?: string }): Promise<UserProfile> {
    const response = await apiClient.put<ApiStandardResponse<UserProfile>>(
      '/auth/profile',
      data,
    );
    return response.data?.data || (response.data as unknown as UserProfile);
  },

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiStandardResponse<UserProfile>>(
      '/auth/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data?.data || (response.data as unknown as UserProfile);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.put<ApiStandardResponse<{ message: string }>>(
      '/auth/change-password',
      data,
    );
    return response.data?.data || (response.data as unknown as { message: string });
  },

  async getAddresses(): Promise<UserAddress[]> {
    const response = await apiClient.get<ApiStandardResponse<UserAddress[]>>(
      '/auth/addresses',
    );
    return response.data?.data || (response.data as unknown as UserAddress[]) || [];
  },

  async createAddress(data: CreateAddressInput): Promise<UserAddress> {
    const response = await apiClient.post<ApiStandardResponse<UserAddress>>(
      '/auth/addresses',
      data,
    );
    return response.data?.data || (response.data as unknown as UserAddress);
  },

  async updateAddress(addressId: string, data: Partial<CreateAddressInput>): Promise<UserAddress> {
    const response = await apiClient.put<ApiStandardResponse<UserAddress>>(
      `/auth/addresses/${addressId}`,
      data,
    );
    return response.data?.data || (response.data as unknown as UserAddress);
  },

  async setDefaultAddress(addressId: string): Promise<void> {
    await apiClient.put(`/auth/addresses/${addressId}/default`);
  },

  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`/auth/addresses/${addressId}`);
  },

  async getProfileSummary(): Promise<import('../types/auth.types').ProfileSummaryResponse> {
    const response = await apiClient.get<ApiStandardResponse<import('../types/auth.types').ProfileSummaryResponse>>(
      '/auth/summary',
    );
    return response.data?.data || (response.data as unknown as import('../types/auth.types').ProfileSummaryResponse);
  },

  async getActiveSessions(): Promise<import('../types/auth.types').UserSession[]> {
    const response = await apiClient.get<ApiStandardResponse<import('../types/auth.types').UserSession[]>>(
      '/auth/sessions',
    );
    return response.data?.data || (response.data as unknown as import('../types/auth.types').UserSession[]) || [];
  },

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiStandardResponse<{ message: string }>>(
      `/auth/sessions/${sessionId}`,
    );
    return response.data?.data || (response.data as unknown as { message: string });
  },

  async revokeAllOtherSessions(): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiStandardResponse<{ message: string }>>(
      '/auth/sessions',
    );
    return response.data?.data || (response.data as unknown as { message: string });
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ApiStandardResponse<ForgotPasswordResponse> | ForgotPasswordResponse>(
      '/auth/forgot-password',
      { email },
    );
    return (response.data as any)?.data || response.data;
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<ApiStandardResponse<VerifyOtpResponse> | VerifyOtpResponse>(
      '/auth/verify-otp',
      { email, otp },
    );
    return (response.data as any)?.data || response.data;
  },

  async resetPassword(data: {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiStandardResponse<ResetPasswordResponse> | ResetPasswordResponse>(
      '/auth/reset-password',
      data,
    );
    return (response.data as any)?.data || response.data;
  },
};


