import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NOTIFICATION_PUBLISHER } from './publisher/notification-publisher.interface';
import { LocalNotificationPublisher } from './publisher/local-notification.publisher';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') ||
          'commerce_os_access_secret_super_secure_key_2026',
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    {
      provide: NOTIFICATION_PUBLISHER,
      useClass: LocalNotificationPublisher,
    },
  ],
  exports: [NotificationsService, NOTIFICATION_PUBLISHER],
})
export class NotificationsModule {}
