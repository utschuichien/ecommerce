import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ulid } from 'ulid';
import { PrismaService } from '../../platform/prisma/prisma.service';
import {
  NOTIFICATION_PUBLISHER,
  INotificationPublisher,
  NotificationPayload,
} from './publisher/notification-publisher.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PUBLISHER)
    private readonly publisher: INotificationPublisher,
  ) {}

  /**
   * Helper tìm user theo publicId hoặc bigint ID
   */
  private async resolveUser(userIdentifier: string | bigint) {
    if (typeof userIdentifier === 'bigint') {
      const user = await this.prisma.user.findUnique({
        where: { id: userIdentifier },
        select: { id: true, publicId: true },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');
      return user;
    }

    // Nếu là string dạng số
    if (/^\d+$/.test(userIdentifier)) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: BigInt(userIdentifier) }, { publicId: userIdentifier }],
        },
        select: { id: true, publicId: true },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');
      return user;
    }

    const user = await this.prisma.user.findUnique({
      where: { publicId: userIdentifier },
      select: { id: true, publicId: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  /**
   * Tạo thông báo mới:
   * 1. DB persistence: Ghi vào MySQL trước
   * 2. Real-time delivery: Đẩy qua WebSocket Publisher đến Room user:{userId}
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationPayload> {
    const user = await this.resolveUser(dto.userId);

    const publicId = ulid();
    const noti = await this.prisma.notification.create({
      data: {
        publicId,
        userId: user.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        link: dto.link ?? null,
        image: dto.image ?? null,
        metadata: dto.metadata ?? undefined,
        isRead: false,
      },
    });

    const payload: NotificationPayload = {
      publicId: noti.publicId,
      userId: user.publicId,
      type: noti.type,
      title: noti.title,
      message: noti.message,
      link: noti.link,
      image: noti.image,
      metadata: noti.metadata,
      isRead: noti.isRead,
      createdAt: noti.createdAt.toISOString(),
    };

    try {
      await this.publisher.publish(user.publicId, payload);
    } catch (publishErr: any) {
      this.logger.error(
        `Lỗi khi đẩy WebSocket thông báo ${publicId}: ${publishErr.message}`,
      );
      // Không ném lỗi ra ngoài vì thông báo đã lưu bền vững vào DB
    }

    return payload;
  }


  async getUserNotifications(userPublicId: string, query: NotificationQueryDto) {
    const user = await this.resolveUser(userPublicId);
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: user.id,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };

    const [total, unreadCount, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items.map((it) => ({
        publicId: it.publicId,
        type: it.type,
        title: it.title,
        message: it.message,
        link: it.link,
        image: it.image,
        metadata: it.metadata,
        isRead: it.isRead,
        readAt: it.readAt ? it.readAt.toISOString() : null,
        createdAt: it.createdAt.toISOString(),
      })),
      pagination: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getUnreadCount(userPublicId: string): Promise<{ unreadCount: number }> {
    const user = await this.resolveUser(userPublicId);
    const unreadCount = await this.prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return { unreadCount };
  }

  async catchUpNotifications(
    userPublicId: string,
    sinceIsoString: string,
  ): Promise<{ data: NotificationPayload[]; count: number }> {
    const user = await this.resolveUser(userPublicId);
    const sinceDate = new Date(sinceIsoString);

    if (isNaN(sinceDate.getTime())) {
      return { data: [], count: 0 };
    }

    const items = await this.prisma.notification.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gt: sinceDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const data: NotificationPayload[] = items.map((it) => ({
      publicId: it.publicId,
      userId: user.publicId,
      type: it.type,
      title: it.title,
      message: it.message,
      link: it.link,
      image: it.image,
      metadata: it.metadata,
      isRead: it.isRead,
      createdAt: it.createdAt.toISOString(),
    }));

    return { data, count: data.length };
  }
  async markAsRead(userPublicId: string, notiPublicId: string) {
    const user = await this.resolveUser(userPublicId);

    const existing = await this.prisma.notification.findFirst({
      where: {
        publicId: notiPublicId,
        userId: user.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    if (!existing.isRead) {
      await this.prisma.notification.update({
        where: { id: existing.id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      try {
        await this.publisher.publishReadState(user.publicId, {
          publicId: notiPublicId,
        });
      } catch (err: any) {
        this.logger.error(`Lỗi đồng bộ read state: ${err.message}`);
      }
    }

    return { success: true, publicId: notiPublicId };
  }

  async markAllAsRead(userPublicId: string) {
    const user = await this.resolveUser(userPublicId);

    await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    try {
      await this.publisher.publishReadState(user.publicId, { all: true });
    } catch (err: any) {
      this.logger.error(`Lỗi đồng bộ read all state: ${err.message}`);
    }

    return { success: true };
  }
}
