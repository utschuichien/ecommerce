import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantItemDto {
  @ApiProperty({ description: 'Mã SKU của biến thể', example: 'SKU-APP-001-BLK' })
  @IsNotEmpty({ message: 'Mã SKU biến thể không được để trống' })
  @IsString()
  @MaxLength(64)
  sku: string;

  @ApiProperty({ description: 'Giá bán của biến thể', example: 5990000 })
  @IsNumber()
  @Min(0, { message: 'Giá bán biến thể không được nhỏ hơn 0' })
  price: number;

  @ApiProperty({ description: 'Số lượng kho của biến thể', example: 30 })
  @IsNumber()
  @Min(0, { message: 'Số lượng kho biến thể không được nhỏ hơn 0' })
  stock: number;

  @ApiPropertyOptional({ description: 'Các thuộc tính biến thể, vd: {"Màu sắc": "Đen", "Size": "L"}' })
  @IsOptional()
  optionValues?: Record<string, string>;

  @ApiPropertyOptional({ description: 'URL ảnh riêng của biến thể' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateSellerProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', example: 'Tai nghe AirPods Pro 2' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Phụ đề / mô tả ngắn' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Mã SKU chung hoặc SKU chính', example: 'SKU-APP-001' })
  @IsNotEmpty({ message: 'Mã SKU không được để trống' })
  @IsString()
  @MaxLength(64)
  sku: string;

  @ApiProperty({ description: 'Tên hoặc slug danh mục', example: 'Tai nghe' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Giá bán chung hoặc giá khởi điểm (VND)', example: 5990000 })
  @IsNumber()
  @Min(0, { message: 'Giá bán không được nhỏ hơn 0' })
  price: number;

  @ApiProperty({ description: 'Số lượng tồn kho', example: 50 })
  @IsNumber()
  @Min(0, { message: 'Số lượng tồn kho không được nhỏ hơn 0' })
  stock: number;

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

  @ApiPropertyOptional({ description: 'Trạng thái', enum: ['ACTIVE', 'HIDDEN'], default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'HIDDEN' = 'ACTIVE';
}


