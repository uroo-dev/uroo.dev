// POST /api/midtrans-notification — webhook from Midtrans.
// Verifies signature, filters status/fraud, transitions order to paid (idempotent),
// then sends TWO different invoices (seller + buyer) and notifies seller WA.

import { json } from '../_lib/shared.js';
import { verifySignature } from '../_lib/midtrans.js';
import { getOrder, putOrder } from '../_lib/orders.js';
import { sendResend } from '../_lib/resend.js';
import { renderBuyerInvoiceHtml, renderSellerInvoiceHtml, sellerWaMessage } from '../_lib/invoice.js';
import { buildWaLink, sendWaCloud } from '../_lib/whatsapp.js';

export async function onRequestPost({ request, env }) {
  let body = {};
  try {
    const form = await request.formData();
    for (const [k, v] of form.entries()) body[k] = String(v);
  } catch (e) {
    try {
      body = await request.json();
    } catch (e2) {
      return json({ ok: false, error: 'bad_body' }, 400);
    }
  }

  if (!env.MIDTRANS_SERVER_KEY) {
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const sigOk = await verifySignature(body, env.MIDTRANS_SERVER_KEY);
  if (!sigOk) {
    return json({ ok: false, error: 'bad_signature' }, 401);
  }

  const orderId = String(body.order_id ?? '');
  const order = await getOrder(env, orderId);
  if (!order) {
    return json({ ok: false, error: 'not_found' }, 404);
  }

  // Amount must match stored price
  const gross = Number(String(body.gross_amount ?? '').replace(/\.00$/, ''));
  if (!Number.isFinite(gross) || Math.abs(gross - Number(order.price)) > 0.01) {
    return json({ ok: false, error: 'amount_mismatch' }, 400);
  }

  const ts = String(body.transaction_status ?? '');
  const fs = String(body.fraud_status ?? 'accept');

  // Not paid yet: mark expired/cancel/deny states, but never send emails.
  const isPaidState = ts === 'capture' || ts === 'settlement';
  if (!isPaidState || (fs && fs !== 'accept')) {
    if ((ts === 'expire' || ts === 'cancel' || ts === 'deny') && order.status === 'pending') {
      order.status = 'expired';
      await putOrder(env, order).catch(() => {});
    }
    return json({ ok: true, status: ts });
  }

  // Idempotent: guard key + status check prevent double-processing/emails
  // even when Midtrans delivers the same webhook concurrently.
  const paidKey = 'paid:' + orderId;
  if (env.ORDERS) {
    const already = await env.ORDERS.get(paidKey).catch(() => null);
    if (already) return json({ ok: true, status: 'already_processed' });
  }

  if (order.status !== 'paid') {
    // Reserve the transition BEFORE emailing (atomic-ish guard).
    if (env.ORDERS) {
      await env.ORDERS.put(paidKey, orderId, { expirationTtl: 86400 }).catch(() => {});
    }
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    order.payment = {
      transaction_id: body.transaction_id || '',
      order_id: orderId,
      payment_type: body.payment_type || '',
      transaction_status: ts,
      fraud_status: fs,
      gross_amount: body.gross_amount || String(order.price),
      payment_time: body.transaction_time || '',
    };
    order.sellerNotified = false;
    order.buyerEmailSent = false;
    order.sellerEmailSent = false;
    await putOrder(env, order);

    const sellerHtml = renderSellerInvoiceHtml(order);
    const buyerHtml = renderBuyerInvoiceHtml(order);

    const sellerEmailRes = await sendResend(env, {
      to: env.EMAIL_SELLER || 'uroprasetyo@gmail.com',
      subject: `[ROYALTI] Pesanan Lunas ${order.orderId} — ${order.title || order.project}`,
      html: sellerHtml,
    });
    const buyerEmailRes = await sendResend(env, {
      to: order.customer.email,
      subject: `Invoice ${order.orderId} (Lunas) — uroo dev`,
      html: buyerHtml,
    });

    order.sellerEmailSent = !!sellerEmailRes?.ok;
    order.buyerEmailSent = !!buyerEmailRes?.ok;
    if (!order.sellerEmailSent || !order.buyerEmailSent) {
      await putOrder(env, order).catch(() => {});
    }

    // WhatsApp seller notification (deep-link default + Cloud API bonus)
    const msg = sellerWaMessage(order);
    const waLink = buildWaLink(env.SELLER_WA, msg);
    order.sellerNotified = !!waLink;
    const cloudRes = await sendWaCloud(env, env.SELLER_WA, msg).catch(() => ({}));
    if (cloudRes?.ok) order.sellerNotified = true;
    if (waLink || cloudRes?.skipped) {
      await putOrder(env, order).catch(() => {});
    }
  }

  return json({ ok: true });
}