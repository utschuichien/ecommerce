import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CatalogSortOption {
  POPULAR = 'popular',
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BESTSELLER = 'bestseller',
}

export enum CatalogStockFilter {
  ALL = 'all',
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CatalogQueryDto {
  @ApiPropertyOptional({ description: 'Slug hoặc ID của danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Danh sách thương hiệu (ngăn cách bởi dấu phẩy, vd: apple,samsung)' })
  @IsOptional()
  @IsString()
  brands?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tối thiểu không hợp lệ.' })
  @Min(0, { message: 'Giá tối thiểu không hợp lệ.' })
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá tối đa không hợp lệ.' })
  @Min(0, { message: 'Giá tối đa không hợp lệ.' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Tình trạng kho hàng: all, in_stock, out_of_stock',
    enum: CatalogStockFilter,
    default: CatalogStockFilter.ALL,
  })
  @IsOptional()
  @IsEnum(CatalogStockFilter, {
    message: 'Tình trạng kho hàng không hợp lệ.',
  })
  stock?: CatalogStockFilter = CatalogStockFilter.ALL;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp: popular (phổ biến), newest (mới nhất), price_asc (giá tăng), price_desc (giá giảm), bestseller (bán chạy)',
    enum: CatalogSortOption,
    default: CatalogSortOption.POPULAR,
  })
  @IsOptional()
  @IsEnum(CatalogSortOption, {
    message: 'Kiểu sắp xếp không hợp lệ.',
  })
  sort?: CatalogSortOption = CatalogSortOption.POPULAR;

  @ApiPropertyOptional({ description: 'Số trang (1-indexed)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số trang không hợp lệ.' })
  @Min(1, { message: 'Số trang không hợp lệ.' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng sản phẩm mỗi trang (mặc định 12)', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng mỗi trang không hợp lệ.' })
  @Min(1, { message: 'Số lượng mỗi trang không hợp lệ.' })
  limit?: number = 12;
}
