// Resend email integration.

export async function sendResend(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) return { skipped: true };
  const from = env.EMAIL_FROM || 'Uroo Dev <billing@uroo.my.id>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}