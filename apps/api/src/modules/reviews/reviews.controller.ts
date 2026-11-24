import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { RateLimit } from '../../platform/decorators/rate-limit.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @RateLimit({
    points: 5,
    duration: 60,
    message: 'Bạn đã gửi đánh giá quá nhiều lần. Vui lòng đợi 1 phút trước khi gửi đánh giá tiếp theo.',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Khách hàng gửi đánh giá sản phẩm sau khi nhận hàng' })
  async createReview(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, dto);
  }

  @Get('product/:slugOrId')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá của sản phẩm (công khai)' })
  async getProductReviews(
    @Param('slugOrId') slugOrId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.getProductReviews(
      slugOrId,
      query.page,
      query.limit,
      query.rating,
      query.hasImages,
    );
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Người bán phản hồi đánh giá sản phẩm' })
  async replyToReview(
    @CurrentUser('userId') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: ReplyReviewDto,
  ) {
    return this.reviewsService.replyToReview(userId, reviewId, dto);
  }
}

