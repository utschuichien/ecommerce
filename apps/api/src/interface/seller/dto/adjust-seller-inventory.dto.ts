import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustSellerInventoryDto {
  @ApiProperty({
    description: 'Mã định danh của mặt hàng tồn kho / Variant ID',
    example: 'inv-1',
  })
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @ApiProperty({
    description: 'Số lượng tồn kho mới sau khi điều chỉnh',
    example: 50,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  newStock: number;

  @ApiPropertyOptional({
    description: 'Lý do điều chỉnh tồn kho',
    example: 'Kiểm kê định kỳ',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

