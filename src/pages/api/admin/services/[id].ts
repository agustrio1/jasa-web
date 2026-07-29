import type { APIRoute } from 'astro';
import { updateServiceWithLocations, deleteService, isSlugTaken } from '@/lib/services/service.service';
import { serviceInputSchema, formatZodError } from '@/lib/validation/schemas';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const serviceId = params.id!;

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

  const { name, slug, shortDescription, content, icon, locations } = parsed.data;

  if (await isSlugTaken(slug, serviceId)) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  for (const loc of locations) {
    if (await isSlugTaken(loc.slug, loc.id)) {
      return new Response(JSON.stringify({ error: `Slug kota "${loc.slug}" sudah dipakai` }), { status: 400 });
    }
  }

  await updateServiceWithLocations(serviceId, { name, slug, shortDescription, content, icon }, locations);

  return new Response(JSON.stringify({ success: true }));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await deleteService(params.id!);

  return new Response(JSON.stringify({ success: true }));
};