import type { APIRoute } from 'astro';
import { invalidateSession } from '@/lib/auth/session';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get('session_token')?.value;

  if (token) {
    const [sessionId] = token.split('.');
    await invalidateSession(sessionId);
  }

  cookies.delete('session_token', { path: '/' });
  return redirect('/admin/login');
};