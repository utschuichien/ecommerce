import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Xử lý kết nối WebSocket: Xác thực JWT từ Handshake và đưa socket vào Room user:{userId}
   * Không cho client tự ý join room để đảm bảo an toàn tuyệt đối.
   */
  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(`[Socket ${socket.id}] Kết nối bị từ chối: Không có token xác thực`);
        socket.disconnect(true);
        return;
      }

      const secret =
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'commerce_os_access_secret_super_secure_key_2026';

      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (!payload || !payload.sub) {
        this.logger.warn(`[Socket ${socket.id}] Kết nối bị từ chối: Token không hợp lệ`);
        socket.disconnect(true);
        return;
      }

      const userPublicId = String(payload.sub);
      socket.data.user = {
        userId: userPublicId,
        email: payload.email,
        roles: payload.roles,
      };

      // Đưa socket vào room riêng của user (Hỗ trợ multi-tab: tất cả tab của user đều chung room này)
      const roomName = `user:${userPublicId}`;
      socket.join(roomName);

      this.logger.log(
        `[Socket ${socket.id}] Người dùng ${userPublicId} đã kết nối WebSocket (Room: ${roomName})`,
      );
    } catch (err: any) {
      this.logger.error(`[Socket ${socket.id}] Lỗi xác thực handshake: ${err.message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data?.user;
    if (user?.userId) {
      this.logger.log(
        `[Socket ${socket.id}] Người dùng ${user.userId} đã ngắt kết nối WebSocket`,
      );
    }
  }

  /**
   * Phát event thời gian thực đến tất cả các tab đang mở của 1 người dùng cụ thể
   */
  emitToUser(userPublicId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn(`WebSocket server chưa sẵn sàng khi emit ${event} cho ${userPublicId}`);
      return;
    }

    const roomName = `user:${userPublicId}`;
    this.server.to(roomName).emit(event, data);
    this.logger.debug(`[WS Emitted] Event "${event}" -> ${roomName}`);
  }
}

