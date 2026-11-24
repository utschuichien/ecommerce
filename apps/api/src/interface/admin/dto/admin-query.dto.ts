import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class AdminPaginationDto {
  @ApiPropertyOptional({ default: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Số bản ghi trên mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;
}

export enum AdminShopFilterStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export class AdminShopQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({
    enum: AdminShopFilterStatus,
    default: AdminShopFilterStatus.ALL,
    description: 'Lọc theo trạng thái gian hàng',
  })
  @IsOptional()
  @IsEnum(AdminShopFilterStatus)
  status?: AdminShopFilterStatus = AdminShopFilterStatus.ALL;
}

export class UpdateShopStatusDto {
  @ApiProperty({
    enum: ['ACTIVE', 'SUSPENDED'],
    description: 'Trạng thái mới của gian hàng',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(['ACTIVE', 'SUSPENDED'], { message: 'Trạng thái chỉ có thể là ACTIVE hoặc SUSPENDED' })
  status: 'ACTIVE' | 'SUSPENDED';

  @ApiPropertyOptional({ description: 'Lý do tạm khóa hoặc ghi chú kiểm duyệt' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export enum AdminUserFilterRole {
  ALL = 'ALL',
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export enum AdminUserFilterStatus {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class AdminUserQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({
    enum: AdminUserFilterRole,
    default: AdminUserFilterRole.ALL,
    description: 'Lọc theo vai trò người dùng',
  })
  @IsOptional()
  @IsEnum(AdminUserFilterRole)
  role?: AdminUserFilterRole = AdminUserFilterRole.ALL;

  @ApiPropertyOptional({
    enum: AdminUserFilterStatus,
    default: AdminUserFilterStatus.ALL,
    description: 'Lọc theo trạng thái tài khoản',
  })
  @IsOptional()
  @IsEnum(AdminUserFilterStatus)
  status?: AdminUserFilterStatus = AdminUserFilterStatus.ALL;
}

export class UpdateUserStatusRoleDto {
  @ApiPropertyOptional({
    enum: ['CUSTOMER', 'SELLER', 'ADMIN'],
    description: 'Vai trò mới của người dùng',
  })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'SELLER', 'ADMIN'])
  role?: 'CUSTOMER' | 'SELLER' | 'ADMIN';

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'SUSPENDED'],
    description: 'Trạng thái mới của người dùng',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED'])
  status?: 'ACTIVE' | 'SUSPENDED';
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Đồng hồ thông minh', description: 'Tên danh mục' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'smart-watches', description: 'Slug định danh đường dẫn URL' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ default: 0, description: 'Thứ tự ưu tiên hiển thị' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number = 0;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Đồng hồ & Vòng đeo tay', description: 'Tên danh mục' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'smart-watches', description: 'Slug định danh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Thứ tự ưu tiên' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hiển thị' })
  @IsOptional()
  isActive?: boolean;
}

export class AdminProductQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: 'Lọc theo trạng thái sản phẩm' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateProductStatusDto {
  @ApiProperty({
    enum: ['ACTIVE', 'HIDDEN', 'ARCHIVED'],
    description: 'Trạng thái mới của sản phẩm',
  })
  @IsNotEmpty()
  @IsEnum(['ACTIVE', 'HIDDEN', 'ARCHIVED'])
  status: 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
}

export class AdminOrderQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: 'Lọc theo trạng thái đơn hàng' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminReviewQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: 'Lọc theo số sao đánh giá (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class AdminVoucherQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: 'Lọc theo phạm vi (GLOBAL / SHOP)' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động' })
  @IsOptional()
  isActive?: boolean;
}

export class CreatePlatformVoucherDto {
  @ApiProperty({ example: 'SALE50K', description: 'Mã voucher' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  code: string;

  @ApiProperty({ example: 'Giảm 50.000đ đơn từ 200k', description: 'Tên voucher' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'],
    default: 'FIXED_AMOUNT',
  })
  @IsNotEmpty()
  @IsEnum(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'])
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';

  @ApiProperty({ example: 50000, description: 'Giá trị giảm' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 100000, description: 'Giảm tối đa (áp dụng cho %) ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: 200000, default: 0, description: 'Giá trị đơn tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minOrderValue?: number = 0;

  @ApiPropertyOptional({ default: 1000, description: 'Tổng số lượt sử dụng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number = 1000;

  @ApiPropertyOptional({ default: 1, description: 'Lượt sử dụng trên mỗi user' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usagePerUser?: number = 1;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Thời gian bắt đầu' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Thời gian kết thúc' })
  @IsNotEmpty()
  endDate: string;
}

export class UpdateVoucherStatusDto {
  @ApiProperty({ description: 'Kích hoạt hoặc tạm ngưng voucher' })
  @IsNotEmpty()
  isActive: boolean;
}

