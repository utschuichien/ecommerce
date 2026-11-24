import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ShopProductSortOption {
  NEWEST = 'NEWEST',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  BESTSELLER = 'BESTSELLER',
  POPULAR = 'POPULAR',
}

export enum ShopProductTabFilter {
  ALL = 'all',
  BESTSELLER = 'bestseller',
  PROMOTIONS = 'promotions',
}

export class ShopProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Slug hoặc tên danh mục sản phẩm của shop để lọc',
    example: 'tai-nghe',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Tab hiển thị: all (tất cả), bestseller (bán chạy), promotions (khuyến mãi)',
    enum: ShopProductTabFilter,
    default: ShopProductTabFilter.ALL,
  })
  @IsOptional()
  @IsEnum(ShopProductTabFilter, {
    message: 'Tab lọc sản phẩm phải là một trong các giá trị: all, bestseller, promotions',
  })
  tab?: ShopProductTabFilter = ShopProductTabFilter.ALL;

  @ApiPropertyOptional({
    description: 'Tiêu chí sắp xếp: NEWEST, PRICE_ASC, PRICE_DESC, BESTSELLER, POPULAR',
    enum: ShopProductSortOption,
    default: ShopProductSortOption.NEWEST,
  })
  @IsOptional()
  @IsEnum(ShopProductSortOption, {
    message: 'Tiêu chí sắp xếp không hợp lệ (NEWEST, PRICE_ASC, PRICE_DESC, BESTSELLER, POPULAR)',
  })
  sortBy?: ShopProductSortOption = ShopProductSortOption.NEWEST;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm trong gian hàng',
    example: 'AirPods',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Số trang hiện tại (bắt đầu từ 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page phải là số nguyên dương' })
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số sản phẩm mỗi trang (tối đa 50)',
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit phải là số nguyên' })
  @Min(1)
  @Max(50)
  limit?: number = 12;
}

