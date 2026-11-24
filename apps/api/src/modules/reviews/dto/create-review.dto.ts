import { IsInt, Min, Max, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Mã công khai sản phẩm (productId hoặc slug)' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Mã đơn hàng (orderId hoặc orderNumber)' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Mã biến thể (variantId)' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Số sao đánh giá (1 đến 5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Nội dung nhận xét' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Danh sách URL ảnh chụp thực tế', type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];
}

