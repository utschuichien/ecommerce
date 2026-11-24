import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { OrderingService } from './ordering.service';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../platform/interceptors/idempotency.interceptor';
import { RateLimit } from '../../platform/decorators/rate-limit.decorator';
import { OrderQueryDto } from './dto/order-query.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';

@ApiTags('Ordering')
@Controller('orders')
export class OrderingController {
  constructor(private readonly orderingService: OrderingService) {}

  @Get('statuses')
  @ApiOperation({
    summary: 'Lấy danh sách cấu hình trạng thái đơn hàng (chuẩn hóa metadata)',
  })
  getOrderStatuses() {
    return this.orderingService.getOrderStatuses();
  }

  @UseGuards(JwtAuthGuard)
  @Get('checkout-summary')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary:
      'Lấy thông tin tóm tắt thanh toán từ giỏ hàng và địa chỉ mặc định',
  })
  async getCheckoutSummary(@CurrentUser('userId') userId: string) {
    return this.orderingService.getCheckoutSummary(userId);
  }

  @UseGuards(JwtAuthGuard)
  @RateLimit({
    points: 5,
    duration: 60,
    message: 'Hệ thống đang xử lý đơn hàng của bạn. Vui lòng không bấm đặt hàng liên tục.',
  })
  @UseInterceptors(IdempotencyInterceptor)
  @Post('checkout')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Tạo đơn hàng thanh toán (COD / thanh toán khi nhận hàng)',
  })
  async createCheckoutOrder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CheckoutOrderDto,
  ) {
    return this.orderingService.createCheckoutOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của người dùng hiện tại' })
  async getMyOrders(
    @CurrentUser('userId') userId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.orderingService.getMyOrders(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:id')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng của người dùng' })
  async getMyOrderById(
    @CurrentUser('userId') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.orderingService.getMyOrderById(userId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('my-orders/:id/cancel')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Khách hàng hủy đơn hàng' })
  async cancelMyOrder(
    @CurrentUser('userId') userId: string,
    @Param('id') orderId: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderingService.cancelMyOrder(userId, orderId, reason);
  }
}
