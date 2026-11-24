import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'MatKhauCu@123',
    description: 'Mật khẩu hiện tại',
  })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống.' })
  currentPassword: string;

  @ApiProperty({
    example: 'MatKhauMoi@456',
    description: 'Mật khẩu mới (tối thiểu 8 ký tự)',
  })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự.' })
  @Length(8, 100, { message: 'Mật khẩu mới phải có độ dài từ 8 đến 100 ký tự.' })
  newPassword: string;
}
