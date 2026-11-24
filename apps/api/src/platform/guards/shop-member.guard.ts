import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.userId) {
      throw new ForbiddenException('Chưa xác thực người dùng.');
    }

    const shopIdParam = request.params.shopId;
    if (!shopIdParam) {
      return true;
    }

    const member = await this.prisma.shopMember.findFirst({
      where: {
        user: { publicId: user.userId },
        shop: { publicId: shopIdParam },
      },
      include: {
        shop: true,
      },
    });

    if (!member) {
      // 404 to avoid leaking existence (Section E1)
      throw new NotFoundException('Cửa hàng không tồn tại hoặc bạn không có quyền truy cập.');
    }

    if (member.shop.status === 'SUSPENDED') {
      throw new ForbiddenException('Cửa hàng này hiện đang bị tạm khóa.');
    }

    // Attach verified shop internal ID to request for downstream queries
    request.currentShop = member.shop;
    return true;
  }
}
