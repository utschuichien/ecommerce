import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSellerShopDto {
  @ApiPropertyOptional({ description: 'Tên cửa hàng', example: 'CommerceOS Store' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ description: 'Đường dẫn định danh (Slug)', example: 'commerceos-store' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({ description: 'Mô tả hoặc giới thiệu cửa hàng' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Ngành hàng kinh doanh chính', example: 'Điện tử - Công nghệ' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ của cửa hàng' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ kho / cửa hàng' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'URL hoặc key logo cửa hàng' })
  @IsOptional()
  @IsString()
  logoKey?: string;

  @ApiPropertyOptional({ description: 'URL hoặc key banner / ảnh bìa cửa hàng' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Khẩu hiệu thương hiệu của cửa hàng', example: 'Công nghệ kiến tạo tương lai' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slogan?: string;

  @ApiPropertyOptional({ description: 'Câu chuyện thương hiệu / Giới thiệu chi tiết' })
  @IsOptional()
  @IsString()
  brandStory?: string;

  @ApiPropertyOptional({ description: 'Phí vận chuyển cố định', example: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  flatShippingFee?: number;

  @ApiPropertyOptional({ description: 'Bật chính sách miễn phí vận chuyển khi đạt giá trị đơn tối thiểu' })
  @IsOptional()
  @IsBoolean()
  enableFreeShipping?: boolean;

  @ApiPropertyOptional({ description: 'Giá trị đơn hàng tối thiểu để được freeship', example: 300000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ description: 'Họ tên người phụ trách lấy hàng / kho', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pickupContactName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại kho lấy hàng', example: '0987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  pickupPhone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ kho lấy hàng', example: 'Kho số 5, 123 Nguyễn Văn Cừ, Long Biên, Hà Nội' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pickupAddress?: string;

  @ApiPropertyOptional({ description: 'Ghi chú cho shipper khi lấy hàng' })
  @IsOptional()
  @IsString()
  pickupNote?: string;

  @ApiPropertyOptional({ description: 'Danh sách đơn vị vận chuyển hỗ trợ dạng JSON', example: '{"ghn":true,"ghtk":true}' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  supportedCarriers?: string;

  @ApiPropertyOptional({ description: 'Cho phép người mua đồng kiểm khi nhận hàng' })
  @IsOptional()
  @IsBoolean()
  allowInspection?: boolean;

  @ApiPropertyOptional({ description: 'Cam kết thời gian chuẩn bị và gửi hàng', example: '24h' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  dispatchTime?: string;

  @ApiPropertyOptional({ description: 'Cho phép khách đặt hàng khi mở cửa' })
  @IsOptional()
  @IsBoolean()
  allowOrders?: boolean;

  @ApiPropertyOptional({ description: 'Hiển thị sản phẩm khi hết hàng' })
  @IsOptional()
  @IsBoolean()
  showOutOfStock?: boolean;

  @ApiPropertyOptional({ description: 'Bắt buộc đăng nhập khi mua hàng' })
  @IsOptional()
  @IsBoolean()
  requireAuthCheckout?: boolean;

  @ApiPropertyOptional({ description: 'Loại giờ hoạt động: always hoặc custom', example: 'always' })
  @IsOptional()
  @IsIn(['always', 'custom'])
  operatingType?: 'always' | 'custom';

  @ApiPropertyOptional({ description: 'Giờ mở cửa (nếu chọn custom)', example: '08:00' })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({ description: 'Giờ đóng cửa (nếu chọn custom)', example: '22:00' })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiPropertyOptional({ description: 'Link Facebook' })
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional({ description: 'Link Youtube' })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiPropertyOptional({ description: 'Link TikTok' })
  @IsOptional()
  @IsString()
  tiktokUrl?: string;

  @ApiPropertyOptional({ description: 'Link X / Twitter' })
  @IsOptional()
  @IsString()
  xUrl?: string;

  // ------------------------------------------------------------------
  // Chính sách bán hàng & cam kết (Shop Policies)
  // ------------------------------------------------------------------
  @ApiPropertyOptional({ description: 'Bật/tắt chế độ tạm nghỉ bán / nghỉ lễ' })
  @IsOptional()
  @IsBoolean()
  holidayMode?: boolean;

  @ApiPropertyOptional({ description: 'Thông điệp tạm nghỉ gửi người mua', example: 'Shop tạm nghỉ Tết từ 28/01 đến 05/02...' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  holidayMessage?: string;

  @ApiPropertyOptional({ description: 'Bật/tắt cho phép đổi trả hàng' })
  @IsOptional()
  @IsBoolean()
  enableReturn?: boolean;

  @ApiPropertyOptional({ description: 'Thời hạn đổi trả (ngày)', example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  returnPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Yêu cầu video unbox kiện hàng' })
  @IsOptional()
  @IsBoolean()
  requireUnboxVideo?: boolean;

  @ApiPropertyOptional({ description: 'Ghi chú điều kiện đổi trả chi tiết' })
  @IsOptional()
  @IsString()
  returnPolicyNote?: string;

  @ApiPropertyOptional({ description: 'Loại hình bảo hành: none, shop, manufacturer, electronic', example: 'shop' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  warrantyType?: string;

  @ApiPropertyOptional({ description: 'Thời hạn bảo hành (tháng)', example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyPeriodMonths?: number;

  @ApiPropertyOptional({ description: 'Ghi chú quy trình và địa chỉ gửi bảo hành' })
  @IsOptional()
  @IsString()
  warrantyPolicyNote?: string;
}

export class UpdateShopStatusDto {
  
  @ApiPropertyOptional({ description: 'Trạng thái hoạt động của shop', enum: ['ACTIVE', 'CLOSED', 'PENDING'] })
  @IsString()
  @IsIn(['ACTIVE', 'CLOSED', 'PENDING'])
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
}
