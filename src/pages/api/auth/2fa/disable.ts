import type { APIRoute } from 'astro';
import { disableTwoFactor } from '@/lib/auth/two-factor';

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await disableTwoFactor(locals.user.id);
  return new Response(JSON.stringify({ success: true }));
};