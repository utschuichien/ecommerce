import { Prisma } from '@prisma/client';
import { OrderStatusFilter } from './dto/order-query.dto';

/**
 * Ánh xạ kiểu Record từ OrderStatusFilter sang Prisma.OrderWhereInput
 */
export const ORDER_STATUS_MAP: Record<
  OrderStatusFilter,
  Prisma.OrderWhereInput | null
> = {
  [OrderStatusFilter.ALL]: null,
  [OrderStatusFilter.PENDING]: {
    status: { in: ['PENDING_PAYMENT'] },
  },
  [OrderStatusFilter.SHIPPING]: {
    status: 'PAID',
    sellerOrders: {
      some: {
        status: { in: ['PROCESSING', 'SHIPPED'] },
      },
    },
  },
  [OrderStatusFilter.DELIVERED]: {
    status: 'COMPLETED',
  },
  [OrderStatusFilter.CANCELLED]: {
    status: { in: ['CANCELLED', 'EXPIRED'] },
  },
};

