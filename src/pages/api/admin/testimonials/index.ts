import type { APIRoute } from 'astro';
import { createTestimonial } from '@/lib/services/testimonial.service';
import { testimonialInputSchema, formatZodError } from '@/lib/validation/schemas';

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

  const parsed = testimonialInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  const id = await createTestimonial(parsed.data);

  return new Response(JSON.stringify({ success: true, id }), { status: 201 });
};