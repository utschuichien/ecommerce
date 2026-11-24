export const NOTIFICATION_PUBLISHER = 'NOTIFICATION_PUBLISHER';

export interface NotificationPayload {
  publicId: string;
  userId: string; // user publicId
  type: string;
  title: string;
  message: string;
  link?: string | null;
  image?: string | null;
  metadata?: any;
  isRead: boolean;
  createdAt: string; // ISO 8601
}

export interface NotificationReadStatePayload {
  publicId?: string;
  all?: boolean;
}

export interface INotificationPublisher {
  /**
   * Đẩy thông báo thời gian thực đến người dùng (tất cả các tab đang mở)
   */
  publish(userPublicId: string, payload: NotificationPayload): Promise<void>;

  /**
   * Đồng bộ trạng thái đã đọc thông báo giữa các tab của cùng người dùng
   */
  publishReadState(
    userPublicId: string,
    payload: NotificationReadStatePayload,
  ): Promise<void>;
}

