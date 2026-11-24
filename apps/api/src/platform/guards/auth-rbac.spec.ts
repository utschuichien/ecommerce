import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ShopMemberGuard } from './shop-member.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IdentityService } from '../../modules/identity/identity.service';
import * as bcrypt from 'bcrypt';

describe('Module Bảo Mật & Phân Quyền (Auth, RBAC & Shop Isolation - P4)', () => {
  // =========================================================================
  // 1. [IT] Kiểm tra tài khoản bị khóa (SUSPENDED User Protection)
  // =========================================================================
  describe('1. [IT] Tài khoản bị khóa (SUSPENDED User)', () => {
    let identityService: IdentityService;
    let prisma: any;
    let jwtService: any;
    let configService: any;
    let mailQueueService: any;

    beforeEach(() => {
      prisma = {
        user: {
          findFirst: jest.fn(),
          findUnique: jest.fn(),
        },
        refreshToken: {
          findUnique: jest.fn(),
        },
      };

      jwtService = {
        sign: jest.fn().mockReturnValue('mock_access_token'),
      };

      configService = {
        get: jest.fn(),
      };

      mailQueueService = {
        enqueueSendWelcome: jest.fn().mockResolvedValue({}),
      };

      identityService = new IdentityService(
        prisma,
        jwtService,
        configService,
        {} as any, // cloudinaryService
        {} as any, // redisService
        mailQueueService,
      );
    });

    it('Chặn đăng nhập ngay lập tức nếu tài khoản đang bị SUSPENDED', async () => {
      // Giả lập tài khoản người dùng đã bị Admin khóa
      const suspendedUser = {
        id: BigInt(1),
        publicId: 'usr_suspended_1',
        email: 'baduser@example.com',
        status: 'SUSPENDED', // Bị khóa
        passwordHash: await bcrypt.hash('Secret123!', 10),
        roles: [{ role: 'CUSTOMER' }],
      };

      prisma.user.findUnique.mockResolvedValue(suspendedUser);

      await expect(
        identityService.login({
          email: 'baduser@example.com',
          password: 'Secret123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        identityService.login({
          email: 'baduser@example.com',
          password: 'Secret123!',
        }),
      ).rejects.toThrow('Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.');
    });

    it('Chặn cấp mới Access Token khi Refresh Token của tài khoản bị SUSPENDED', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: BigInt(10),
        tokenHash: 'hashed_token',
        familyId: 'family_1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: BigInt(1),
          publicId: 'usr_suspended_1',
          email: 'baduser@example.com',
          status: 'SUSPENDED', // Tài khoản đã bị khóa sau khi có refresh token
          roles: [{ role: 'CUSTOMER' }],
        },
      });

      // decode verify familyId
      jwtService.verify = jest.fn().mockReturnValue({ familyId: 'family_1' });

      await expect(
        identityService.refresh('raw_valid_refresh_token'),
      ).rejects.toThrow('Tài khoản của bạn đã bị vô hiệu hóa.');
    });

    it('Cho phép đăng nhập thành công nếu tài khoản đang ở trạng thái ACTIVE', async () => {
      const activePassword = 'Password123!';
      const activeUser = {
        id: BigInt(2),
        publicId: 'usr_active_2',
        email: 'gooduser@example.com',
        fullName: 'Good User',
        phone: '0909090909',
        status: 'ACTIVE',
        passwordHash: await bcrypt.hash(activePassword, 10),
        roles: [{ role: 'CUSTOMER' }],
        shopMembers: [],
      };

      prisma.user.findUnique.mockResolvedValue(activeUser);
      prisma.refreshToken.create = jest.fn().mockResolvedValue({
        id: BigInt(99),
        tokenHash: 'token_hash',
      });

      const loginResult = await identityService.login({
        email: 'gooduser@example.com',
        password: activePassword,
      });

      expect(loginResult).toBeDefined();
      expect(loginResult.tokens.accessToken).toBe('mock_access_token');
      expect(loginResult.user.email).toBe('gooduser@example.com');
    });
  });

  // =========================================================================
  // 2. [IT] Phân quyền người dùng theo vai trò (RolesGuard - RBAC)
  // =========================================================================
  describe('2. [IT] Phân quyền người dùng theo vai trò (RolesGuard - RBAC)', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      rolesGuard = new RolesGuard(reflector);
    });

    const createMockContext = (userPayload: any) => {
      return {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ user: userPayload }),
        }),
      } as any;
    };

    it('Cho phép truy cập khi tài khoản có đúng vai trò yêu cầu (ADMIN)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const context = createMockContext({
        userId: 'usr_admin',
        roles: ['ADMIN'],
      });

      const canActivate = rolesGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('Chặn truy cập (403 Forbidden) khi tài khoản chỉ là CUSTOMER gọi API của ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const context = createMockContext({
        userId: 'usr_customer',
        roles: ['CUSTOMER'],
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => rolesGuard.canActivate(context)).toThrow(
        'Bạn không có quyền thực hiện thao tác này.',
      );
    });

    it('Cho phép truy cập khi tài khoản thỏa mãn 1 trong các vai trò yêu cầu (SELLER trong [SELLER, ADMIN])', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SELLER', 'ADMIN']);

      const context = createMockContext({
        userId: 'usr_seller',
        roles: ['SELLER'],
      });

      const canActivate = rolesGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('Cho phép truy cập tự do khi Endpoint không gắn yêu cầu vai trò (No @Roles)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const context = createMockContext({
        userId: 'usr_guest',
        roles: [],
      });

      const canActivate = rolesGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  });

  // =========================================================================
  // 3. [IT] Bảo vệ dữ liệu gian hàng chéo (ShopMemberGuard - Cross-Shop Isolation)
  // =========================================================================
  describe('3. [IT] Bảo vệ dữ liệu gian hàng chéo (ShopMemberGuard)', () => {
    let shopMemberGuard: ShopMemberGuard;
    let prisma: any;

    beforeEach(() => {
      prisma = {
        shopMember: {
          findFirst: jest.fn(),
        },
      };
      shopMemberGuard = new ShopMemberGuard(prisma);
    });

    const createMockShopContext = (userId: string, shopIdParam?: string) => {
      const req: any = {
        user: { userId },
        params: { shopId: shopIdParam },
      };
      return {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
        _req: req,
      };
    };

    it('Chặn truy cập (404 Not Found) khi Seller của Shop A cố tình truy cập Shop B (Chống lộ ID gian hàng)', async () => {
      // User là chủ Shop A, nhưng truyền param shopId của Shop B
      prisma.shopMember.findFirst.mockResolvedValue(null);

      const mockCtx = createMockShopContext('usr_seller_A', 'shp_shop_B');

      await expect(shopMemberGuard.canActivate(mockCtx as any)).rejects.toThrow(
        NotFoundException,
      );

      await expect(shopMemberGuard.canActivate(mockCtx as any)).rejects.toThrow(
        'Cửa hàng không tồn tại hoặc bạn không có quyền truy cập.',
      );
    });

    it('Cho phép truy cập thành công và đính kèm currentShop khi Seller truy cập đúng gian hàng của mình', async () => {
      const verifiedShop = {
        id: BigInt(55),
        publicId: 'shp_shop_A',
        name: 'Shop Của Tôi',
        status: 'ACTIVE',
      };

      prisma.shopMember.findFirst.mockResolvedValue({
        id: BigInt(1),
        role: 'OWNER',
        shop: verifiedShop,
      });

      const mockCtx = createMockShopContext('usr_seller_A', 'shp_shop_A');

      const canActivate = await shopMemberGuard.canActivate(mockCtx as any);

      expect(canActivate).toBe(true);
      // Đảm bảo thông tin shop được gắn vào request để downstream controller sử dụng an toàn
      expect(mockCtx._req.currentShop).toEqual(verifiedShop);
    });

    it('Chặn truy cập (403 Forbidden) nếu gian hàng của Seller đang bị Admin khóa (SUSPENDED)', async () => {
      const suspendedShop = {
        id: BigInt(55),
        publicId: 'shp_suspended',
        name: 'Shop Vi Phạm',
        status: 'SUSPENDED',
      };

      prisma.shopMember.findFirst.mockResolvedValue({
        id: BigInt(1),
        role: 'OWNER',
        shop: suspendedShop,
      });

      const mockCtx = createMockShopContext('usr_seller_A', 'shp_suspended');

      await expect(shopMemberGuard.canActivate(mockCtx as any)).rejects.toThrow(
        ForbiddenException,
      );

      await expect(shopMemberGuard.canActivate(mockCtx as any)).rejects.toThrow(
        'Cửa hàng này hiện đang bị tạm khóa.',
      );
    });
  });

  // =========================================================================
  // 4. [IT] Xác thực Token người dùng (JwtAuthGuard)
  // =========================================================================
  describe('4. [IT] Xác thực người dùng (JwtAuthGuard)', () => {
    let jwtGuard: JwtAuthGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      jwtGuard = new JwtAuthGuard(reflector);
    });

    it('Cho phép đi qua khi route được gắn metadata @Public()', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = jwtGuard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('Báo lỗi UnauthorizedException khi không tìm thấy thông tin người dùng trong phiên (Chưa đăng nhập)', () => {
      expect(() => {
        jwtGuard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);

      expect(() => {
        jwtGuard.handleRequest(null, null, null);
      }).toThrow('Bạn cần đăng nhập để thực hiện thao tác này.');
    });

    it('Trả về user payload an toàn khi Token hợp lệ', () => {
      const validUser = {
        userId: 'usr_valid_123',
        email: 'user@commerce.vn',
        roles: ['CUSTOMER'],
      };

      const result = jwtGuard.handleRequest(null, validUser, null);
      expect(result).toEqual(validUser);
    });
  });
});
