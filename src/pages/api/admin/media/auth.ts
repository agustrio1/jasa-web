import type { APIRoute } from 'astro';
import { getUploadAuthParams } from '@/lib/imagekit';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const authParams = getUploadAuthParams();
  return new Response(JSON.stringify(authParams), {
    headers: { 'Content-Type': 'application/json' },
  });
};