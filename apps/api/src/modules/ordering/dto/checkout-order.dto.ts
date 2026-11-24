import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @ApiProperty({ description: 'Tên người nhận hàng' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống.' })
  @IsString({ message: 'Tên người nhận không hợp lệ.' })
  recipientName: string;

  @ApiProperty({ description: 'Số điện thoại nhận hàng' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @IsString({ message: 'Số điện thoại không hợp lệ.' })
  phone: string;

  @ApiProperty({ description: 'Địa chỉ chi tiết (số nhà, tên đường)' })
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống.' })
  @IsString({ message: 'Địa chỉ giao hàng không hợp lệ.' })
  line1: string;

  @ApiPropertyOptional({ description: 'Phường / Xã' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'Quận / Huyện' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Tỉnh / Thành phố' })
  @IsOptional()
  @IsString()
  province?: string;
}

export class CheckoutOrderDto {
  @ApiProperty({ description: 'Địa chỉ nhận hàng', type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty({ message: 'Địa chỉ nhận hàng không được để trống.' })
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString({ message: 'Số điện thoại liên hệ không hợp lệ.' })
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ' })
  @IsOptional()
  @IsString({ message: 'Email liên hệ không hợp lệ.' })
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Phương thức thanh toán (COD, v.v.)',
    default: 'COD',
  })
  @IsOptional()
  @IsString({ message: 'Phương thức thanh toán không hợp lệ.' })
  paymentMethod?: string = 'COD';

  @ApiPropertyOptional({
    description: 'Phương thức giao hàng (standard, express)',
    default: 'standard',
  })
  @IsOptional()
  @IsString()
  shippingMethodId?: string = 'standard';

  @ApiPropertyOptional({ description: 'Ghi chú cho đơn hàng' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Mã voucher / giảm giá (nếu có, VD: COMMERCE50, SHOP50K)',
    example: 'COMMERCE50',
  })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

