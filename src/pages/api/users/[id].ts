import type { APIRoute } from 'astro';
import { deleteUser } from '@/lib/services/user.service';

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await deleteUser(params.id!, locals.user.id);
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Gagal menghapus user' }), { status: 400 });
  }
};