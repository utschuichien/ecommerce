import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SelectCartItemDto {
  @ApiProperty({
    description: 'Trạng thái chọn của sản phẩm trong giỏ hàng',
    example: true,
  })
  @IsBoolean()
  selected: boolean;
}

