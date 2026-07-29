import type { APIRoute } from 'astro';
import { getUploadAuthParams } from '@/lib/imagekit';

export const GET: APIRoute = async () => {
  const authParams = getUploadAuthParams();
  return new Response(JSON.stringify(authParams), {
    headers: { 'Content-Type': 'application/json' },
  });
};