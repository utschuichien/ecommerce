import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { CatchUpQueryDto } from './dto/catch-up-query.dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo phân trang của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo kèm phân trang' })
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc (badge count)' })
  @ApiResponse({ status: 200, description: 'Số lượng thông báo chưa đọc' })
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('catch-up')
  @ApiOperation({
    summary: 'Catch-up on reconnect: Lấy các thông báo bị bỏ lỡ khi mất mạng',
  })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo trong khoảng thời gian offline' })
  async catchUpNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: CatchUpQueryDto,
  ) {
    return this.notificationsService.catchUpNotifications(userId, query.since);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu tất cả thành công' })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':publicId/read')
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo cụ thể là đã đọc' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu thông báo là đã đọc' })
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('publicId') publicId: string,
  ) {
    return this.notificationsService.markAsRead(userId, publicId);
  }
}
