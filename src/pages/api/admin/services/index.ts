import type { APIRoute } from 'astro';
import { createServiceWithLocations, isSlugTaken } from '@/lib/services/service.service';
import { serviceInputSchema, formatZodError } from '@/lib/validation/schemas';

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

  const parsed = serviceInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  const { name, slug, shortDescription, content, icon, locations, packages, faq } = parsed.data;

  if (await isSlugTaken(slug)) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  for (const loc of locations) {
    if (await isSlugTaken(loc.slug)) {
      return new Response(JSON.stringify({ error: `Slug kota "${loc.slug}" sudah dipakai` }), { status: 400 });
    }
  }

  const serviceId = await createServiceWithLocations(
    { name, slug, shortDescription, content, icon, faq },
    locations,
    packages
  );

  return new Response(JSON.stringify({ success: true, id: serviceId }), { status: 201 });
};