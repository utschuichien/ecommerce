import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { AvailableVoucherQueryDto } from './dto/available-voucher-query.dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { Public } from '../../platform/decorators/public.decorator';
import { RateLimit } from '../../platform/decorators/rate-limit.decorator';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Public()
  @Get('available')
  @ApiOperation({
    summary:
      'Lấy danh sách các mã giảm giá (Voucher) khả dụng của toàn Sàn hoặc theo Shop',
  })
  @ApiQuery({
    name: 'shop',
    required: false,
    description: 'Slug hoặc ID của Shop để lấy voucher riêng của Shop đó',
  })
  async getAvailableVouchers(
    @CurrentUser('userId') userPublicId: string | undefined,
    @Query() query: AvailableVoucherQueryDto,
  ) {
    return this.vouchersService.getAvailableVouchers(userPublicId, query.shop);
  }

  @UseGuards(JwtAuthGuard)
  @RateLimit({
    points: 10,
    duration: 60,
    message: 'Bạn đã kiểm tra mã giảm giá quá nhiều lần. Vui lòng đợi 1 phút trước khi thử lại.',
  })
  @Post('validate')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'Thẩm định mã giảm giá theo giỏ hàng thực tế và tính số tiền được giảm',
  })
  async validateVoucher(
    @CurrentUser('userId') userPublicId: string,
    @Body() dto: ValidateVoucherDto,
  ) {
    return this.vouchersService.validateVoucher(userPublicId, dto);
  }
}

