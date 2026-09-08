// Invoice HTML templates — buyer page, buyer email, seller email, WhatsApp message.
// Buyer & seller invoices contain DIFFERENT data (privacy separation).

import { esc, fmtIDR } from './shared.js';

export function sellerWaMessage(order) {
  const cust = order.customer || {};
  const lines = [
    'Halo uroo dev, ada pesanan BARU yang sudah LUNAS!',
    '',
    'Order : ' + order.orderId,
    'Project: ' + (order.title || order.project),
    'Jumlah: ' + fmtIDR(order.price),
    'Metode: ' + (order.payment?.payment_type || '(belum diketahui)'),
    '',
    'Pelanggan: ' + (cust.nama || '-'),
    'WA: ' + (cust.wa ? 'https://wa.me/' + cust.wa.replace(/[^0-9]/g, '') : '-'),
    'Email: ' + (cust.email || '-'),
    '',
  ];
  for (const f of Array.isArray(order.customFields) ? order.customFields : []) {
    lines.push((f.label || f.name) + ': ' + (f.value || '-'));
  }
  lines.push('', 'Segera follow up ya!');
  return lines.join('\n');
}

export function renderInvoicePageHtml(order) {
  const cust = order.customer || {};
  const cfRows = (Array.isArray(order.customFields) ? order.customFields : [])
    .map((f) => `<tr><td class="muted">${esc(f.label || f.name)}</td><td>${esc(f.value || '-')}</td></tr>`)
    .join('');
  const statusBadge =
    order.status === 'paid'
      ? '<span class="badge paid">Lunas</span>'
      : order.status === 'expired'
      ? '<span class="badge expired">Kedaluwarsa</span>'
      : '<span class="badge pending">Menunggu Pembayaran</span>';

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Invoice ${esc(order.orderId)} — uroo dev</title>
<style>
  :root { color-scheme: dark; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,'Inter',system-ui,sans-serif; background:#131313; color:#e5e2e1; min-height:100vh; }
  .wrap { max-width:640px; margin:0 auto; padding:40px 24px 64px; }
  .head { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:32px; }
  .logo { font-weight:800; letter-spacing:-0.02em; font-size:22px; color:#fff; }
  .muted { color:#9aa0a3; }
  .card { background:#1c1b1b; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:28px; margin-bottom:16px; }
  .badge { display:inline-block; font-size:12px; font-weight:700; letter-spacing:0.04em; padding:5px 12px; border-radius:999px; }
  .badge.paid { background:rgba(52,199,89,0.18); color:#7ee2a8; border:1px solid rgba(52,199,89,0.4); }
  .badge.pending { background:rgba(255,204,0,0.12); color:#ffd75e; border:1px solid rgba(255,204,0,0.35); }
  .badge.expired { background:rgba(255,138,128,0.12); color:#ff8a80; border:1px solid rgba(255,138,128,0.35); }
  h1 { font-size:24px; margin-bottom:8px; }
  .order-id { font-family:ui-monospace,monospace; font-size:14px; color:#9aa0a3; }
  .row { display:flex; justify-content:space-between; gap:16px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .row:last-child { border-bottom:none; }
  .row .muted { font-size:13px; }
  .price { font-size:26px; font-weight:800; color:#fff; }
  table { width:100%; border-collapse:collapse; }
  td { padding:9px 0; vertical-align:top; }
  td.muted { font-size:13px; width:42%; }
  .btn { display:inline-block; margin-top:8px; background:#fff; color:#2f3131; font-weight:700; text-decoration:none; padding:13px 22px; border-radius:999px; font-size:14px; }
  .foot { text-align:center; margin-top:28px; font-size:12px; color:#767b7d; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div>
        <div class="logo">uroo dev</div>
        <div class="order-id">${esc(order.orderId)}</div>
      </div>
      ${statusBadge}
    </div>

    <div class="card">
      <div class="row"><span class="muted">Produk</span><span>${esc(order.item?.name || order.title || order.project)}</span></div>
      <div class="row"><span class="muted">Quantity</span><span>1</span></div>
      <div class="row"><span class="muted">Total Dibayar</span><span class="price">${fmtIDR(order.price)}</span></div>
      ${order.payment ? `<div class="row"><span class="muted">Metode Pembayaran</span><span>${esc(order.payment.payment_type || '-')}</span></div>` : ''}
      ${order.paidAt ? `<div class="row"><span class="muted">Waktu Pembayaran</span><span>${esc(order.paidAt)}</span></div>` : ''}
      <div class="row"><span class="muted">Atas Nama</span><span>${esc(order.customer?.nama || '-')}</span></div>
    </div>

    ${cfRows ? `<div class="card"><h2 style="font-size:16px;margin-bottom:10px;color:#fff;">Data Pesanan</h2><table>${cfRows}</table></div>` : ''}

    ${order.status === 'paid'
      ? `<div class="card" style="text-align:center;"><p class="muted" style="margin-bottom:16px;">Pembayaran berhasil. Invoice ini juga dikirim ke email Anda. Terima kasih sudah mempercayai uroo dev!</p><a class="btn" href="/demos.html">Kembali ke Daftar Demo</a></div>`
      : `<div class="card" style="text-align:center;"><p class="muted" style="margin-bottom:16px;">Pembayaran Anda belum selesai. Lanjutkan pembayaran melalui link dari Midtrans atau hubungi kami bila perlu bantuan.</p><a class="btn" href="/contact.html">Hubungi Kami</a></div>`}

    <p class="foot">uroo dev — Software House Karanganyar, Jawa Tengah. &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
}

export function renderBuyerInvoiceHtml(order) {
  const cfRows = (Array.isArray(order.customFields) ? order.customFields : [])
    .map((f) => `<tr><td class="muted">${esc(f.label || f.name)}</td><td>${esc(f.value || '-')}</td></tr>`)
    .join('');
  return `<!doctype html>
<html lang="id">
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#202124;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e8e8e6;">
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#111;">uroo dev</div>
            <div style="font-size:12px;color:#767b7d;margin-top:2px;">Invoice ${esc(order.orderId)}</div>
            <div style="margin:18px 0 6px;font-size:13px;font-weight:700;letter-spacing:0.04em;color:#047857;">✓ PEMBAYARAN LUNAS</div>
            <table role="presentation" width="100%" style="margin-top:10px;">
              <tr><td style="padding:8px 0;font-size:13px;color:#767b7d;">Produk</td><td style="padding:8px 0;font-size:14px;text-align:right;">${esc(order.item?.name || order.title || order.project)}</td></tr>
              <tr><td style="padding:8px 0;font-size:13px;color:#767b7d;">Metode Pembayaran</td><td style="padding:8px 0;font-size:14px;text-align:right;">${esc(order.payment?.payment_type || '-')}</td></tr>
              ${order.paidAt ? `<tr><td style="padding:8px 0;font-size:13px;color:#767b7d;">Waktu Pembayaran</td><td style="padding:8px 0;font-size:14px;text-align:right;">${esc(order.paidAt)}</td></tr>` : ''}
              ${cfRows}
              <tr><td style="padding:12px 0;border-top:2px solid #202124;font-size:14px;font-weight:700;">Total Dibayar</td><td style="padding:12px 0;border-top:2px solid #202124;font-size:18px;font-weight:800;text-align:right;">${fmtIDR(order.price)}</td></tr>
            </table>
            <p style="font-size:13px;color:#5f6368;margin:18px 0 0;">Terima kasih sudah mempercayai uroo dev. Tim kami akan segera menghubungi Anda untuk tindak lanjut.</p>
          </td>
        </tr>
        <tr><td style="text-align:center;font-size:12px;color:#9aa0a3;padding-top:16px;">uroo dev — Software House Karanganyar · uroo.my.id</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderSellerInvoiceHtml(order) {
  const cfRows = (Array.isArray(order.customFields) ? order.customFields : [])
    .map((f) => `<tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">${esc(f.label || f.name)}</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(f.value || '-')}</td></tr>`)
    .join('');
  const buyerWa = (order.customer?.wa || '').replace(/[^0-9]/g, '');
  return `<!doctype html>
<html lang="id">
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#202124;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">
        <tr>
          <td style="background:#ffffff;border-radius:14px;padding:32px;border:1px solid #e8e8e6;">
            <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#111;">uroo dev — NOTIFIKASI PENJUAL</div>
            <div style="font-size:12px;color:#767b7d;margin-top:2px;">Order ${esc(order.orderId)} · ${esc(order.payment?.payment_time || new Date().toISOString())}</div>
            <div style="margin:18px 0;padding:10px 14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;font-size:14px;color:#047857;font-weight:700;">✓ Pesanan LUNAS — segera follow up!</div>
            <table role="presentation" width="100%">
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Produk</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(order.item?.name || order.title || order.project)}</td></tr>
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Total Dibayar</td><td style="padding:7px 0;font-size:16px;font-weight:800;text-align:right;">${fmtIDR(order.price)}</td></tr>
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Metode</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(order.payment?.payment_type || '-')}</td></tr>
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Transaction ID</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(order.payment?.transaction_id || '-')}</td></tr>
            </table>
            <div style="margin:18px 0 8px;padding-top:14px;border-top:1px solid #e8e8e6;font-size:13px;font-weight:700;">Data Pelanggan</div>
            <table role="presentation" width="100%">
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Nama</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(order.customer?.nama || '-')}</td></tr>
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">WhatsApp</td><td style="padding:7px 0;font-size:14px;text-align:right;">${buyerWa ? `<a href="https://wa.me/${buyerWa}" style="color:#2563eb;">${esc(order.customer.wa)}</a>` : '-'}</td></tr>
              <tr><td style="padding:7px 0;font-size:13px;color:#767b7d;">Email</td><td style="padding:7px 0;font-size:14px;text-align:right;">${esc(order.customer?.email || '-')}</td></tr>
              ${cfRows}
            </table>
            <p style="font-size:12px;color:#9aa0a3;margin:18px 0 0;">Replies-to buyer langsung dari link WhatsApp di atas.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}