import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SellerAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Khoảng thời gian thống kê: 7 (7 ngày), 30 (30 ngày), 90 (90 ngày), year (Năm nay)',
    example: '30',
  })
  @IsOptional()
  @IsString()
  range?: string = '30';
}

