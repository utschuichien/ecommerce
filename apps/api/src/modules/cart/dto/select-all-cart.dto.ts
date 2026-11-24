import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SelectAllCartDto {
  @ApiProperty({
    description: 'Trạng thái chọn tất cả sản phẩm',
    example: true,
  })
  @IsBoolean()
  selected: boolean;

  @ApiProperty({
    description: 'Lọc theo shopId / shopSlug nếu chỉ muốn chọn/bỏ chọn toàn bộ của 1 Shop',
    example: 'apple-flagship-store',
    required: false,
  })
  @IsOptional()
  @IsString()
  shopId?: string;
}

