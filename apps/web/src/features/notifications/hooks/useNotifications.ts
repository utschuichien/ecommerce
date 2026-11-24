import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import {
  GetNotificationsResponse,
  NotificationQuery,
  UnreadCountResponse,
} from '../types/notification.types';
import { useAuthStore } from '../../auth/stores/useAuthStore';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (query?: NotificationQuery) =>
    [...NOTIFICATION_KEYS.lists(), query] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unreadCount'] as const,
};

export function useNotifications(query?: NotificationQuery) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(query),
    queryFn: () => notificationsApi.getNotifications(query),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30s
  });
}

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 15 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => notificationsApi.markAsRead(publicId),
    onSuccess: (_, publicId) => {
      // 1. Cập nhật optimistic / cache cho unread count
      queryClient.setQueryData<UnreadCountResponse>(
        NOTIFICATION_KEYS.unreadCount(),
        (old) => {
          if (!old) return { unreadCount: 0 };
          return { unreadCount: Math.max(0, old.unreadCount - 1) };
        },
      );

      // 2. Cập nhật trạng thái isRead trong mọi query list cache
      queryClient.setQueriesData<GetNotificationsResponse>(
        { queryKey: NOTIFICATION_KEYS.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.publicId === publicId ? { ...item, isRead: true } : item,
            ),
            pagination: {
              ...old.pagination,
              unreadCount: Math.max(0, old.pagination.unreadCount - 1),
            },
          };
        },
      );
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // 1. Reset unread count = 0
      queryClient.setQueryData<UnreadCountResponse>(
        NOTIFICATION_KEYS.unreadCount(),
        { unreadCount: 0 },
      );

      // 2. Cập nhật tất cả items thành isRead = true
      queryClient.setQueriesData<GetNotificationsResponse>(
        { queryKey: NOTIFICATION_KEYS.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) => ({ ...item, isRead: true })),
            pagination: {
              ...old.pagination,
              unreadCount: 0,
            },
          };
        },
      );
    },
  });
}

