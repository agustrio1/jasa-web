import type { APIRoute } from 'astro';
import { saveMediaRecord, getAllMedia } from '@/lib/services/media.service';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const mediaList = await getAllMedia();

  return new Response(JSON.stringify({ items: mediaList }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const id = await saveMediaRecord(body);

  return new Response(JSON.stringify({ success: true, id }), { status: 201 });
};