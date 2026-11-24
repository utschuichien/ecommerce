import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ulid } from 'ulid';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { RedisService } from '../../platform/redis/redis.service';
import { MailQueueService } from '../../platform/mail/mail.queue';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto';
import {
  hashToken,
  formatUserResponse,
  UserResponse,
} from './helpers';

import { CloudinaryService } from '../../platform/cloudinary/cloudinary.service';

export interface TokenMetadata {
  userAgent?: string;
  ip?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export { UserResponse };

@Injectable()
export class IdentityService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisService: RedisService,
    private readonly mailQueueService: MailQueueService,
  ) {
    this.accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'commerce_os_access_secret_super_secure_key_2026';
    this.refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'commerce_os_refresh_secret_super_secure_key_2026';
  }

  async register(
    dto: RegisterDto,
    meta?: TokenMetadata,
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const publicId = ulid();

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          publicId,
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim() || null,
          status: 'ACTIVE',
          roles: {
            create: {
              role: 'CUSTOMER',
            },
          },
        },
        include: {
          roles: true,
        },
      });

      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    const tokens = await this.generateTokens(
      createdUser.id,
      createdUser.publicId,
      createdUser.email,
      createdUser.roles.map((r) => r.role),
      meta,
    );

    return {
      user: formatUserResponse(createdUser),
      tokens,
    };
  }

  async login(
    dto: LoginDto,
    meta?: TokenMetadata,
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        shopMembers: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.publicId,
      user.email,
      user.roles.map((r) => r.role),
      meta,
    );

    return {
      user: formatUserResponse(user),
      tokens,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta?: TokenMetadata,
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc không tìm thấy token.');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(rawRefreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: true,
            shopMembers: {
              include: {
                shop: true,
              },
            },
          },
        },
      },
    });

    if (!existingToken) {
      if (decoded.familyId) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: decoded.familyId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }

    if (existingToken.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existingToken.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Phát hiện hành vi truy cập bất thường. Toàn bộ phiên đăng nhập đã bị vô hiệu hóa để bảo vệ tài khoản.',
      );
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    if (existingToken.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa.');
    }

    const newAccessToken = this.jwtService.sign(
      {
        sub: existingToken.user.publicId,
        email: existingToken.user.email,
        roles: existingToken.user.roles.map((r) => r.role),
      },
      {
        secret: this.accessSecret,
        expiresIn: '15m',
      },
    );

    const newRefreshToken = this.jwtService.sign(
      {
        sub: existingToken.user.publicId,
        familyId: existingToken.familyId,
      },
      {
        secret: this.refreshSecret,
        expiresIn: '7d',
      },
    );

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      const createdRecord = await tx.refreshToken.create({
        data: {
          userId: existingToken.userId,
          familyId: existingToken.familyId,
          tokenHash: newTokenHash,
          expiresAt,
          userAgent: meta?.userAgent || existingToken.userAgent,
          ip: meta?.ip || existingToken.ip,
        },
      });

      await tx.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          revokedAt: new Date(),
          replacedById: createdRecord.id,
        },
      });
    });

    return {
      user: formatUserResponse(existingToken.user),
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  async logout(rawRefreshToken?: string): Promise<{ success: boolean }> {
    if (!rawRefreshToken) {
      return { success: true };
    }

    try {
      const tokenHash = hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Bỏ qua lỗi nếu token không tồn tại để đảm bảo idempotent logout
    }

    return { success: true };
  }

  async getMe(publicId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
      include: {
        roles: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
        shopMembers: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin tài khoản.');
    }

    return formatUserResponse(user);
  }

  async updateProfile(
    publicId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản cần cập nhật.');
    }

    const dataToUpdate: any = {};
    if (dto.fullName) dataToUpdate.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone?.trim() || null;

    const updated = await this.prisma.user.update({
      where: { publicId },
      data: dataToUpdate,
      include: {
        roles: true,
        shopMembers: {
          include: {
            shop: true,
          },
        },
      },
    });

    return formatUserResponse(updated);
  }

  async uploadAvatar(publicId: string, file: Express.Multer.File): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const avatarUrl = await this.cloudinaryService.uploadAvatar(file, publicId);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
      include: {
        roles: true,
        shopMembers: {
          include: {
            shop: true,
          },
        },
      },
    });

    return formatUserResponse(updated);
  }

  async changePassword(
    publicId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { publicId },
        data: { passwordHash: newHash },
      });

      await tx.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async getUserAddresses(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const addresses = await this.prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((addr) => ({
      id: addr.id.toString(),
      recipientName: addr.recipientName,
      phone: addr.phone,
      line1: addr.line1,
      ward: addr.ward,
      district: addr.district,
      province: addr.province,
      address: `${addr.line1}, ${addr.ward}, ${addr.district}, ${addr.province}`,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
    }));
  }

  async createAddress(publicId: string, dto: CreateAddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const existingCount = await this.prisma.address.count({
      where: { userId: user.id },
    });

    // Nếu đây là địa chỉ đầu tiên, mặc định luôn là isDefault = true
    const shouldBeDefault = existingCount === 0 ? true : Boolean(dto.isDefault);

    const address = await this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: user.id,
          recipientName: dto.recipientName.trim(),
          phone: dto.phone.trim(),
          line1: dto.line1.trim(),
          ward: dto.ward.trim(),
          district: dto.district.trim(),
          province: dto.province.trim(),
          isDefault: shouldBeDefault,
        },
      });
    });

    return {
      id: address.id.toString(),
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      province: address.province,
      address: `${address.line1}, ${address.ward}, ${address.district}, ${address.province}`,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    };
  }

  async setDefaultAddress(publicId: string, addressId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const targetAddress = await this.prisma.address.findFirst({
      where: { id: BigInt(addressId), userId: user.id },
    });

    if (!targetAddress) {
      throw new NotFoundException('Không tìm thấy địa chỉ cần cập nhật.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: targetAddress.id },
        data: { isDefault: true },
      });
    });

    return { message: 'Thiết lập địa chỉ mặc định thành công.' };
  }

  async deleteAddress(publicId: string, addressId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const targetAddress = await this.prisma.address.findFirst({
      where: { id: BigInt(addressId), userId: user.id },
    });

    if (!targetAddress) {
      throw new NotFoundException('Không tìm thấy địa chỉ cần xóa.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: targetAddress.id },
      });

      // Nếu xóa địa chỉ mặc định mà vẫn còn địa chỉ khác, lấy địa chỉ mới nhất làm mặc định
      if (targetAddress.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { message: 'Đã xóa địa chỉ thành công.' };
  }

  async getAddressById(publicId: string, addressId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: BigInt(addressId), userId: user.id },
    });

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ.');
    }

    return {
      id: address.id.toString(),
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      province: address.province,
      address: `${address.line1}, ${address.ward}, ${address.district}, ${address.province}`,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  async updateAddress(publicId: string, addressId: string, dto: UpdateAddressDto) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const targetAddress = await this.prisma.address.findFirst({
      where: { id: BigInt(addressId), userId: user.id },
    });

    if (!targetAddress) {
      throw new NotFoundException('Không tìm thấy địa chỉ cần cập nhật.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: targetAddress.id },
        data: {
          recipientName: dto.recipientName !== undefined ? dto.recipientName.trim() : undefined,
          phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
          line1: dto.line1 !== undefined ? dto.line1.trim() : undefined,
          ward: dto.ward !== undefined ? dto.ward.trim() : undefined,
          district: dto.district !== undefined ? dto.district.trim() : undefined,
          province: dto.province !== undefined ? dto.province.trim() : undefined,
          isDefault: dto.isDefault !== undefined ? dto.isDefault : undefined,
        },
      });
    });

    return {
      id: updated.id.toString(),
      recipientName: updated.recipientName,
      phone: updated.phone,
      line1: updated.line1,
      ward: updated.ward,
      district: updated.district,
      province: updated.province,
      address: `${updated.line1}, ${updated.ward}, ${updated.district}, ${updated.province}`,
      isDefault: updated.isDefault,
      updatedAt: updated.updatedAt,
    };
  }

  async getProfileSummary(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
      include: {
        roles: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
        orders: {
          orderBy: { placedAt: 'desc' },
          take: 5,
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    // Thống kê đơn hàng và yêu thích
    const [totalOrders, completedOrders, pendingOrders, wishlistCount] = await Promise.all([
      this.prisma.order.count({ where: { userId: user.id } }),
      this.prisma.order.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        select: { grandTotal: true },
      }),
      this.prisma.order.count({
        where: {
          userId: user.id,
          status: { in: ['PENDING_PAYMENT'] },
        },
      }),
      (this.prisma as any).wishlistItem
        ? (this.prisma as any).wishlistItem.count({ where: { userId: user.id } })
        : 0,
    ]);

    const totalSpent = completedOrders.reduce(
      (acc, ord) => acc + Number(ord.grandTotal),
      0,
    );

    let membershipTier = 'Thành viên mới';
    if (totalSpent >= 50000000) {
      membershipTier = 'Kim Cương';
    } else if (totalSpent >= 20000000) {
      membershipTier = 'Vàng';
    } else if (totalSpent >= 5000000) {
      membershipTier = 'Bạc';
    } else if (totalOrders > 0) {
      membershipTier = 'Thành viên Đồng';
    }

    const joinDateMonth = user.createdAt.getMonth() + 1;
    const joinDateYear = user.createdAt.getFullYear();
    const joinDate = `${joinDateMonth.toString().padStart(2, '0')}/${joinDateYear}`;

    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0] || null;

    return {
      user: {
        ...formatUserResponse(user),
        membershipTier,
        joinDate,
        totalSpent,
      },
      stats: {
        ordersCount: totalOrders,
        pendingOrdersCount: pendingOrders,
        completedOrdersCount: completedOrders.length,
        wishlistCount: Number(wishlistCount || 0),
        addressesCount: user.addresses.length,
        membershipTier,
        totalSpent,
      },
      defaultAddress: defaultAddr
        ? {
            id: defaultAddr.id.toString(),
            recipientName: defaultAddr.recipientName,
            phone: defaultAddr.phone,
            line1: defaultAddr.line1,
            ward: defaultAddr.ward,
            district: defaultAddr.district,
            province: defaultAddr.province,
            address: `${defaultAddr.line1}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`,
            isDefault: defaultAddr.isDefault,
          }
        : null,
      recentOrders: user.orders.map((ord) => {
        const firstItem = ord.orderItems[0];
        return {
          id: ord.publicId,
          orderNumber: ord.orderNumber,
          date: new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(ord.placedAt),
          status: ord.status === 'COMPLETED' ? 'delivered' : ord.status === 'CANCELLED' ? 'cancelled' : 'pending',
          statusLabel:
            ord.status === 'COMPLETED'
              ? 'Đã giao'
              : ord.status === 'CANCELLED'
              ? 'Đã hủy'
              : 'Đang xử lý',
          totalAmount: Number(ord.grandTotal),
          image: firstItem?.imageKey || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
          productName: firstItem ? (ord.orderItems.length > 1 ? `${firstItem.productName} (+${ord.orderItems.length - 1} sp)` : firstItem.productName) : 'Đơn hàng',
          itemsCount: ord.orderItems.reduce((acc, it) => acc + it.quantity, 0),
        };
      }),
    };
  }

  async getActiveSessions(publicId: string, currentRefreshToken?: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((sess) => {
      const isCurrent = currentHash ? sess.tokenHash === currentHash : false;
      const ua = sess.userAgent || '';
      let deviceName = 'Thiết bị không xác định';
      let browser = 'Trình duyệt web';

      if (ua.includes('Windows')) deviceName = 'Máy tính Windows';
      else if (ua.includes('Macintosh')) deviceName = 'Mac / macOS';
      else if (ua.includes('iPhone')) deviceName = 'iPhone (iOS)';
      else if (ua.includes('Android')) deviceName = 'Thiết bị Android';
      else if (ua.includes('Linux')) deviceName = 'Thiết bị Linux';

      if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Google Chrome';
      else if (ua.includes('Edg')) browser = 'Microsoft Edge';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
      else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';

      return {
        id: sess.id.toString(),
        deviceName,
        browser,
        ip: sess.ip || '127.0.0.1',
        lastActive: sess.createdAt,
        isCurrent,
      };
    });
  }

  async revokeSession(publicId: string, sessionId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const target = await this.prisma.refreshToken.findFirst({
      where: { id: BigInt(sessionId), userId: user.id },
    });

    if (!target) {
      throw new NotFoundException('Không tìm thấy phiên đăng nhập.');
    }

    await this.prisma.refreshToken.update({
      where: { id: target.id },
      data: { revokedAt: new Date() },
    });

    return { message: 'Đã thu hồi phiên đăng nhập thành công.' };
  }

  async revokeAllOtherSessions(publicId: string, currentRefreshToken?: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    await this.prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
        NOT: currentHash ? { tokenHash: currentHash } : undefined,
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'Đã đăng xuất khỏi tất cả các thiết bị khác.' };
  }

  private async generateTokens(
    userId: bigint,
    publicId: string,
    email: string,
    roles: string[],
    meta?: TokenMetadata,
  ): Promise<AuthTokens> {
    const familyId = ulid();

    const accessToken = this.jwtService.sign(
      {
        sub: publicId,
        email,
        roles,
      },
      {
        secret: this.accessSecret,
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: publicId,
        familyId,
      },
      {
        secret: this.refreshSecret,
        expiresIn: '7d',
      },
    );

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash,
        expiresAt,
        userAgent: meta?.userAgent || null,
        ip: meta?.ip || null,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // --- Password Reset & OTP Service Methods ---

  private hashOtp(otp: string): string {
    const secret =
      this.configService.get<string>('OTP_SECRET') ||
      'commerce_os_otp_hmac_super_secure_secret_2026';
    return crypto.createHmac('sha256', secret).update(otp.trim()).digest('hex');
  }

  /**
   * Request OTP for password reset
   * - Checks user existence
   * - Enforces 60s cooldown between requests
   * - Enforces 5 requests / hour rate limit
   * - Generates 6-digit OTP, hashes it with HMAC-SHA256, and stores in Redis (5 min TTL)
   * - Pushes sending job to BullMQ queue
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds: number;
  }> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản liên kết với địa chỉ email này.');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa hoặc không hoạt động.');
    }

    // Check Cooldown (60 seconds)
    const cooldownKey = `otp:cooldown:${email}`;
    const cooldownTtl = await this.redisService.ttl(cooldownKey);
    if (cooldownTtl > 0) {
      throw new HttpException(
        `Vui lòng chờ ${cooldownTtl} giây trước khi yêu cầu mã xác thực mới.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check Rate Limit (max 5 requests per hour)
    const limitKey = `otp:limit:${email}`;
    const requestCount = await this.redisService.incr(limitKey, 3600);
    if (requestCount > 5) {
      throw new HttpException(
        'Bạn đã yêu cầu gửi mã xác thực quá nhiều lần trong 1 giờ (tối đa 5 lần). Vui lòng thử lại sau.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate 6-digit random numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = this.hashOtp(rawOtp);

    // Store in Redis (TTL 5 minutes = 300s)
    const otpDataKey = `otp:data:${email}`;
    await this.redisService.hsetAll(
      otpDataKey,
      {
        hash: hashedOtp,
        attempts: '0',
        createdAt: String(Date.now()),
      },
      300,
    );

    // Set cooldown in Redis (60 seconds)
    await this.redisService.set(cooldownKey, '1', 60);

    // Enqueue sending email to BullMQ
    await this.mailQueueService.enqueueSendOtp({
      email,
      otp: rawOtp,
      ttlMinutes: 5,
      fullName: user.fullName || undefined,
    });

    return {
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến email của bạn.',
      cooldownSeconds: 60,
    };
  }

  /**
   * Verify submitted OTP
   * - Validates OTP against stored hash with timingSafeEqual
   * - Tracks failed attempts (max 5 attempts allowed)
   * - On success, generates a single-use resetToken (10 min TTL in Redis)
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<{
    success: boolean;
    resetToken: string;
    message: string;
  }> {
    const email = dto.email.trim().toLowerCase();
    const otpDataKey = `otp:data:${email}`;

    const otpData = await this.redisService.hgetall(otpDataKey);
    if (!otpData || !otpData.hash) {
      throw new BadRequestException(
        'Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu.',
      );
    }

    const currentAttempts = Number(otpData.attempts || 0);
    if (currentAttempts >= 5) {
      await this.redisService.del(otpDataKey);
      throw new BadRequestException(
        'Bạn đã nhập sai mã xác thực quá 5 lần. Mã OTP đã bị hủy để bảo vệ tài khoản, vui lòng yêu cầu mã mới.',
      );
    }

    const incomingHash = this.hashOtp(dto.otp);

    // Constant-time comparison to prevent timing attacks
    const incomingBuf = Buffer.from(incomingHash);
    const storedBuf = Buffer.from(otpData.hash);

    const isMatch =
      incomingBuf.length === storedBuf.length && crypto.timingSafeEqual(incomingBuf, storedBuf);

    if (!isMatch) {
      const updatedAttempts = await this.redisService.hincrby(otpDataKey, 'attempts', 1);
      const remaining = Math.max(0, 5 - updatedAttempts);

      if (remaining <= 0) {
        await this.redisService.del(otpDataKey);
        throw new BadRequestException(
          'Bạn đã nhập sai mã xác thực quá 5 lần. Mã OTP đã bị hủy, vui lòng yêu cầu mã mới.',
        );
      }

      throw new BadRequestException(
        `Mã xác thực OTP không chính xác. Bạn còn ${remaining} lần thử lại.`,
      );
    }

    // Success -> Cleanup OTP and generate resetToken
    await this.redisService.del(otpDataKey);
    await this.redisService.del(`otp:cooldown:${email}`);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenKey = `password_reset:${resetToken}`;

    // Store reset token with 10 minutes TTL (600 seconds)
    await this.redisService.set(resetTokenKey, email, 600);

    return {
      success: true,
      resetToken,
      message: 'Xác thực OTP thành công. Vui lòng thiết lập mật khẩu mới.',
    };
  }

  /**
   * Reset Password with valid resetToken
   * - Verifies resetToken in Redis
   * - Validates new password & confirm password
   * - Hashes new password and updates user in DB
   * - Revokes all active refresh tokens/sessions
   * - Deletes used resetToken
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{
    success: boolean;
    message: string;
  }> {
    const { resetToken, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp.');
    }

    const resetTokenKey = `password_reset:${resetToken}`;
    const email = await this.redisService.get(resetTokenKey);

    if (!email) {
      throw new BadRequestException(
        'Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thực hiện lại từ đầu.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng tương ứng.');
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsOld) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu gần nhất của bạn.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      // Revoke all existing sessions for security
      await tx.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    // Invalidate resetToken so it cannot be reused
    await this.redisService.del(resetTokenKey);

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.',
    };
  }
}
