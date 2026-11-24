import { Module } from '@nestjs/common';
import { OrderingController } from './ordering.controller';
import { OrderingService } from './ordering.service';
import { VouchersModule } from '../vouchers';
import { NotificationsModule } from '../notifications';

@Module({
  imports: [VouchersModule, NotificationsModule],
  controllers: [OrderingController],
  providers: [OrderingService],
  exports: [OrderingService],
})
export class OrderingModule {}

