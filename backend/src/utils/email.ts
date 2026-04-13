import nodemailer from 'nodemailer';
import { env } from '../config/env';

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export interface OrderEmailData {
  orderId: string;
  storeName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  storeOwnerEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  notes?: string | null;
  totalIQD: number;
  items: Array<{
    productName: string;
    quantity: number;
    priceIQD: number;
  }>;
}

function fmt(n: number) {
  return n.toLocaleString('en-US') + ' IQD';
}

function buildBuyerEmail(data: OrderEmailData, shortId: string): string {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#F0EFE8;font-size:13px;">${item.productName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#F0EFE8;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#C9A84C;font-size:13px;text-align:end;">${fmt(item.priceIQD * item.quantity)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 0;background:#080810;font-family:'Cairo',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#16162A;border-radius:16px;overflow:hidden;border:1px solid #2A2A45;">

    <div style="padding:28px 24px;text-align:center;border-bottom:1px solid #2A2A45;">
      <div style="font-size:26px;font-weight:900;color:#C9A84C;letter-spacing:3px;">IMDAD</div>
      <div style="margin-top:4px;color:#8B8BA7;font-size:13px;">إمداد للمكملات الغذائية</div>
    </div>

    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 6px;font-size:20px;color:#F0EFE8;">تم استلام طلبك ✓</h2>
      <p style="margin:0 0 28px;color:#8B8BA7;font-size:14px;line-height:1.6;">
        شكراً ${data.buyerName}! سيتواصل معك محل <strong style="color:#F0EFE8;">${data.storeName}</strong> قريباً لتأكيد الطلب وتحديد موعد التوصيل.
      </p>

      <div style="background:#1E1E35;border-radius:12px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#8B8BA7;font-size:13px;padding:4px 0;">رقم الطلب</td>
            <td style="color:#C9A84C;font-size:13px;font-weight:700;text-align:end;letter-spacing:1px;">#${shortId}</td>
          </tr>
          <tr>
            <td style="color:#8B8BA7;font-size:13px;padding:4px 0;">المحل</td>
            <td style="color:#F0EFE8;font-size:13px;text-align:end;">${data.storeName}</td>
          </tr>
          <tr>
            <td style="color:#8B8BA7;font-size:13px;padding:4px 0;">طريقة الدفع</td>
            <td style="color:#F0EFE8;font-size:13px;text-align:end;">دفع عند الاستلام</td>
          </tr>
        </table>
      </div>

      <h3 style="margin:0 0 12px;font-size:15px;color:#F0EFE8;">المنتجات</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#1E1E35;">
            <th style="padding:8px 12px;text-align:start;color:#8B8BA7;font-size:12px;font-weight:500;">المنتج</th>
            <th style="padding:8px 12px;text-align:center;color:#8B8BA7;font-size:12px;font-weight:500;">الكمية</th>
            <th style="padding:8px 12px;text-align:end;color:#8B8BA7;font-size:12px;font-weight:500;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#1E1E35;">
            <td colspan="2" style="padding:12px;color:#8B8BA7;font-size:13px;font-weight:600;">المجموع الكلي</td>
            <td style="padding:12px;color:#C9A84C;font-size:17px;font-weight:800;text-align:end;">${fmt(data.totalIQD)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#1E1E35;border-radius:12px;padding:16px;">
        <div style="font-size:14px;color:#F0EFE8;font-weight:600;margin-bottom:10px;">معلومات التوصيل</div>
        <div style="color:#8B8BA7;font-size:13px;line-height:1.8;">
          📍 ${data.deliveryAddress}، ${data.deliveryCity}<br>
          📞 ${data.deliveryPhone}
          ${data.notes ? `<br>📝 ${data.notes}` : ''}
        </div>
      </div>
    </div>

    <div style="padding:18px 24px;border-top:1px solid #2A2A45;text-align:center;">
      <p style="margin:0;color:#5A5A7A;font-size:12px;">© ${new Date().getFullYear()} Imdad — جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
}

function buildStoreEmail(data: OrderEmailData, shortId: string): string {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#F0EFE8;font-size:13px;">${item.productName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#F0EFE8;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A45;color:#C9A84C;font-size:13px;text-align:end;">${fmt(item.priceIQD)} / قطعة</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 0;background:#080810;font-family:'Cairo',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#16162A;border-radius:16px;overflow:hidden;border:1px solid #2A2A45;">

    <div style="padding:28px 24px;text-align:center;border-bottom:1px solid #2A2A45;">
      <div style="font-size:26px;font-weight:900;color:#C9A84C;letter-spacing:3px;">IMDAD</div>
      <div style="margin-top:4px;color:#8B8BA7;font-size:13px;">طلب جديد في محلك</div>
    </div>

    <div style="padding:32px 24px;">
      <div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:16px;margin-bottom:28px;text-align:center;">
        <div style="font-size:28px;margin-bottom:6px;">🛒</div>
        <div style="color:#C9A84C;font-size:16px;font-weight:700;">طلب جديد — #${shortId}</div>
        <div style="color:#8B8BA7;font-size:13px;margin-top:4px;">يرجى التواصل مع الزبون لتأكيد الطلب</div>
      </div>

      <div style="background:#1E1E35;border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="font-size:14px;color:#F0EFE8;font-weight:600;margin-bottom:10px;">معلومات الزبون</div>
        <div style="color:#8B8BA7;font-size:13px;line-height:1.8;">
          👤 ${data.buyerName}<br>
          📞 <strong style="color:#F0EFE8;">${data.buyerPhone}</strong><br>
          📍 ${data.deliveryAddress}، ${data.deliveryCity}<br>
          🚚 هاتف التوصيل: ${data.deliveryPhone}
          ${data.notes ? `<br>📝 <em>${data.notes}</em>` : ''}
        </div>
      </div>

      <h3 style="margin:0 0 12px;font-size:15px;color:#F0EFE8;">المنتجات المطلوبة</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#1E1E35;">
            <th style="padding:8px 12px;text-align:start;color:#8B8BA7;font-size:12px;font-weight:500;">المنتج</th>
            <th style="padding:8px 12px;text-align:center;color:#8B8BA7;font-size:12px;font-weight:500;">الكمية</th>
            <th style="padding:8px 12px;text-align:end;color:#8B8BA7;font-size:12px;font-weight:500;">سعر الوحدة</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#1E1E35;">
            <td colspan="2" style="padding:12px;color:#8B8BA7;font-size:13px;font-weight:600;">المجموع الكلي</td>
            <td style="padding:12px;color:#C9A84C;font-size:17px;font-weight:800;text-align:end;">${fmt(data.totalIQD)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#1E1E35;border-radius:12px;padding:14px;text-align:center;">
        <p style="margin:0;color:#8B8BA7;font-size:13px;">سجّل دخولك إلى لوحة التحكم لإدارة هذا الطلب وتحديث حالته</p>
      </div>
    </div>

    <div style="padding:18px 24px;border-top:1px solid #2A2A45;text-align:center;">
      <p style="margin:0;color:#5A5A7A;font-size:12px;">© ${new Date().getFullYear()} Imdad — جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends order confirmation to the buyer and new-order alert to the store owner.
 * Fire-and-forget: errors are logged but never throw — they must not affect the order response.
 */
export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return; // SMTP not configured — skip silently

  const from = env.EMAIL_FROM || env.SMTP_USER;
  const shortId = data.orderId.slice(-8).toUpperCase();

  const results = await Promise.allSettled([
    transporter.sendMail({
      from: `"إمداد Imdad" <${from}>`,
      to: data.buyerEmail,
      subject: `تأكيد طلبك #${shortId} — Imdad`,
      html: buildBuyerEmail(data, shortId),
    }),
    transporter.sendMail({
      from: `"إمداد Imdad" <${from}>`,
      to: data.storeOwnerEmail,
      subject: `طلب جديد #${shortId} في محلك — Imdad`,
      html: buildStoreEmail(data, shortId),
    }),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[email] Failed to send order email:', result.reason);
    }
  }
}
