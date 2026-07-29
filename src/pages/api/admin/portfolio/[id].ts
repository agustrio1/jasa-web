import type { APIRoute } from 'astro';
import { updatePortfolio, deletePortfolio, isPortfolioSlugTaken } from '@/lib/services/portfolio.service';
import { portfolioInputSchema, formatZodError } from '@/lib/validation/schemas';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = params.id!;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body tidak valid' }), { status: 400 });
  }

  const parsed = portfolioInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  if (await isPortfolioSlugTaken(parsed.data.slug, id)) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  await updatePortfolio(id, parsed.data);

  return new Response(JSON.stringify({ success: true }));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await deletePortfolio(params.id!);

  return new Response(JSON.stringify({ success: true }));
};