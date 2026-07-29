import { defineMiddleware, sequence } from 'astro:middleware';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateSession } from '@/lib/auth/session';

const RATE_LIMITED_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/contact'];
const ADMIN_PREFIX = '/admin';
const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

const rateLimitMiddleware = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  if (RATE_LIMITED_ROUTES.includes(url.pathname)) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const key = `${ip}:${url.pathname}`;
    const limit = url.pathname === '/api/contact' ? 3 : 5;
    const result = await checkRateLimit({ key, limit, windowMs: 60_000 });

    if (!result.allowed) {
      return new Response(JSON.stringify({ error: 'Terlalu banyak percobaan, coba lagi nanti.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});

const authMiddleware = defineMiddleware(async (context, next) => {
  const { cookies, url, locals, redirect } = context;
  const token = cookies.get('session_token')?.value;

  locals.user = null;

  if (token) {
    const session = await validateSession(token);
    if (session) {
      locals.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        twoFactorEnabled: session.user.twoFactorEnabled,
      };
    }
  }

  const isAdminRoute = url.pathname.startsWith(ADMIN_PREFIX);
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.includes(url.pathname);

  if (isAdminRoute && !isPublicAdminRoute && !locals.user) {
    return redirect('/admin/login');
  }

  return next();
});

export const onRequest = sequence(rateLimitMiddleware, authMiddleware);