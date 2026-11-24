import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên người nhận hàng',
  })
  @IsString({ message: 'Tên người nhận phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống.' })
  @Length(2, 100, { message: 'Tên người nhận phải có từ 2 đến 100 ký tự.' })
  recipientName: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại người nhận',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không hợp lệ.',
  })
  phone: string;

  @ApiProperty({
    example: 'Số 12, Đường Lê Duẩn',
    description: 'Địa chỉ chi tiết (số nhà, tên đường)',
  })
  @IsString({ message: 'Địa chỉ chi tiết phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống.' })
  @Length(3, 255, { message: 'Địa chỉ chi tiết phải từ 3 đến 255 ký tự.' })
  line1: string;

  @ApiProperty({
    example: 'Phường Bến Nghé',
    description: 'Phường / Xã',
  })
  @IsString({ message: 'Phường / Xã phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Phường / Xã không được để trống.' })
  ward: string;

  @ApiProperty({
    example: 'Quận 1',
    description: 'Quận / Huyện',
  })
  @IsString({ message: 'Quận / Huyện phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Quận / Huyện không được để trống.' })
  district: string;

  @ApiProperty({
    example: 'TP. Hồ Chí Minh',
    description: 'Tỉnh / Thành phố',
  })
  @IsString({ message: 'Tỉnh / Thành phố phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tỉnh / Thành phố không được để trống.' })
  province: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Đặt làm địa chỉ giao hàng mặc định',
  })
  @IsOptional()
  @IsBoolean({ message: 'isDefault phải là giá trị boolean.' })
  isDefault?: boolean;
}
