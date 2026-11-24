import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailQueueService } from './mail.queue';
import { MailWorkerService } from './mail.worker';
import { MailController } from './mail.controller';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  controllers: [MailController],
  providers: [MailService, MailQueueService, MailWorkerService],
  exports: [MailService, MailQueueService],
})
export class MailModule {}

