// GET /api/invoice?order=<id>&token=<token> — server-rendered buyer invoice page.
// Token access required so buyer PII is not enumerable via order IDs.

import { getOrder } from './_lib/orders.js';
import { renderInvoicePageHtml } from './_lib/invoice.js';
import { timingSafeEqual } from './_lib/midtrans.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order') || '';
  const token = url.searchParams.get('token') || '';

  if (!/^ORD-[0-9]{8}-[A-F0-9]{8}$/.test(orderId) || !/^[a-f0-9]{32}$/.test(token)) {
    return notFoundPage();
  }

  const order = await getOrder(env, orderId);
  if (!order || !timingSafeEqual(order.invoiceToken || '', token)) return notFoundPage();

  return new Response(renderInvoicePageHtml(order), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    },
  });
}

function notFoundPage() {
  return new Response(
    `<!doctype html><html lang="id"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="robots" content="noindex, nofollow" /><title>Invoice tidak ditemukan — uroo dev</title><style>body{font-family:-apple-system,sans-serif;background:#131313;color:#e5e2e1;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}.w{padding:32px;}h1{font-size:22px;margin:0 0 8px;}p{color:#9aa0a3;font-size:14px;margin:0 0 20px;}a{display:inline-block;background:#fff;color:#2f3131;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;font-size:14px;}</style></head><body><div class="w"><h1>Invoice tidak ditemukan</h1><p>Pastikan link invoice benar, atau pesanan belum terdaftar.</p><a href="/">Kembali ke Beranda</a></div></body></html>`,
    {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    }
  );
}