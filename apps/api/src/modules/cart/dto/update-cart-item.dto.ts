import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Số lượng mới cho sản phẩm trong giỏ hàng (nếu = 0 sẽ xóa sản phẩm khỏi giỏ)',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Số lượng không được âm' })
  quantity: number;
}

