import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên người dùng',
  })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự.' })
  @Length(2, 100, { message: 'Họ tên phải có độ dài từ 2 đến 100 ký tự.' })
  fullName?: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Số điện thoại liên hệ',
  })
  @IsOptional()
  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Số điện thoại không hợp lệ (định dạng Việt Nam: 10 số bắt đầu bằng 03, 05, 07, 08, 09).',
  })
  phone?: string;
}
