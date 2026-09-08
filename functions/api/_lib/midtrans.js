// Midtrans Snap integration (server-side only — server key never leaves backend).

export function midtransConfig(env) {
  const prod = env.MIDTRANS_IS_PRODUCTION === 'true';
  return prod
    ? {
        api: 'https://app.midtrans.com/snap/v1/transactions',
        snapJs: 'https://app.midtrans.com/snap/snap.js',
      }
    : {
        api: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
        snapJs: 'https://app.sandbox.midtrans.com/snap/snap.js',
      };
}

export function midtransSnapScript(env) {
  return midtransConfig(env).snapJs;
}

export function midtransClientKey(env) {
  return env.MIDTRANS_CLIENT_KEY || '';
}

export async function createSnapTransaction(env, payload) {
  const cfg = midtransConfig(env);
  const res = await fetch(cfg.api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + btoa(env.MIDTRANS_SERVER_KEY + ':'),
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    const msg = Array.isArray(data.error_messages) ? data.error_messages.join(', ') : ('Midtrans error ' + res.status);
    throw new Error(msg);
  }
  return data;
}

export async function verifySignature(body, serverKey) {
  const orderId = String(body.order_id ?? '');
  const statusCode = String(body.status_code ?? '');
  // Midtrans sends gross_amount like "150000.00" — strip the trailing .00 for hashing.
  const gross = String(body.gross_amount ?? '').replace(/\.00$/, '');
  const plain = orderId + statusCode + gross + serverKey;
  const expected = await sha512hex(plain);
  return timingSafeEqual(expected, String(body.signature_key ?? ''));
}

// Constant-time comparison to avoid timing side-channels.
export function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function sha512hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-512', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}