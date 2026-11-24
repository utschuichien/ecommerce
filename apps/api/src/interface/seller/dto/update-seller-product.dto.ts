import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariantItemDto } from './create-seller-product.dto';

export class UpdateSellerProductDto {
  @ApiPropertyOptional({ description: 'Tên sản phẩm' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Phụ đề / mô tả ngắn' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Mã SKU' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @ApiPropertyOptional({ description: 'Tên hoặc slug danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Giá bán (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Số lượng tồn kho' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'URL ảnh sản phẩm (ảnh bìa)' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Danh sách URL ảnh sản phẩm (ảnh đầu tiên là ảnh bìa)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Danh sách các phân loại / biến thể của sản phẩm', type: [ProductVariantItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantItemDto)
  variants?: ProductVariantItemDto[];

  @ApiPropertyOptional({ description: 'Trạng thái', enum: ['ACTIVE', 'HIDDEN'] })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'HIDDEN';
}

