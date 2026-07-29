import type { APIRoute } from 'astro';
import { generateTwoFactorSecret, getTwoFactorKeyUri } from '@/lib/auth/two-factor';

export const POST: APIRoute = async ({ locals, cookies }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const secret = generateTwoFactorSecret();
  const keyUri = getTwoFactorKeyUri(user.email, secret);

  cookies.set('pending_2fa_secret', secret, { httpOnly: true, secure: true, maxAge: 300 });

  return new Response(JSON.stringify({ keyUri, secret }), {
    headers: { 'Content-Type': 'application/json' },
  });
};