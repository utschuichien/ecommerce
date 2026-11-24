export type NotificationType = 'ORDER' | 'REVIEW' | 'VOUCHER' | 'SYSTEM';

export interface NotificationItem {
  publicId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  image?: string | null;
  metadata?: Record<string, any> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPagination {
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetNotificationsResponse {
  data: NotificationItem[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface CatchUpResponse {
  data: NotificationItem[];
  count: number;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

