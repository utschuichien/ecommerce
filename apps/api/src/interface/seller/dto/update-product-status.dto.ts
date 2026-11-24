import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'HIDDEN'], example: 'HIDDEN' })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['ACTIVE', 'HIDDEN'], { message: 'Trạng thái phải là ACTIVE hoặc HIDDEN' })
  status: 'ACTIVE' | 'HIDDEN';
}
