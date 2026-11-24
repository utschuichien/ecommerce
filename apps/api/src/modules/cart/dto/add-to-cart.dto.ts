import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiPropertyOptional({
    description: 'Public ID hoặc ID của biến thể sản phẩm (Variant)',
    example: '01M6V91QG7FC5426DWDJG28QJQ',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    description: 'Slug của sản phẩm (dùng để tìm biến thể mặc định nếu không truyền variantId)',
    example: 'prod-iphone-15-pro-max',
  })
  @IsOptional()
  @IsString()
  productSlug?: string;

  @ApiPropertyOptional({
    description: 'Số lượng cần thêm vào giỏ hàng',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity?: number = 1;
}

