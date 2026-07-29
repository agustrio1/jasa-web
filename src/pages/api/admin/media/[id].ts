import type { APIRoute } from 'astro';
import { deleteMediaRecord } from '@/lib/services/media.service';
import { deleteImage } from '@/lib/imagekit';

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { fileId } = await request.json();

  await deleteImage(fileId);
  await deleteMediaRecord(params.id!);

  return new Response(JSON.stringify({ success: true }));
};