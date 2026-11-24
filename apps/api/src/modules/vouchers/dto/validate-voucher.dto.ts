import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateVoucherDto {
  @ApiProperty({
    description: 'Mã giảm giá (ví dụ: COMMERCE50, FREESHIP, APL50K)',
    example: 'COMMERCE50',
  })
  @IsNotEmpty({ message: 'Vui lòng nhập mã giảm giá.' })
  @IsString({ message: 'Mã giảm giá không hợp lệ.' })
  code: string;

  @ApiPropertyOptional({
    description: 'Mã shop (nếu muốn kiểm tra voucher riêng của Shop)',
    example: 'shop-apple-official',
  })
  @IsOptional()
  @IsString()
  shopSlugOrId?: string;
}

