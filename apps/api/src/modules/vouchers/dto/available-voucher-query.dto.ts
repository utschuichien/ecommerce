import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AvailableVoucherQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo shop (slug hoặc ID). Nếu bỏ trống sẽ lấy các voucher toàn sàn (GLOBAL)',
  })
  @IsOptional()
  @IsString()
  shop?: string;
}

