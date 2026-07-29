import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { verifyTwoFactorForUser } from '@/lib/auth/two-factor';
import { loginSchema, formatZodError } from '@/lib/validation/schemas';

export const POST: APIRoute = async ({ request, cookies }) => {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body tidak valid' }), { status: 400 });
  }

  const parsed = loginSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  const { email, password, twoFactorToken } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    return new Response(JSON.stringify({ error: 'Email atau password salah' }), { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return new Response(JSON.stringify({ error: 'Email atau password salah' }), { status: 401 });
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorToken) {
      return new Response(JSON.stringify({ requiresTwoFactor: true }), { status: 200 });
    }

    const isValidToken = await verifyTwoFactorForUser(user.id, twoFactorToken);
    if (!isValidToken) {
      return new Response(JSON.stringify({ error: 'Kode 2FA tidak valid' }), { status: 401 });
    }
  }

  const { token, expiresAt } = await createSession(user.id);

  cookies.set('session_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};