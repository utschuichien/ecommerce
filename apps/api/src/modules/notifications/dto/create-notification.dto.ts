import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID hoặc publicId của người nhận thông báo' })
  @IsNotEmpty({ message: 'userId không được để trống' })
  userId: string | bigint;

  @ApiProperty({
    enum: NotificationType,
    description: 'Phân loại thông báo',
    example: NotificationType.ORDER,
  })
  @IsEnum(NotificationType, { message: 'type phải thuộc danh sách NotificationType hợp lệ' })
  type: NotificationType;

  @ApiProperty({ description: 'Tiêu đề thông báo', example: 'Đơn hàng đang được giao' })
  @IsString()
  @IsNotEmpty({ message: 'title không được để trống' })
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Nội dung chi tiết của thông báo' })
  @IsString()
  @IsNotEmpty({ message: 'message không được để trống' })
  message: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn điều hướng khi người dùng click vào thông báo',
    example: '/profile?tab=orders&orderId=ord_123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh minh họa hoặc thumbnail sản phẩm',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    description: 'Dữ liệu metadata mở rộng dạng JSON',
    example: { orderId: 'ord_123', status: 'SHIPPING' },
  })
  @IsOptional()
  metadata?: any;
}

