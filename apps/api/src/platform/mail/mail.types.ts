export const MAIL_QUEUE_NAME = 'commerce_mail_queue';

export const MAIL_JOBS = {
  SEND_OTP: 'send-otp',
  SEND_ORDER_CONFIRMATION: 'send-order-confirmation',
  SEND_ORDER_STATUS: 'send-order-status',
} as const;

export type MailJobType = (typeof MAIL_JOBS)[keyof typeof MAIL_JOBS];

export interface SendOtpMailPayload {
  email: string;
  otp: string;
  ttlMinutes: number;
  fullName?: string;
}

export interface OrderItemEmailPayload {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface SendOrderConfirmationMailPayload {
  email: string;
  recipientName: string;
  orderNumber: string;
  orderDate: string;
  shippingAddress: string;
  recipientPhone: string;
  paymentMethod: string;
  items: OrderItemEmailPayload[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  trackingUrl?: string;
}

export interface SendOrderStatusMailPayload {
  email: string;
  recipientName: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  trackingUrl?: string;
}

