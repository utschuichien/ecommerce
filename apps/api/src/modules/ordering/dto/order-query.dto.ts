import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatusFilter {
  ALL = 'all',
  PENDING = 'pending',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc trạng thái đơn hàng: all, pending, shipping, delivered, cancelled',
    enum: OrderStatusFilter,
    default: OrderStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(OrderStatusFilter, {
    message: 'Trạng thái đơn hàng không hợp lệ.',
  })
  status?: OrderStatusFilter = OrderStatusFilter.ALL;

  @ApiPropertyOptional({ description: 'Tìm theo mã đơn hoặc tên sản phẩm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Số trang (1-indexed)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang không hợp lệ.' })
  @Min(1, { message: 'Số trang không hợp lệ.' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số đơn trên mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang không hợp lệ.' })
  @Min(1, { message: 'Số lượng mỗi trang không hợp lệ.' })
  limit?: number = 10;
}

