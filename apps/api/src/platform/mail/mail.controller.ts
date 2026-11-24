import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MailService } from './mail.service';
import { Public } from '../decorators/public.decorator';

export class TestMailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Địa chỉ email nhận thư kiểm tra',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  email: string;
}

@ApiTags('Mail & SMTP')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái cấu hình hệ thống gửi mail SMTP' })
  getStatus() {
    return this.mailService.getStatus();
  }

  @Public()
  @Post('test')
  @ApiOperation({ summary: 'Gửi email kiểm tra cấu hình SMTP' })
  async sendTestMail(@Body() dto: TestMailDto) {
    return this.mailService.sendTestEmail(dto.email);
  }
}
