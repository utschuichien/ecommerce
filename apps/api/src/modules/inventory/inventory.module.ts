import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryExpirationCronService } from './inventory-expiration-cron.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryExpirationCronService],
  exports: [InventoryService, InventoryExpirationCronService],
})
export class InventoryModule {}
