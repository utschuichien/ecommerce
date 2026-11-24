export function renderOtpEmailTemplate(params: {
  otp: string;
  ttlMinutes: number;
  fullName?: string;
}): string {
  const { otp, ttlMinutes, fullName } = params;
  const displayName = fullName ? fullName.trim() : 'Quý khách';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mã xác thực OTP - CommerceOS</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .header-sub {
      font-size: 13px;
      color: #d1fae5;
      font-weight: 500;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #f0fdf4;
      border: 2px dashed #10b981;
      border-radius: 12px;
      padding: 20px 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #047857;
      margin-left: 10px;
      user-select: all;
    }
    .otp-expiry {
      font-size: 12px;
      color: #059669;
      font-weight: 600;
      margin-top: 8px;
    }
    .warning-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 6px;
      margin: 24px 0 16px;
    }
    .warning-title {
      font-size: 13px;
      font-weight: 700;
      color: #b45309;
      margin-bottom: 4px;
    }
    .warning-desc {
      font-size: 12px;
      line-height: 1.5;
      color: #92400e;
      margin: 0;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">🛒 CommerceOS</div>
        <div class="header-sub">Hệ thống thương mại điện tử hiện đại</div>
      </div>
      <div class="content">
        <div class="greeting">Xin chào ${displayName},</div>
        <div class="message">
          Bạn vừa yêu cầu mã xác thực để đặt lại mật khẩu cho tài khoản tại CommerceOS. Hãy sử dụng mã OTP dưới đây để hoàn tất việc xác thực:
        </div>

        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-expiry">Mã có hiệu lực trong ${ttlMinutes} phút</div>
        </div>

        <div class="warning-box">
          <div class="warning-title">⚠️ Lưu ý bảo mật quan trọng:</div>
          <p class="warning-desc">
            Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên tự xưng là đội ngũ hỗ trợ CommerceOS.
            Nếu bạn không gửi yêu cầu này, hãy đổi mật khẩu ngay lập tức để bảo vệ tài khoản của bạn.
          </p>
        </div>
      </div>
      <div class="footer">
        <div>Email này được gửi tự động từ hệ thống CommerceOS. Vui lòng không phản hồi email này.</div>
        <div style="margin-top: 6px;">© 2026 CommerceOS Inc. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function formatVND(amount: number): string {
  return Number(amount || 0).toLocaleString('vi-VN') + '₫';
}

export function renderOrderConfirmationTemplate(params: {
  recipientName: string;
  orderNumber: string;
  orderDate: string;
  shippingAddress: string;
  recipientPhone: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    variant?: string;
    quantity: number;
    price: number;
    subtotal: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  trackingUrl?: string;
}): string {
  const {
    recipientName,
    orderNumber,
    orderDate,
    shippingAddress,
    recipientPhone,
    paymentMethod,
    items,
    subtotal,
    shippingFee,
    discountAmount,
    grandTotal,
    trackingUrl,
  } = params;

  const itemRowsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
        ${
          item.image
            ? `<img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; margin-right: 12px; float: left;" />`
            : ''
        }
        <div style="margin-left: ${item.image ? '60px' : '0'};">
          <div style="font-weight: 600; font-size: 13px; color: #1e293b; line-height: 1.4;">${item.name}</div>
          ${
            item.variant
              ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Phân loại: ${item.variant}</div>`
              : ''
          }
          <div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 4px;">
            ${formatVND(item.price)} <span style="color: #94a3b8; font-weight: 400;">x ${item.quantity}</span>
          </div>
        </div>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: top; font-weight: 700; font-size: 13px; color: #0f172a; white-space: nowrap;">
        ${formatVND(item.subtotal)}
      </td>
    </tr>
  `,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác nhận đơn hàng #${orderNumber} - CommerceOS</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 12px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 28px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .header-sub {
      font-size: 13px;
      color: #d1fae5;
    }
    .success-badge {
      display: inline-block;
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 28px 24px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #10b981;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #f8fafc;
      border-radius: 10px;
      padding: 12px 16px;
    }
    .btn-track {
      display: block;
      width: 220px;
      margin: 24px auto 8px;
      padding: 12px 20px;
      background: #059669;
      color: #ffffff !important;
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">🛒 CommerceOS</div>
        <div class="header-sub">Hệ thống thương mại điện tử chính hãng</div>
        <div class="success-badge">✓ ĐẶT HÀNG THÀNH CÔNG</div>
      </div>

      <div class="content">
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
          Cảm ơn bạn, ${recipientName}!
        </div>
        <div style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Đơn hàng <strong>#${orderNumber}</strong> của bạn đã được tiếp nhận thành công vào lúc <strong>${orderDate}</strong>.
          Shop đang chuẩn bị đóng gói và sẽ bàn giao cho đơn vị vận chuyển trong thời gian sớm nhất.
        </div>

        <div class="section-title">Thông tin giao hàng</div>
        <table class="info-table" style="display: table;">
          <tr>
            <td style="padding: 6px 12px; font-size: 12px; color: #64748b; width: 130px;">Người nhận:</td>
            <td style="padding: 6px 12px; font-size: 12px; font-weight: 600; color: #0f172a;">${recipientName} (${recipientPhone})</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-size: 12px; color: #64748b;">Địa chỉ nhận hàng:</td>
            <td style="padding: 6px 12px; font-size: 12px; color: #0f172a;">${shippingAddress}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-size: 12px; color: #64748b;">Hình thức thanh toán:</td>
            <td style="padding: 6px 12px; font-size: 12px; font-weight: 600; color: #059669;">${paymentMethod}</td>
          </tr>
        </table>

        <div class="section-title">Chi tiết sản phẩm đã đặt</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${itemRowsHtml}
        </table>

        <div style="background: #f8fafc; border-radius: 12px; padding: 14px 18px; margin-top: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Tổng tiền hàng:</td>
              <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 500;">${formatVND(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Phí vận chuyển:</td>
              <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: 500;">
                ${shippingFee > 0 ? formatVND(shippingFee) : '<span style="color: #059669; font-weight: 600;">Miễn phí</span>'}
              </td>
            </tr>
            ${
              discountAmount > 0
                ? `
            <tr>
              <td style="padding: 4px 0; color: #ef4444;">Giảm giá Voucher:</td>
              <td style="padding: 4px 0; text-align: right; color: #ef4444; font-weight: 600;">-${formatVND(discountAmount)}</td>
            </tr>
            `
                : ''
            }
            <tr style="border-top: 1px dashed #cbd5e1;">
              <td style="padding: 10px 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">Tổng thanh toán:</td>
              <td style="padding: 10px 0 4px; text-align: right; font-size: 16px; font-weight: 800; color: #059669;">
                ${formatVND(grandTotal)}
              </td>
            </tr>
          </table>
        </div>

        ${
          trackingUrl
            ? `<a href="${trackingUrl}" class="btn-track">Theo dõi đơn hàng trực tuyến</a>`
            : ''
        }
      </div>

      <div class="footer">
        <div>Nếu có bất kỳ thắc mắc nào về đơn hàng, bạn có thể trả lời trực tiếp email này hoặc liên hệ hotline CSKH.</div>
        <div style="margin-top: 6px;">© 2026 CommerceOS Inc. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderOrderStatusTemplate(params: {
  recipientName: string;
  orderNumber: string;
  statusLabel: string;
  statusDescription: string;
  trackingUrl?: string;
}): string {
  const { recipientName, orderNumber, statusLabel, statusDescription, trackingUrl } = params;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cập nhật trạng thái đơn hàng #${orderNumber} - CommerceOS</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 12px;
    }
    .card {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 28px 24px;
    }
    .badge {
      display: inline-block;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 20px;
      margin: 12px 0 16px;
    }
    .btn {
      display: block;
      width: 200px;
      margin: 20px auto 0;
      padding: 10px 18px;
      background: #059669;
      color: #ffffff !important;
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      border-radius: 8px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      padding: 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div style="font-size: 22px; font-weight: 800;">🛒 CommerceOS</div>
        <div style="font-size: 12px; color: #d1fae5; margin-top: 2px;">Cập nhật thông tin giao vận</div>
      </div>
      <div class="content">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">Xin chào ${recipientName},</div>
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">
          Đơn hàng <strong>#${orderNumber}</strong> của bạn vừa có cập nhật trạng thái mới nhất:
        </p>

        <div style="text-align: center;">
          <div class="badge">Trạng thái: ${statusLabel}</div>
        </div>

        <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #334155; line-height: 1.5;">
          ${statusDescription}
        </div>

        ${
          trackingUrl
            ? `<a href="${trackingUrl}" class="btn">Kiểm tra đơn hàng</a>`
            : ''
        }
      </div>
      <div class="footer">
        © 2026 CommerceOS Inc. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
