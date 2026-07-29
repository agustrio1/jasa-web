import type { APIRoute } from 'astro';
import { createLead } from '@/lib/services/lead.service';
import { contactSchema, formatZodError } from '@/lib/validation/schemas';

export const POST: APIRoute = async ({ request }) => {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body tidak valid' }), { status: 400 });
  }

  const parsed = contactSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  await createLead(parsed.data);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};