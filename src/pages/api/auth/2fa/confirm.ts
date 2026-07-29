import type { APIRoute } from 'astro';
import { enableTwoFactor, verifyTwoFactorToken } from '@/lib/auth/two-factor';

export const POST: APIRoute = async ({ locals, cookies, request }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const pendingSecret = cookies.get('pending_2fa_secret')?.value;
  if (!pendingSecret) {
    return new Response(JSON.stringify({ error: 'Sesi setup 2FA sudah kedaluwarsa' }), { status: 400 });
  }

  const { token } = await request.json();
  const isValid = await verifyTwoFactorToken(token, pendingSecret);

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Kode tidak valid' }), { status: 400 });
  }

  await enableTwoFactor(user.id, pendingSecret);
  cookies.delete('pending_2fa_secret');

  return new Response(JSON.stringify({ success: true }));
};