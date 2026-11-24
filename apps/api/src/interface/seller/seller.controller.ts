import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SellerService } from './seller.service';
import {
  SellerProductQueryDto,
  CreateSellerProductDto,
  UpdateSellerProductDto,
  UpdateProductStatusDto,
  UpdateSellerShopDto,
  UpdateShopStatusDto,
  SellerOrderQueryDto,
  UpdateSellerOrderStatusDto,
  SellerInventoryQueryDto,
  AdjustSellerInventoryDto,
  SellerAnalyticsQueryDto,
  CreateSellerVoucherDto,
  UpdateSellerVoucherDto,
  SellerVoucherQueryDto,
} from './dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { RolesGuard } from '../../platform/guards/roles.guard';
import { Roles } from '../../platform/decorators/roles.decorator';

@ApiTags('Seller Portal')
@Controller('seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SELLER')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('shop')
  @ApiOperation({ summary: 'Lấy thông tin và cài đặt cửa hàng của Seller hiện tại' })
  async getShopProfile(@CurrentUser('userId') userId: string) {
    return this.sellerService.getShopProfile(userId);
  }

  @Put('shop')
  @ApiOperation({ summary: 'Cập nhật thông tin và cài đặt cửa hàng của Seller' })
  async updateShopProfile(
    @Body() dto: UpdateSellerShopDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.updateShopProfile(dto, userId);
  }

  @Patch('shop/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái mở cửa / tạm đóng cửa hàng' })
  async updateShopStatus(
    @Body() dto: UpdateShopStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.updateShopStatus(dto.status, userId);
  }

  @Post('shop/upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Tải ảnh logo / avatar cửa hàng lên Cloudinary' })
  async uploadShopLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.uploadShopLogo(file, userId);
  }

  @Post('shop/upload-banner')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Tải ảnh banner / cover cửa hàng lên Cloudinary' })
  async uploadShopBanner(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.uploadShopBanner(file, userId);
  }

  @Post('register')
  @Roles('CUSTOMER', 'SELLER')
  @ApiOperation({ summary: 'Đăng ký hoặc kích hoạt kênh người bán (Cấp role SELLER)' })
  async registerSeller(@CurrentUser('userId') userId: string) {
    return this.sellerService.registerAsSeller(userId);
  }

  @Post('products/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Tải ảnh sản phẩm lên Cloudinary' })
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.uploadProductImage(file, userId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách các danh mục sản phẩm từ Database' })
  async getCategories() {
    return this.sellerService.getCategories();
  }

  @Get('products/stats')
  @ApiOperation({ summary: 'Thống kê 4 thẻ chỉ số KPI của sản phẩm (Tổng, Đang bán, Hết hàng, Tạm ẩn)' })
  async getStats(@CurrentUser('userId') userId: string) {
    return this.sellerService.getStats(userId);
  }

  @Get('products')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm phân trang, tìm kiếm & bộ lọc' })
  async getProducts(
    @Query() query: SellerProductQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getProducts(query, userId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo Public ID' })
  async getProductDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getProductDetail(id, userId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Thêm mới sản phẩm vào cửa hàng' })
  async createProduct(
    @Body() dto: CreateSellerProductDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.createProduct(dto, userId);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Cập nhật toàn bộ thông tin sản phẩm' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateSellerProductDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.updateProduct(id, dto, userId);
  }

  @Patch('products/:id/status')
  @ApiOperation({ summary: 'Bật / tạm ẩn sản phẩm nhanh' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.toggleProductStatus(id, dto, userId);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Xóa mềm sản phẩm (Soft delete)' })
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.deleteProduct(id, userId);
  }

  // =========================================================================
  // GIAI ĐOẠN 2: QUẢN LÝ ĐƠN HÀNG (SELLER ORDERS)
  // =========================================================================

  @Get('orders/stats')
  @ApiOperation({ summary: 'Thống kê 4 thẻ chỉ số đơn hàng (Tổng đơn, Đang xử lý, Đang giao, Hoàn thành)' })
  async getOrderStats(@CurrentUser('userId') userId: string) {
    return this.sellerService.getOrderStats(userId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của Seller kèm tìm kiếm, lọc & phân trang' })
  async getOrders(
    @Query() query: SellerOrderQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getOrders(query, userId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo PublicId' })
  async getOrderDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getOrderDetail(id, userId);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Hoàn thành, Đã hủy)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSellerOrderStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.updateOrderStatus(id, dto, userId);
  }

  // =========================================================================
  // GIAI ĐOẠN 2: QUẢN LÝ TỒN KHO (SELLER INVENTORY)
  // =========================================================================

  @Get('inventory/stats')
  @ApiOperation({ summary: 'Thống kê 4 thẻ chỉ số kho hàng (Tổng mặt hàng, Sắp hết, Hết hàng, Tổng tồn)' })
  async getInventoryStats(@CurrentUser('userId') userId: string) {
    return this.sellerService.getInventoryStats(userId);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Lấy danh sách mặt hàng tồn kho phân trang, tìm kiếm & bộ lọc' })
  async getInventory(
    @Query() query: SellerInventoryQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getInventory(query, userId);
  }

  @Post('inventory/adjust')
  @ApiOperation({ summary: 'Điều chỉnh số lượng tồn kho và ghi log kiểm kê' })
  async adjustInventory(
    @Body() dto: AdjustSellerInventoryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.adjustInventory(dto, userId);
  }

  // =========================================================================
  // GIAI ĐOẠN 3: TỔNG QUAN (DASHBOARD OVERVIEW) & THỐNG KÊ (ANALYTICS)
  // =========================================================================

  @Get('overview')
  @ApiOperation({ summary: 'Lấy dữ liệu tổng quan: 4 KPI, biểu đồ doanh thu, top sản phẩm & đơn hàng gần đây' })
  async getOverview(
    @Query('range') range: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getOverview(range || '7', userId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Lấy dữ liệu phân tích doanh thu, tăng trưởng & tỷ lệ thanh toán' })
  async getAnalytics(
    @Query() query: SellerAnalyticsQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getAnalytics(query, userId);
  }

  // =========================================================================
  // GIAI ĐOẠN 4: QUẢN LÝ VOUCHER & MÃ GIẢM GIÁ CỦA SHOP
  // =========================================================================

  @Get('vouchers')
  @ApiOperation({ summary: 'Lấy danh sách voucher của Shop (phân trang, lọc và thống kê)' })
  async getVouchers(
    @Query() query: SellerVoucherQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.getVouchers(query, userId);
  }

  @Post('vouchers')
  @ApiOperation({ summary: 'Tạo mã voucher mới cho Shop' })
  async createVoucher(
    @Body() dto: CreateSellerVoucherDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.createVoucher(dto, userId);
  }

  @Patch('vouchers/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin voucher của Shop' })
  async updateVoucher(
    @Param('id') id: string,
    @Body() dto: UpdateSellerVoucherDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.updateVoucher(id, dto, userId);
  }

  @Patch('vouchers/:id/status')
  @ApiOperation({ summary: 'Bật / Tắt trạng thái hoạt động của voucher' })
  async toggleVoucherStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.toggleVoucherStatus(id, Boolean(isActive), userId);
  }

  @Delete('vouchers/:id')
  @ApiOperation({ summary: 'Xóa hoặc tạm dừng voucher của Shop' })
  async deleteVoucher(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sellerService.deleteVoucher(id, userId);
  }
}
