import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { notificationsApi } from '../api/notifications.api';
import { NOTIFICATION_KEYS } from './useNotifications';
import {
  GetNotificationsResponse,
  NotificationItem,
  UnreadCountResponse,
} from '../types/notification.types';

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const socketRef = useRef<Socket | null>(null);
  // Idempotent client deduplication: Lưu trữ danh sách publicId đã nhận
  const seenPublicIdsRef = useRef<Set<string>>(new Set());
  // Mốc thời gian gần nhất nhận thông báo để thực hiện Delta Catch-up khi reconnect
  const lastReceivedAtRef = useRef<string>(new Date().toISOString());
  // Đánh dấu đã từng kết nối thành công chưa (để phân biệt lần đầu mount với reconnect sau khi mất mạng)
  const isReconnectingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const socketBase =
      process.env.NEXT_PUBLIC_WS_URL ||
      apiUrl.replace(/\/api\/v1\/?$/, '');

    // Khởi tạo Socket.io client kết nối vào namespace /notifications
    const socket = io(`${socketBase}/notifications`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      // 4. Catch-up on reconnect: Nếu đây là reconnect sau khi đứt mạng, gọi API catch-up
      if (isReconnectingRef.current && lastReceivedAtRef.current) {
        try {
          const catchUpResult = await notificationsApi.catchUp(
            lastReceivedAtRef.current,
          );

          if (catchUpResult.data && catchUpResult.data.length > 0) {
            // Lọc các thông báo mới chưa từng xuất hiện trên Client (Idempotency)
            const newItems: NotificationItem[] = [];
            for (const item of catchUpResult.data) {
              if (!seenPublicIdsRef.current.has(item.publicId)) {
                seenPublicIdsRef.current.add(item.publicId);
                newItems.push(item);
              }
            }

            if (newItems.length > 0) {
              // Cập nhật React Query cache
              queryClient.setQueriesData<GetNotificationsResponse>(
                { queryKey: NOTIFICATION_KEYS.lists() },
                (old) => {
                  if (!old) return old;
                  return {
                    ...old,
                    data: [...newItems, ...old.data],
                    pagination: {
                      ...old.pagination,
                      total: old.pagination.total + newItems.length,
                      unreadCount:
                        old.pagination.unreadCount +
                        newItems.filter((i) => !i.isRead).length,
                    },
                  };
                },
              );

              // Tăng unread count
              queryClient.setQueryData<UnreadCountResponse>(
                NOTIFICATION_KEYS.unreadCount(),
                (old) => {
                  const unreadDelta = newItems.filter((i) => !i.isRead).length;
                  if (!old) return { unreadCount: unreadDelta };
                  return { unreadCount: old.unreadCount + unreadDelta };
                },
              );
            }
          }
        } catch {
        }
      }

      // Đánh dấu trạng thái sẵn sàng cho các lần reconnect kế tiếp
      isReconnectingRef.current = true;
      lastReceivedAtRef.current = new Date().toISOString();
    });

    socket.on('disconnect', () => {
      // Socket tạm thời mất kết nối (mất mạng hoặc server restart)
    });

    // 2. Real-time delivery: Nhận thông báo mới từ server qua WebSocket (< 100ms)
    socket.on('notification:new', (payload: NotificationItem) => {
      if (!payload || !payload.publicId) return;

      // 5. Idempotent client: Bỏ qua nếu đã nhận trước đó
      if (seenPublicIdsRef.current.has(payload.publicId)) {
        return;
      }
      seenPublicIdsRef.current.add(payload.publicId);
      lastReceivedAtRef.current = payload.createdAt || new Date().toISOString();

      // Cập nhật React Query unread count ngay lập tức
      queryClient.setQueryData<UnreadCountResponse>(
        NOTIFICATION_KEYS.unreadCount(),
        (old) => {
          if (!old) return { unreadCount: 1 };
          return { unreadCount: old.unreadCount + 1 };
        },
      );

      // Prepend thông báo mới vào tất cả query list trong cache
      queryClient.setQueriesData<GetNotificationsResponse>(
        { queryKey: NOTIFICATION_KEYS.lists() },
        (old) => {
          if (!old) return old;
          // Đảm bảo không trùng trong mảng
          if (old.data.some((item) => item.publicId === payload.publicId)) {
            return old;
          }
          return {
            ...old,
            data: [payload, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
              unreadCount: old.pagination.unreadCount + 1,
            },
          };
        },
      );
    });
    socket.on(
      'notification:read',
      (payload: { publicId?: string; all?: boolean }) => {
        if (payload.all) {
          queryClient.setQueryData<UnreadCountResponse>(
            NOTIFICATION_KEYS.unreadCount(),
            { unreadCount: 0 },
          );
          queryClient.setQueriesData<GetNotificationsResponse>(
            { queryKey: NOTIFICATION_KEYS.lists() },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                data: old.data.map((item) => ({ ...item, isRead: true })),
                pagination: { ...old.pagination, unreadCount: 0 },
              };
            },
          );
        } else if (payload.publicId) {
          queryClient.setQueryData<UnreadCountResponse>(
            NOTIFICATION_KEYS.unreadCount(),
            (old) => {
              if (!old) return { unreadCount: 0 };
              return { unreadCount: Math.max(0, old.unreadCount - 1) };
            },
          );
          queryClient.setQueriesData<GetNotificationsResponse>(
            { queryKey: NOTIFICATION_KEYS.lists() },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                data: old.data.map((item) =>
                  item.publicId === payload.publicId
                    ? { ...item, isRead: true }
                    : item,
                ),
                pagination: {
                  ...old.pagination,
                  unreadCount: Math.max(0, old.pagination.unreadCount - 1),
                },
              };
            },
          );
        }
      },
    );
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, isAuthenticated, queryClient]);

  return {
    socket: socketRef.current,
  };
}

