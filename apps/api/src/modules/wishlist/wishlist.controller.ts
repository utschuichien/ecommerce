import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { WishlistQueryDto } from './dto/wishlist-query.dto';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm yêu thích của người dùng (phân trang limit=10)' })
  async getWishlist(
    @CurrentUser('userId') userId: string,
    @Query() query: WishlistQueryDto,
  ) {
    return this.wishlistService.getWishlist(userId, query.page, query.limit);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Thêm sản phẩm vào danh sách yêu thích' })
  async addToWishlist(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi danh sách yêu thích' })
  async removeFromWishlist(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Kiểm tra xem sản phẩm đã có trong wishlist hay chưa' })
  async checkWishlist(
    @CurrentUser('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.checkWishlist(userId, productId);
  }
}
