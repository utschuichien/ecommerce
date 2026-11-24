import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryExpirationCronService } from './inventory-expiration-cron.service';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { RolesGuard } from '../../platform/guards/roles.guard';
import { Roles } from '../../platform/decorators/roles.decorator';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly expirationCronService: InventoryExpirationCronService,
  ) {}

  @Post('cleanup-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Kích hoạt thủ công quét & giải phóng các phiếu giữ hàng quá hạn về kho khả dụng',
  })
  async triggerExpiredCleanup() {
    return this.expirationCronService.processExpiredReservations();
  }
}
