import type { APIRoute } from 'astro';
import { createAdminUser } from '@/lib/services/user.service';
import { createUserSchema, formatZodError } from '@/lib/validation/schemas';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body tidak valid' }), { status: 400 });
  }

  const parsed = createUserSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  try {
    const id = await createAdminUser(parsed.data.name, parsed.data.email, parsed.data.password);
    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Gagal membuat user' }), { status: 400 });
  }
};