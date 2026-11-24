import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Địa chỉ email đăng ký',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Email không được để trống.' })
  email: string;

  @ApiProperty({
    example: 'MatKhau@123456',
    description: 'Mật khẩu tối thiểu 8 ký tự',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  @Length(8, 100, { message: 'Mật khẩu phải có độ dài từ 8 đến 100 ký tự.' })
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên người dùng',
  })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự.' })
  @Length(2, 100, { message: 'Họ tên phải có độ dài từ 2 đến 100 ký tự.' })
  fullName: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Số điện thoại liên hệ tại Việt Nam',
  })
  @IsOptional()
  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không hợp lệ (định dạng Việt Nam: 10 số bắt đầu bằng 03, 05, 07, 08, 09).',
  })
  phone?: string;
}
