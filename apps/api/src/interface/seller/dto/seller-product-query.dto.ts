import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SellerProductStatusFilter {
  ALL = 'all',
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum SellerProductSortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  STOCK_ASC = 'stock_asc',
  STOCK_DESC = 'stock_desc',
}

export class SellerProductQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên sản phẩm hoặc SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái: all, ACTIVE, HIDDEN, OUT_OF_STOCK',
    enum: SellerProductStatusFilter,
    default: SellerProductStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(SellerProductStatusFilter, {
    message: 'Trạng thái sản phẩm không hợp lệ.',
  })
  status?: SellerProductStatusFilter = SellerProductStatusFilter.ALL;

  @ApiPropertyOptional({
    description: 'Sắp xếp: newest, oldest, price_asc, price_desc, stock_asc, stock_desc',
    enum: SellerProductSortOption,
    default: SellerProductSortOption.NEWEST,
  })
  @IsOptional()
  @IsEnum(SellerProductSortOption, {
    message: 'Kiểu sắp xếp không hợp lệ.',
  })
  sort?: SellerProductSortOption = SellerProductSortOption.NEWEST;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang không hợp lệ.' })
  @Min(1, { message: 'Số trang không hợp lệ.' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang không hợp lệ.' })
  @Min(1, { message: 'Số lượng mỗi trang không hợp lệ.' })
  limit?: number = 6;
}
