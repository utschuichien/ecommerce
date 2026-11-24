import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Tên người nhận hàng',
  })
  @IsOptional()
  @IsString({ message: 'Tên người nhận phải là chuỗi ký tự.' })
  @Length(2, 100, { message: 'Tên người nhận phải có từ 2 đến 100 ký tự.' })
  recipientName?: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Số điện thoại người nhận',
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không hợp lệ.',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Số 12, Đường Lê Duẩn',
    description: 'Địa chỉ chi tiết (số nhà, tên đường)',
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ chi tiết phải là chuỗi ký tự.' })
  @Length(3, 255, { message: 'Địa chỉ chi tiết phải từ 3 đến 255 ký tự.' })
  line1?: string;

  @ApiPropertyOptional({
    example: 'Phường Bến Nghé',
    description: 'Phường / Xã',
  })
  @IsOptional()
  @IsString({ message: 'Phường / Xã phải là chuỗi ký tự.' })
  ward?: string;

  @ApiPropertyOptional({
    example: 'Quận 1',
    description: 'Quận / Huyện',
  })
  @IsOptional()
  @IsString({ message: 'Quận / Huyện phải là chuỗi ký tự.' })
  district?: string;

  @ApiPropertyOptional({
    example: 'TP. Hồ Chí Minh',
    description: 'Tỉnh / Thành phố',
  })
  @IsOptional()
  @IsString({ message: 'Tỉnh / Thành phố phải là chuỗi ký tự.' })
  province?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Đặt làm địa chỉ giao hàng mặc định',
  })
  @IsOptional()
  @IsBoolean({ message: 'isDefault phải là giá trị boolean.' })
  isDefault?: boolean;
}
