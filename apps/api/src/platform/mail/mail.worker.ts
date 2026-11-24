import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import {
  MAIL_JOBS,
  MAIL_QUEUE_NAME,
  SendOtpMailPayload,
  SendOrderConfirmationMailPayload,
  SendOrderStatusMailPayload,
} from './mail.types';
import { MailService } from './mail.service';

@Injectable()
export class MailWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailWorkerService.name);
  private worker: Worker | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    try {
      this.worker = new Worker(
        MAIL_QUEUE_NAME,
        async (job: Job) => {
          this.logger.log(`Processing BullMQ job #${job.id} [${job.name}]...`);

          switch (job.name) {
            case MAIL_JOBS.SEND_OTP: {
              const payload = job.data as SendOtpMailPayload;
              await this.mailService.sendOtpEmail(payload);
              break;
            }
            case MAIL_JOBS.SEND_ORDER_CONFIRMATION: {
              const payload = job.data as SendOrderConfirmationMailPayload;
              await this.mailService.sendOrderConfirmationEmail(payload);
              break;
            }
            case MAIL_JOBS.SEND_ORDER_STATUS: {
              const payload = job.data as SendOrderStatusMailPayload;
              await this.mailService.sendOrderStatusEmail(payload);
              break;
            }
            default:
              this.logger.warn(`Unknown job name: ${job.name}`);
          }
        },
        {
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
          concurrency: 5,
        },
      );

      this.worker.on('completed', (job: Job) => {
        this.logger.log(`Job #${job.id} [${job.name}] completed successfully.`);
      });

      this.worker.on('failed', (job: Job | undefined, err: Error) => {
        this.logger.error(
          `Job #${job?.id || 'unknown'} [${job?.name || 'unknown'}] failed with attempt ${job?.attemptsMade}: ${err.message}`,
        );
      });

      this.worker.on('error', (err: Error) => {
        if ((err as any).code !== 'ECONNREFUSED') {
          this.logger.error(`BullMQ Worker Error: ${err.message}`);
        }
      });

      this.logger.log(`BullMQ Worker for '${MAIL_QUEUE_NAME}' initialized.`);
    } catch (err: any) {
      this.logger.warn(`Failed to initialize BullMQ Worker: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      try {
        await this.worker.close();
      } catch {
        // ignore close errors
      }
    }
  }
}
