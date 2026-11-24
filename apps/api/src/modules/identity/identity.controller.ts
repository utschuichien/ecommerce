import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IdentityService } from './identity.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto';
import { CurrentUser } from '../../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../platform/guards/jwt-auth.guard';
import { Public } from '../../platform/decorators/public.decorator';
import { RateLimit } from '../../platform/decorators/rate-limit.decorator';
import { setAuthCookies, clearAuthCookies } from './helpers';

@ApiTags('Auth & Users')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Public()
  @RateLimit({
    points: 3,
    duration: 60,
    message: 'Bạn đã đăng ký quá nhiều lần trong thời gian ngắn. Vui lòng đợi 1 phút trước khi tiếp tục.',
  })
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công, trả về thông tin user và access token' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại trong hệ thống' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
    };

    const result = await this.identityService.register(dto, meta);

    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Public()
  @RateLimit({
    points: 5,
    duration: 60,
    message: 'Bạn đã thử đăng nhập quá 5 lần. Vui lòng đợi 1 phút trước khi thử lại để bảo vệ tài khoản.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập với email và mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Sai tài khoản hoặc mật khẩu' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
    };

    const result = await this.identityService.login(dto, meta);

    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token thông qua Refresh Token' })
  @ApiResponse({ status: 200, description: 'Cấp token mới thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token || dto.refreshToken;

    const meta = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
    };

    const result = await this.identityService.refresh(rawRefreshToken, meta);

    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất tài khoản và vô hiệu hóa refresh token' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token || dto.refreshToken;

    await this.identityService.logout(rawRefreshToken);

    clearAuthCookies(res);

    return {
      success: true,
      message: 'Đăng xuất thành công.',
    };
  }

  @Public()
  @RateLimit({
    points: 2,
    duration: 60,
    message: 'Vui lòng chờ ít nhất 60 giây trước khi yêu cầu gửi mã xác thực mới.',
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu gửi mã OTP đặt lại mật khẩu qua email' })
  @ApiResponse({ status: 200, description: 'Đã gửi mã OTP qua email và trả về cooldown' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản với email này' })
  @ApiResponse({ status: 429, description: 'Vượt quá giới hạn gửi mã hoặc còn trong thời gian chờ cooldown' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.identityService.forgotPassword(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực mã OTP 6 chữ số để lấy resetToken đặt lại mật khẩu' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công, trả về resetToken có hiệu lực 10 phút' })
  @ApiResponse({ status: 400, description: 'Mã OTP sai hoặc đã hết hạn hoặc quá số lần thử' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.identityService.verifyOtp(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới với resetToken' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Reset token hết hạn/không hợp lệ hoặc mật khẩu mới không hợp lệ' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.identityService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token hết hạn' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.identityService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (họ tên, số điện thoại)' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.identityService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tải lên ảnh đại diện của người dùng' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.identityService.uploadAvatar(userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.identityService.changePassword(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('addresses')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ nhận hàng của người dùng' })
  async getAddresses(@CurrentUser('userId') userId: string) {
    return this.identityService.getUserAddresses(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addresses')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thêm địa chỉ nhận hàng mới' })
  async createAddress(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.identityService.createAddress(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('addresses/:id/default')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thiết lập địa chỉ nhận hàng mặc định' })
  async setDefaultAddress(
    @CurrentUser('userId') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.identityService.setDefaultAddress(userId, addressId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:id')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xóa địa chỉ nhận hàng' })
  async deleteAddress(
    @CurrentUser('userId') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.identityService.deleteAddress(userId, addressId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('addresses/:id')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một địa chỉ nhận hàng' })
  async getAddressById(
    @CurrentUser('userId') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.identityService.getAddressById(userId, addressId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('addresses/:id')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật thông tin địa chỉ nhận hàng' })
  async updateAddress(
    @CurrentUser('userId') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.identityService.updateAddress(userId, addressId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy tổng quan thông tin tài khoản, thống kê đơn hàng và xếp hạng thành viên' })
  async getProfileSummary(@CurrentUser('userId') userId: string) {
    return this.identityService.getProfileSummary(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lấy danh sách các phiên đăng nhập / thiết bị đang hoạt động' })
  async getActiveSessions(
    @CurrentUser('userId') userId: string,
    @Req() req: Request,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token;
    return this.identityService.getActiveSessions(userId, rawRefreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Đăng xuất khỏi một thiết bị / phiên đăng nhập cụ thể' })
  async revokeSession(
    @CurrentUser('userId') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.identityService.revokeSession(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Đăng xuất khỏi tất cả các thiết bị khác' })
  async revokeAllOtherSessions(
    @CurrentUser('userId') userId: string,
    @Req() req: Request,
  ) {
    const rawRefreshToken = req.cookies?.refresh_token;
    return this.identityService.revokeAllOtherSessions(userId, rawRefreshToken);
  }
}

