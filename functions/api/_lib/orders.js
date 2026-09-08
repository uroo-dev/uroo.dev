// KV-backed order store.

const PREFIX = 'orders/';
const ORDER_TTL = 60 * 60 * 24 * 30; // 30 days

export async function getOrder(env, orderId) {
  if (!env.ORDERS) return null;
  const v = await env.ORDERS.get(PREFIX + orderId).catch(() => null);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

export async function putOrder(env, order) {
  if (!env.ORDERS) return false;
  try {
    await env.ORDERS.put(PREFIX + order.orderId, JSON.stringify(order), { expirationTtl: ORDER_TTL });
    return true;
  } catch (e) {
    return false;
  }
}

function randHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function genOrderId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${ymd}-${randHex(4).toUpperCase()}`;
}

// Unpredictable one-time token for invoice page access.
export function genInvoiceToken() {
  return randHex(16);
}