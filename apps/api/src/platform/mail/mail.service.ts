import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  SendOtpMailPayload,
  SendOrderConfirmationMailPayload,
  SendOrderStatusMailPayload,
} from './mail.types';
import {
  renderOtpEmailTemplate,
  renderOrderConfirmationTemplate,
  renderOrderStatusTemplate,
} from './mail-template.util';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number>('SMTP_PORT', 587));
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.isConfigured = true;
      this.logger.log(`SMTP Mail Transporter initialized with host: ${host}:${port} (${user})`);

      // Verify connection asynchronously without blocking app startup
      this.transporter.verify((err) => {
        if (err) {
          this.logger.error(`SMTP Connection Verification Failed: ${err.message}`);
        } else {
          this.logger.log('SMTP Server connection verified successfully. Ready to send emails.');
        }
      });
    } else {
      this.isConfigured = false;
      this.logger.warn(
        'SMTP credentials not fully provided (SMTP_HOST, SMTP_USER, SMTP_PASS). MailService will operate in development log mode.',
      );
    }
  }

  /**
   * Trả về trạng thái cấu hình SMTP hiện tại
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      host: this.configService.get<string>('SMTP_HOST') || null,
      port: Number(this.configService.get<number>('SMTP_PORT', 587)),
      user: this.configService.get<string>('SMTP_USER')
        ? this.configService.get<string>('SMTP_USER')!.replace(/(.{3})(.*)(@.*)/, '$1***$3')
        : null,
      from:
        this.configService.get<string>('SMTP_FROM') || 'CommerceOS <no-reply@commerceos.vn>',
    };
  }

  /**
   * Gửi email OTP xác thực (Quên mật khẩu / Đặt lại mật khẩu)
   */
  async sendOtpEmail(payload: SendOtpMailPayload): Promise<boolean> {
    const { email, otp, ttlMinutes, fullName } = payload;
    const from =
      this.configService.get<string>('SMTP_FROM') || 'CommerceOS <no-reply@commerceos.vn>';
    const subject = `[CommerceOS] Mã xác thực OTP đặt lại mật khẩu: ${otp}`;
    const html = renderOtpEmailTemplate({ otp, ttlMinutes, fullName });

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(
        `\n======================================================\n` +
          `📧 [DEV MAIL TRANSPORTER] EMAIL SENT TO: ${email}\n` +
          `🔐 OTP CODE: ${otp} (Valid for ${ttlMinutes} minutes)\n` +
          `👤 Recipient: ${fullName || 'Guest'}\n` +
          `======================================================\n`,
      );
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Mã OTP đặt lại mật khẩu CommerceOS của bạn là: ${otp}. Mã có hiệu lực trong ${ttlMinutes} phút.`,
      });

      this.logger.log(`OTP Email successfully sent to ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send OTP email to ${email}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Gửi email xác nhận đặt hàng thành công (Order Confirmation)
   */
  async sendOrderConfirmationEmail(
    payload: SendOrderConfirmationMailPayload,
  ): Promise<boolean> {
    const { email, orderNumber, recipientName } = payload;
    const from =
      this.configService.get<string>('SMTP_FROM') || 'CommerceOS <no-reply@commerceos.vn>';
    const subject = `[CommerceOS] Xác nhận đơn hàng #${orderNumber} thành công`;
    const html = renderOrderConfirmationTemplate(payload);

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(
        `\n======================================================\n` +
          `📧 [DEV MAIL TRANSPORTER] ORDER CONFIRMATION SENT TO: ${email}\n` +
          `📦 Order Number: #${orderNumber}\n` +
          `👤 Recipient: ${recipientName}\n` +
          `💰 Grand Total: ${Number(payload.grandTotal).toLocaleString('vi-VN')}₫\n` +
          `📋 Total Items: ${payload.items.length}\n` +
          `======================================================\n`,
      );
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Cảm ơn ${recipientName}! Đơn hàng #${orderNumber} của bạn đã được tiếp nhận thành công với tổng thanh toán ${Number(payload.grandTotal).toLocaleString('vi-VN')}₫.`,
      });

      this.logger.log(
        `Order confirmation email sent to ${email} for order #${orderNumber}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (err: any) {
      this.logger.error(
        `Failed to send order confirmation email to ${email}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Gửi email thông báo cập nhật trạng thái đơn hàng (Order Status Update)
   */
  async sendOrderStatusEmail(payload: SendOrderStatusMailPayload): Promise<boolean> {
    const { email, orderNumber, statusLabel } = payload;
    const from =
      this.configService.get<string>('SMTP_FROM') || 'CommerceOS <no-reply@commerceos.vn>';
    const subject = `[CommerceOS] Đơn hàng #${orderNumber} - ${statusLabel}`;
    const html = renderOrderStatusTemplate(payload);

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(
        `\n======================================================\n` +
          `📧 [DEV MAIL TRANSPORTER] STATUS UPDATE SENT TO: ${email}\n` +
          `📦 Order Number: #${orderNumber}\n` +
          `🚚 New Status: ${statusLabel}\n` +
          `======================================================\n`,
      );
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject,
        html,
        text: `Đơn hàng #${orderNumber} của bạn đã cập nhật trạng thái: ${statusLabel}.`,
      });

      this.logger.log(
        `Order status email sent to ${email} for order #${orderNumber}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (err: any) {
      this.logger.error(
        `Failed to send order status email to ${email}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Gửi email kiểm tra kết nối SMTP (Test Email)
   */
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
    const from =
      this.configService.get<string>('SMTP_FROM') || 'CommerceOS <no-reply@commerceos.vn>';
    const subject = `[CommerceOS] Kiểm tra cấu hình hệ thống gửi mail SMTP`;
    const html = `
      <div style="font-family: sans-serif; padding: 24px; max-width: 500px; margin: 0 auto; border: 1px solid #10b981; border-radius: 12px; background: #f0fdf4;">
        <h2 style="color: #047857; margin-top: 0;">🎉 Cấu hình SMTP hoạt động thành công!</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
          Email này xác nhận hệ thống gửi mail của CommerceOS đã kết nối và gửi mail thành công từ địa chỉ:
          <br/><strong>${from}</strong>
        </p>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
          Thời gian gửi: ${new Date().toLocaleString('vi-VN')}
        </p>
      </div>
    `;

    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        message:
          'Chưa cấu hình SMTP_USER hoặc SMTP_PASS trong file .env. Hệ thống đang chạy ở chế độ dev log.',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html,
      });

      return {
        success: true,
        message: `Email kiểm tra đã được gửi thành công tới ${toEmail} (MessageId: ${info.messageId})`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Lỗi gửi mail: ${err.message}`,
      };
    }
  }
}
