import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  MAIL_JOBS,
  MAIL_QUEUE_NAME,
  SendOtpMailPayload,
  SendOrderConfirmationMailPayload,
  SendOrderStatusMailPayload,
} from './mail.types';
import { MailService } from './mail.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MailQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailQueueService.name);
  private queue: Queue | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    try {
      this.queue = new Queue(MAIL_QUEUE_NAME, {
        connection: {
          host,
          port,
          password,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy: (times) => {
            if (times > 10) return 15000;
            return Math.min(times * 1000, 5000);
          },
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      });

      this.queue.on('error', (err) => {
        if ((err as any).code !== 'ECONNREFUSED') {
          this.logger.error(`BullMQ Queue Error: ${err.message}`);
        }
      });

      this.logger.log(`BullMQ Queue '${MAIL_QUEUE_NAME}' initialized.`);
    } catch (err: any) {
      this.logger.warn(`Failed to initialize BullMQ Queue: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.queue) {
      try {
        await this.queue.close();
      } catch {
        // ignore close errors
      }
    }
  }

  /**
   * Đẩy job gửi email OTP xác thực vào hàng đợi
   */
  async enqueueSendOtp(payload: SendOtpMailPayload): Promise<void> {
    if (this.queue && this.redisService.isRedisConnected()) {
      try {
        await this.queue.add(MAIL_JOBS.SEND_OTP, payload);
        this.logger.log(`Enqueued OTP email job for recipient: ${payload.email}`);
        return;
      } catch (err: any) {
        this.logger.warn(
          `Failed to push job to BullMQ (${err.message}). Falling back to direct asynchronous send.`,
        );
      }
    }

    // Direct fallback (chạy nền không block API request)
    setImmediate(async () => {
      try {
        await this.mailService.sendOtpEmail(payload);
      } catch (err: any) {
        this.logger.error(`Direct email send fallback failed for ${payload.email}: ${err.message}`);
      }
    });
  }

  /**
   * Đẩy job gửi email xác nhận đặt hàng thành công vào hàng đợi
   */
  async enqueueSendOrderConfirmation(
    payload: SendOrderConfirmationMailPayload,
  ): Promise<void> {
    if (this.queue && this.redisService.isRedisConnected()) {
      try {
        await this.queue.add(MAIL_JOBS.SEND_ORDER_CONFIRMATION, payload);
        this.logger.log(
          `Enqueued Order Confirmation email job for order #${payload.orderNumber} to: ${payload.email}`,
        );
        return;
      } catch (err: any) {
        this.logger.warn(
          `Failed to push order confirmation to BullMQ (${err.message}). Falling back to direct asynchronous send.`,
        );
      }
    }

    setImmediate(async () => {
      try {
        await this.mailService.sendOrderConfirmationEmail(payload);
      } catch (err: any) {
        this.logger.error(
          `Direct order confirmation send failed for ${payload.email}: ${err.message}`,
        );
      }
    });
  }

  /**
   * Đẩy job gửi email cập nhật trạng thái đơn hàng vào hàng đợi
   */
  async enqueueSendOrderStatus(payload: SendOrderStatusMailPayload): Promise<void> {
    if (this.queue && this.redisService.isRedisConnected()) {
      try {
        await this.queue.add(MAIL_JOBS.SEND_ORDER_STATUS, payload);
        this.logger.log(
          `Enqueued Order Status email job for order #${payload.orderNumber} (${payload.statusLabel}) to: ${payload.email}`,
        );
        return;
      } catch (err: any) {
        this.logger.warn(
          `Failed to push order status email to BullMQ (${err.message}). Falling back to direct send.`,
        );
      }
    }

    setImmediate(async () => {
      try {
        await this.mailService.sendOrderStatusEmail(payload);
      } catch (err: any) {
        this.logger.error(
          `Direct order status send failed for ${payload.email}: ${err.message}`,
        );
      }
    });
  }
}
