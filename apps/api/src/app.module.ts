import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RateLimitGuard } from './platform/guards/rate-limit.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './platform/prisma/prisma.module';
import { RedisModule } from './platform/redis';
import { MailModule } from './platform/mail';
import { IdentityModule } from './modules/identity';
import { ShopsModule } from './modules/shops';
import { CatalogModule } from './modules/catalog';
import { InventoryModule } from './modules/inventory';
import { CartModule } from './modules/cart';
import { OrderingModule } from './modules/ordering';
import { PaymentsModule } from './modules/payments';
import { NotificationsModule } from './modules/notifications';
import { WishlistModule } from './modules/wishlist';
import { VouchersModule } from './modules/vouchers';
import { ReviewsModule } from './modules/reviews';
import { SellerModule } from './interface/seller/seller.module';
import { AdminModule } from './interface/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    MailModule,
    // Domain Modules (Core v1)
    IdentityModule,
    ShopsModule,
    CatalogModule,
    InventoryModule,
    CartModule,
    OrderingModule,
    PaymentsModule,
    NotificationsModule,
    WishlistModule,
    VouchersModule,
    ReviewsModule,
    // Interface Modules (Controllers calling facades)
    SellerModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
