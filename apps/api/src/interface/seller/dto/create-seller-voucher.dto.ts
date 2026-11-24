import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
  Matches,
} from 'class-validator';

export class CreateSellerVoucherDto {
  @ApiProperty({
    description: 'Mã voucher (duy nhất, viết hoa, không dấu, 3-32 ký tự)',
    example: 'SHOPGIAM20K',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9_-]{3,32}$/, {
    message: 'Mã voucher phải từ 3-32 ký tự in hoa, số hoặc gạch nối (A-Z, 0-9, _, -)',
  })
  code: string;

  @ApiProperty({
    description: 'Tên chương trình voucher',
    example: 'Giảm 20K cho đơn từ 200K',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết điều kiện voucher',
    example: 'Áp dụng cho tất cả sản phẩm của Shop',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Loại giảm giá: FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING',
    example: 'FIXED_AMOUNT',
    enum: ['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'],
  })
  @IsNotEmpty()
  @IsIn(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'])
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';

  @ApiProperty({
    description: 'Giá trị giảm (Số tiền VND nếu FIXED_AMOUNT, hoặc % nếu PERCENTAGE, hoặc 0 nếu FREE_SHIPPING)',
    example: 20000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Số tiền giảm tối đa (dành cho loại PERCENTAGE)',
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'Giá trị đơn hàng tối thiểu để được áp dụng (VND)',
    example: 200000,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Tổng số lượt sử dụng tối đa của toàn Shop',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Số lượt sử dụng tối đa của mỗi khách hàng',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usagePerUser?: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu áp dụng (ISO 8601)',
    example: '2026-11-13T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Thời gian kết thúc (ISO 8601)',
    example: '2026-11-30T23:59:59.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của voucher',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

