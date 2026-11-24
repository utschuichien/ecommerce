import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty({ description: 'Nội dung phản hồi từ người bán' })
  @IsString()
  @IsNotEmpty()
  reply: string;
}

