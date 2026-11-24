import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SellerStockLevelFilter {
  ALL = 'ALL',
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SAFE = 'SAFE',
}

export enum SellerInventorySortBy {
  NEWEST = 'NEWEST',
  STOCK_ASC = 'STOCK_ASC',
  STOCK_DESC = 'STOCK_DESC',
  NAME_ASC = 'NAME_ASC',
}

export class SellerInventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên sản phẩm, SKU hoặc thương hiệu',
    example: 'AirPods',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo danh mục sản phẩm',
    example: 'ALL',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lọc trạng thái tồn kho: ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK, SAFE',
    enum: SellerStockLevelFilter,
    default: SellerStockLevelFilter.ALL,
  })
  @IsOptional()
  @IsEnum(SellerStockLevelFilter, { message: 'Trạng thái tồn kho không hợp lệ.' })
  status?: SellerStockLevelFilter = SellerStockLevelFilter.ALL;

  @ApiPropertyOptional({
    description: 'Sắp xếp tồn kho: NEWEST, STOCK_ASC (ưu tiên nhập hàng), STOCK_DESC, NAME_ASC',
    enum: SellerInventorySortBy,
    default: SellerInventorySortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(SellerInventorySortBy, { message: 'Kiểu sắp xếp không hợp lệ.' })
  sortBy?: SellerInventorySortBy = SellerInventorySortBy.NEWEST;

  @ApiPropertyOptional({
    description: 'Lọc theo mức tồn kho chi tiết: ALL, OUT_OF_STOCK, LOW_STOCK, SAFE',
    enum: SellerStockLevelFilter,
    default: SellerStockLevelFilter.ALL,
  })
  @IsOptional()
  @IsEnum(SellerStockLevelFilter, { message: 'Mức tồn kho không hợp lệ.' })
  stockLevel?: SellerStockLevelFilter = SellerStockLevelFilter.ALL;

  @ApiPropertyOptional({
    description: 'Số trang (bắt đầu từ 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang không hợp lệ.' })
  @Min(1, { message: 'Số trang không hợp lệ.' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục trên mỗi trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang không hợp lệ.' })
  @Min(1, { message: 'Số lượng mỗi trang không hợp lệ.' })
  limit?: number = 10;
}
