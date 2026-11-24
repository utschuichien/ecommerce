import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { CloudinaryModule } from '../../platform/cloudinary/cloudinary.module';
import { NotificationsModule } from '../../modules/notifications';

@Module({
  imports: [CloudinaryModule, NotificationsModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}
