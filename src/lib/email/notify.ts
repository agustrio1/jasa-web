export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
}) {
  const apiKey = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const notifyEmail = import.meta.env.NOTIFICATION_EMAIL ?? process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !notifyEmail) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Website <notifikasi@nexarostudio.com>',
        to: [notifyEmail],
        subject: `Pesan baru dari ${lead.name}`,
        html: `
          <h2>Pesan baru masuk</h2>
          <p><strong>Nama:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          ${lead.phone ? `<p><strong>Telepon:</strong> ${lead.phone}</p>` : ''}
          ${lead.service ? `<p><strong>Layanan diminati:</strong> ${lead.service}</p>` : ''}
          ${lead.message ? `<p><strong>Pesan:</strong><br>${lead.message}</p>` : ''}
        `,
      }),
    });
  } catch {
    // Gagal kirim email tidak boleh menggagalkan penyimpanan lead
  }
}