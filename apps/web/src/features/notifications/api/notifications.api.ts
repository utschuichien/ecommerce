import { apiClient } from '../../../lib/api-client';
import {
  GetNotificationsResponse,
  UnreadCountResponse,
  CatchUpResponse,
  NotificationQuery,
} from '../types/notification.types';

export const notificationsApi = {
  /**
   * Lấy danh sách thông báo phân trang
   */
  async getNotifications(
    query?: NotificationQuery,
  ): Promise<GetNotificationsResponse> {
    const res = await apiClient.get<any>('/notifications', {
      params: query,
    });
    // Trích xuất dữ liệu an toàn kể cả khi API interceptor bọc thêm { data: ... }
    const raw = res.data?.data ?? res.data;
    return raw;
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await apiClient.get<any>('/notifications/unread-count');
    const raw = res.data?.data ?? res.data;
    return raw;
  },

  /**
   * Bù đắp thông báo offline sau khi reconnect (Delta Catch-up)
   */
  async catchUp(sinceIsoString: string): Promise<CatchUpResponse> {
    const res = await apiClient.get<any>('/notifications/catch-up', {
      params: { since: sinceIsoString },
    });
    const raw = res.data?.data ?? res.data;
    return raw;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  async markAsRead(
    publicId: string,
  ): Promise<{ success: boolean; publicId: string }> {
    const res = await apiClient.patch<any>(`/notifications/${publicId}/read`);
    const raw = res.data?.data ?? res.data;
    return raw;
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(): Promise<{ success: boolean; affected: number }> {
    const res = await apiClient.patch<any>('/notifications/read-all');
    const raw = res.data?.data ?? res.data;
    return raw;
  },
};
