import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Refresh token (nếu không truyền qua cookie refresh_token)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
