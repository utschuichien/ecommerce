import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationPublisher,
  NotificationPayload,
  NotificationReadStatePayload,
} from './notification-publisher.interface';
import { NotificationsGateway } from '../notifications.gateway';

@Injectable()
export class LocalNotificationPublisher implements INotificationPublisher {
  private readonly logger = new Logger(LocalNotificationPublisher.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Đẩy thông báo mới đến Room user:{userId} qua WebSocket
   */
  async publish(
    userPublicId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    this.logger.debug(
      `[LocalPublisher] Đang phát thông báo mới "${payload.publicId}" đến user ${userPublicId}`,
    );
    this.gateway.emitToUser(userPublicId, 'notification:new', payload);
  }

  /**
   * Đồng bộ trạng thái đã đọc giữa các tab của cùng người dùng
   */
  async publishReadState(
    userPublicId: string,
    payload: NotificationReadStatePayload,
  ): Promise<void> {
    this.logger.debug(
      `[LocalPublisher] Đồng bộ trạng thái đã đọc cho user ${userPublicId}`,
    );
    this.gateway.emitToUser(userPublicId, 'notification:read', payload);
  }
}

