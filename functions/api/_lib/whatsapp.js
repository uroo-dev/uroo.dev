// WhatsApp helpers: wa.me deep link (default) + optional Meta Cloud API.

export function buildWaLink(phone, message) {
  const p = String(phone ?? '').replace(/[^0-9]/g, '');
  if (!p) return '';
  return 'https://wa.me/' + p + '?text=' + encodeURIComponent(message);
}

export async function sendWaCloud(env, to, body) {
  if (!env.GHAT_PHONE_ID || !env.GHAT_TOKEN) return { skipped: true };
  try {
    const res = await fetch(
      'https://graph.facebook.com/v19.0/' + env.GHAT_PHONE_ID + '/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + env.GHAT_TOKEN,
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
      }
    );
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}