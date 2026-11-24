import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateSellerOrderStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của đơn hàng: PENDING, PROCESSING, SHIPPING, DELIVERED, CANCELLED',
    example: 'SHIPPING',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

  @ApiPropertyOptional({
    description: 'Tên đơn vị vận chuyển (khi chuyển sang SHIPPING)',
    example: 'Giao Hàng Nhanh (GHN)',
  })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({
    description: 'Mã vận đơn bưu kiện (khi chuyển sang SHIPPING)',
    example: 'GHN982341275VN',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({
    description: 'Lý do người bán từ chối / hủy đơn (khi chuyển sang CANCELLED)',
    example: 'Sản phẩm tạm thời hết hàng tại kho đóng gói',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}


