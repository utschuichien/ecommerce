import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SellerVoucherQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo mã voucher hoặc tên voucher',
    example: 'GIAM20',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Bộ lọc trạng thái: ALL, ACTIVE, UPCOMING, EXPIRED, DISABLED',
    example: 'ALL',
  })
  @IsOptional()
  @IsIn(['ALL', 'ACTIVE', 'UPCOMING', 'EXPIRED', 'DISABLED'])
  status?: 'ALL' | 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED';

  @ApiPropertyOptional({
    description: 'Trang hiện tại (bắt đầu từ 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên một trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

