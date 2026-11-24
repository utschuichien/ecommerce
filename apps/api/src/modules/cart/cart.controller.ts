import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  SelectCartItemDto,
  SelectAllCartDto,
} from './dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy chi tiết giỏ hàng của người dùng (gom nhóm theo Shop)' })
  async getCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Thêm sản phẩm hoặc biến thể vào giỏ hàng' })
  async addToCart(
    @CurrentUser('userId') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, dto);
  }

  @Patch('items/:variantId')
  @ApiOperation({ summary: 'Cập nhật số lượng của biến thể trong giỏ hàng (nếu = 0 sẽ tự xóa)' })
  async updateQuantity(
    @CurrentUser('userId') userId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(userId, variantId, dto);
  }

  @Patch('items/:variantId/select')
  @ApiOperation({ summary: 'Chọn hoặc bỏ chọn một sản phẩm trong giỏ hàng (lưu vào database)' })
  async toggleItemSelection(
    @CurrentUser('userId') userId: string,
    @Param('variantId') variantId: string,
    @Body() dto: SelectCartItemDto,
  ) {
    return this.cartService.toggleItemSelection(userId, variantId, dto.selected);
  }

  @Patch('select-all')
  @ApiOperation({ summary: 'Chọn hoặc bỏ chọn tất cả sản phẩm (hoặc theo từng Shop)' })
  async toggleSelectAll(
    @CurrentUser('userId') userId: string,
    @Body() dto: SelectAllCartDto,
  ) {
    return this.cartService.toggleSelectAll(userId, dto);
  }

  @Delete('items/:variantId')
  @ApiOperation({ summary: 'Xóa một biến thể khỏi giỏ hàng' })
  async removeItem(
    @CurrentUser('userId') userId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.cartService.removeItem(userId, variantId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Xóa toàn bộ sản phẩm khỏi giỏ hàng' })
  async clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
