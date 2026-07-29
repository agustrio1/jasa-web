import type { APIRoute } from 'astro';
import { createPortfolio, isPortfolioSlugTaken } from '@/lib/services/portfolio.service';
import { portfolioInputSchema, formatZodError } from '@/lib/validation/schemas';

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

  const parsed = portfolioInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  if (await isPortfolioSlugTaken(parsed.data.slug)) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  const id = await createPortfolio(parsed.data);

  return new Response(JSON.stringify({ success: true, id }), { status: 201 });
};