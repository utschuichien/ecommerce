import { IsISO8601, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CatchUpQueryDto {
  @ApiProperty({
    description: 'Mốc thời gian ISO 8601 của thông báo mới nhất client đã nhận trước khi offline',
    example: '2026-11-15T23:30:00.000Z',
  })
  @IsNotEmpty({ message: 'since không được để trống' })
  @IsISO8601({}, { message: 'since phải là chuỗi thời gian định dạng ISO 8601 hợp lệ' })
  since: string;
}

