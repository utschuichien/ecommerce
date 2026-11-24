import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SellerOrderStatusFilter {
  ALL = 'ALL',
  PENDING = 'PENDING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum SellerOrderTimeRange {
  ALL = 'all',
  TODAY = 'today',
  DAYS_7 = '7d',
  DAYS_30 = '30d',
  MONTH = 'month',
}

export enum SellerOrderAmountRange {
  ALL = 'all',
  UNDER_500K = 'under_500k',
  FROM_500K_TO_2M = '500k_2m',
  OVER_2M = 'over_2m',
}

export enum SellerOrderSortBy {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TOTAL_DESC = 'TOTAL_DESC',
  TOTAL_ASC = 'TOTAL_ASC',
}

export class SellerOrderQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc trạng thái: ALL, PENDING, SHIPPING, DELIVERED, CANCELLED',
    enum: SellerOrderStatusFilter,
    default: SellerOrderStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(SellerOrderStatusFilter, { message: 'Trạng thái đơn hàng không hợp lệ.' })
  status?: SellerOrderStatusFilter = SellerOrderStatusFilter.ALL;

  @ApiPropertyOptional({
    description: 'Khoảng thời gian: all, today, 7d, 30d, month',
    enum: SellerOrderTimeRange,
    default: SellerOrderTimeRange.ALL,
  })
  @IsOptional()
  @IsEnum(SellerOrderTimeRange, { message: 'Khoảng thời gian không hợp lệ.' })
  timeRange?: SellerOrderTimeRange = SellerOrderTimeRange.ALL;

  @ApiPropertyOptional({
    description: 'Khoảng giá trị đơn: all, under_500k, 500k_2m, over_2m',
    enum: SellerOrderAmountRange,
    default: SellerOrderAmountRange.ALL,
  })
  @IsOptional()
  @IsEnum(SellerOrderAmountRange, { message: 'Khoảng giá trị đơn không hợp lệ.' })
  amountRange?: SellerOrderAmountRange = SellerOrderAmountRange.ALL;

  @ApiPropertyOptional({
    description: 'Sắp xếp: NEWEST, OLDEST, TOTAL_DESC, TOTAL_ASC',
    enum: SellerOrderSortBy,
    default: SellerOrderSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(SellerOrderSortBy, { message: 'Kiểu sắp xếp không hợp lệ.' })
  sortBy?: SellerOrderSortBy = SellerOrderSortBy.NEWEST;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo mã đơn hàng, tên khách hàng hoặc email',
    example: 'ORD-2025',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
