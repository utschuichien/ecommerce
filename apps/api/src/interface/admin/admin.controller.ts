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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminShopQueryDto,
  UpdateShopStatusDto,
  AdminUserQueryDto,
  UpdateUserStatusRoleDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  AdminProductQueryDto,
  UpdateProductStatusDto,
  AdminOrderQueryDto,
  AdminReviewQueryDto,
  AdminVoucherQueryDto,
  CreatePlatformVoucherDto,
  UpdateVoucherStatusDto,
} from './dto';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { RolesGuard } from '../../platform/guards/roles.guard';
import { Roles } from '../../platform/decorators/roles.decorator';

@ApiTags('Admin Portal')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 1. Thống kê tổng quan sàn
   */
  @Get('stats/overview')
  @ApiOperation({ summary: 'Thống kê tổng quan sàn (Dashboard KPIs, Top Shops, Recent Orders)' })
  getOverviewStats(@Query('range') range?: string) {
    return this.adminService.getOverviewStats(range || '7');
  }

  /**
   * 2. Quản lý danh sách gian hàng
   */
  @Get('shops')
  @ApiOperation({ summary: 'Danh sách gian hàng có phân trang & bộ lọc' })
  getShops(@Query() query: AdminShopQueryDto) {
    return this.adminService.getShops(query);
  }

  /**
   * 2.1 Cập nhật trạng thái gian hàng (Duyệt mở / Tạm khóa)
   */
  @Patch('shops/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái gian hàng (Duyệt mở / Tạm khóa)' })
  updateShopStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShopStatusDto,
  ) {
    return this.adminService.updateShopStatus(id, dto);
  }

  /**
   * 3. Quản lý người dùng
   */
  @Get('users')
  @ApiOperation({ summary: 'Danh sách người dùng có phân trang & bộ lọc' })
  getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  /**
   * 3.1 Cập nhật vai trò hoặc trạng thái tài khoản người dùng
   */
  @Patch('users/:id')
  @ApiOperation({ summary: 'Cập nhật vai trò hoặc trạng thái tài khoản người dùng' })
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusRoleDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }

  /**
   * 4. Quản lý danh mục sàn
   */
  @Get('categories')
  @ApiOperation({ summary: 'Danh sách tất cả danh mục ngành hàng' })
  getCategories() {
    return this.adminService.getCategories();
  }

  /**
   * 4.1 Thêm danh mục mới
   */
  @Post('categories')
  @ApiOperation({ summary: 'Tạo danh mục ngành hàng mới' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  /**
   * 4.2 Cập nhật danh mục
   */
  @Put('categories/:id')
  @ApiOperation({ summary: 'Cập nhật danh mục ngành hàng' })
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, dto);
  }

  /**
   * 4.3 Xóa danh mục
   */
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Xóa danh mục ngành hàng (chỉ khi không có sản phẩm)' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  /**
   * 5. Quản lý sản phẩm toàn sàn
   */
  @Get('products')
  @ApiOperation({ summary: 'Danh sách sản phẩm toàn sàn có phân trang & tìm kiếm' })
  getProducts(@Query() query: AdminProductQueryDto) {
    return this.adminService.getProducts(query);
  }

  @Patch('products/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái hiển thị / ẩn của sản phẩm' })
  updateProductStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.adminService.updateProductStatus(id, dto);
  }

  /**
   * 6. Quản lý đơn hàng toàn sàn
   */
  @Get('orders')
  @ApiOperation({ summary: 'Danh sách đơn hàng toàn sàn có phân trang & tìm kiếm' })
  getOrders(@Query() query: AdminOrderQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Chi tiết đơn hàng toàn sàn' })
  getOrderDetails(@Param('id') id: string) {
    return this.adminService.getOrderDetails(id);
  }

  /**
   * 7. Quản lý đánh giá & phản hồi
   */
  @Get('reviews')
  @ApiOperation({ summary: 'Danh sách đánh giá của khách hàng toàn sàn' })
  getReviews(@Query() query: AdminReviewQueryDto) {
    return this.adminService.getReviews(query);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Xóa đánh giá vi phạm chính sách' })
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  /**
   * 8. Quản lý đối soát & giải ngân
   */
  @Get('payouts')
  @ApiOperation({ summary: 'Thống kê giải ngân & số dư gian hàng' })
  getPayouts() {
    return this.adminService.getPayouts();
  }

  @Post('payouts/:shopId/settle')
  @ApiOperation({ summary: 'Quyết toán giải ngân doanh thu cho gian hàng' })
  settlePayout(@Param('shopId') shopId: string) {
    return this.adminService.settlePayout(shopId);
  }

  /**
   * 9. Quản lý Voucher & khuyến mãi
   */
  @Get('vouchers')
  @ApiOperation({ summary: 'Danh sách mã giảm giá toàn sàn' })
  getVouchers(@Query() query: AdminVoucherQueryDto) {
    return this.adminService.getVouchers(query);
  }

  @Post('vouchers')
  @ApiOperation({ summary: 'Tạo mã giảm giá sàn mới' })
  createVoucher(@Body() dto: CreatePlatformVoucherDto) {
    return this.adminService.createPlatformVoucher(dto);
  }

  @Patch('vouchers/:id/status')
  @ApiOperation({ summary: 'Kích hoạt hoặc tạm ngưng voucher' })
  toggleVoucherStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVoucherStatusDto,
  ) {
    return this.adminService.toggleVoucherStatus(id, dto.isActive);
  }

  @Delete('vouchers/:id')
  @ApiOperation({ summary: 'Xóa voucher nếu chưa có lượt sử dụng' })
  deleteVoucher(@Param('id') id: string) {
    return this.adminService.deleteVoucher(id);
  }
}
