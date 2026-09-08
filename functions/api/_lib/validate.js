// Input validation for checkout payloads.

export function validateCustomer(customer) {
  const errors = {};
  const nama = String(customer?.nama ?? '').trim();
  const wa = String(customer?.wa ?? '').trim();
  const email = String(customer?.email ?? '').trim();

  if (!nama || nama.length > 100) errors.nama = 'Nama wajib diisi (maks 100 karakter).';
  if (!/^62[0-9]{8,13}$/.test(wa)) errors.wa = 'Format WhatsApp tidak valid. Gunakan 628xxxxxxxxxx.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
    errors.email = 'Format email tidak valid.';

  return { errors, value: { nama, wa, email } };
}