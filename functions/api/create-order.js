// POST /api/create-order — validate, re-verify price server-side,
// create Midtrans Snap transaction, store order in KV.

import { json } from '../_lib/shared.js';
import { validateCustomer } from '../_lib/validate.js';
import { loadDemos, findDemo } from '../_lib/demos.js';
import { genOrderId, genInvoiceToken, putOrder } from '../_lib/orders.js';
import { createSnapTransaction, midtransClientKey, midtransSnapScript } from '../_lib/midtrans.js';
import { buildWaLink } from '../_lib/whatsapp.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return json({ success: false, error: 'BAD_REQUEST', message: 'Request tidak valid.' }, 400);

    const project = String(body.project ?? '').trim();
    if (!/^[a-z0-9-]{1,63}$/.test(project)) {
      return json({ success: false, error: 'BAD_PROJECT', message: 'Project tidak valid.' }, 400);
    }

    const { errors, value: customer } = validateCustomer(body.customer);
    if (Object.keys(errors).length) {
      return json({ success: false, error: 'VALIDATION', message: 'Data tidak valid.', errors }, 400);
    }

    // ==== Server-side price verification (anti-tamper) ====
    const demos = await loadDemos(env);
    const demo = findDemo(demos, project);
    if (!demo) return json({ success: false, error: 'NOT_FOUND', message: 'Demo tidak ditemukan.' }, 404);

    const price = Number(demo.price || 0);
    if (!(price > 0)) {
      return json({ success: false, error: 'NO_PRICE', message: 'Demo ini belum memiliki paket checkout.', waLink: env.SELLER_WA ? buildWaLink(env.SELLER_WA, 'Halo uroo dev, saya tertarik dengan demo ' + (demo.title || project) + '.') : '' }, 400);
    }

    // ==== Validate custom fields against schema in demos.json ====
    const defs = Array.isArray(demo.checkoutFields) ? demo.checkoutFields : [];
    const sent = new Set();
    const customFields = [];
    for (const f of Array.isArray(body.customFields) ? body.customFields : []) {
      const def = defs.find((x) => x.name === f.name);
      if (!def) continue;
      sent.add(f.name);
      const val = String(f.value ?? '').trim();
      if (def.required && !val) {
        return json({ success: false, error: 'VALIDATION', message: 'Field ' + (def.label || def.name) + ' wajib diisi.' }, 400);
      }
      if (val) customFields.push({ name: def.name, label: def.label || def.name, value: val.slice(0, 500) });
    }
    for (const def of defs) {
      if (def.required && !sent.has(def.name)) {
        return json({ success: false, error: 'VALIDATION', message: 'Field ' + (def.label || def.name) + ' wajib diisi.' }, 400);
      }
    }

    // ==== Lightweight rate limit (best-effort) ====
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rlKey = 'rl:create:' + ip;
    if (env.ORDERS) {
      const cur = await env.ORDERS.get(rlKey).catch(() => null);
      const cnt = cur ? Number(cur) : 0;
      if (cnt >= 5) {
        return json({ success: false, error: 'RATE_LIMIT', message: 'Terlalu banyak permintaan. Coba lagi nanti.' }, 429);
      }
      await env.ORDERS.put(rlKey, String(cnt + 1), { expirationTtl: 600 }).catch(() => {});
    }

    // ==== Safe mode: payment not configured yet ====
    if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY || !env.ORDERS) {
      return json({
        success: false,
        error: 'PAYMENT_NOT_CONFIGURED',
        message: 'Pembayaran online belum aktif. Silakan hubungi kami via WhatsApp untuk memesan.',
        waLink: buildWaLink(env.SELLER_WA, 'Halo uroo dev, saya ingin memesan demo ' + (demo.title || project) + '.'),
      }, 200);
    }

    // ==== Create Snap transaction (with one retry on transient failure) ====
    const orderId = genOrderId();
    const invoiceToken = genInvoiceToken();
    const itemName = demo.itemName || ((demo.title || project) + ' — Full Build');
    const base = env.BASE_URL || 'https://uroo.my.id';
    const invoiceUrl = base + '/api/invoice?order=' + encodeURIComponent(orderId) + '&token=' + encodeURIComponent(invoiceToken);

    const snapReq = {
      transaction_details: { order_id: orderId, gross_amount: price },
      item_details: [{ id: project, price, quantity: 1, name: itemName }],
      customer_details: { first_name: customer.nama, email: customer.email, phone: customer.wa },
      credit_card: { secure: true },
      callbacks: {
        finish: invoiceUrl,
        error: base + '/checkout.html?demo=' + encodeURIComponent(project) + '&err=payment',
        pending: base + '/checkout.html?demo=' + encodeURIComponent(project) + '&status=pending',
      },
    };

    let snap = null;
    try {
      snap = await createSnapTransaction(env, snapReq);
    } catch (e) {
      if (!/Midtrans error (5|429)/.test(String(e?.message))) throw e;
      snap = await createSnapTransaction(env, snapReq); // single retry
    }

    const order = {
      orderId,
      project,
      title: demo.title || project,
      status: 'pending',
      price,
      currency: 'IDR',
      item: { name: itemName, qty: 1 },
      customer,
      customFields,
      snapToken: snap.token || '',
      invoiceToken,
      payment: null,
      createdAt: new Date().toISOString(),
      paidAt: null,
      sellerNotified: false,
      buyerEmailSent: false,
      sellerEmailSent: false,
    };
    const stored = await putOrder(env, order);
    if (!stored) {
      return json({ success: false, error: 'STORAGE', message: 'Gagal menyimpan pesanan. Coba lagi.' }, 500);
    }

    return json({
      success: true,
      orderId,
      snapToken: snap.token || '',
      snapRedirect: snap.redirect_url || '',
      invoiceUrl,
      clientKey: midtransClientKey(env),
      snapScript: midtransSnapScript(env),
      waLink: buildWaLink(env.SELLER_WA, 'Halo uroo dev, saya baru checkout order ' + orderId),
    });
  } catch (err) {
    const msg = String(err?.message || err);
    if (/Midtrans/.test(msg)) {
      return json({ success: false, error: 'PAYMENT_PROVIDER', message: 'Pembayaran sedang gangguan. Silakan coba lagi nanti.' }, 502);
    }
    return json({ success: false, error: 'SERVER', message: 'Terjadi kesalahan server. Coba lagi.' }, 500);
  }
}