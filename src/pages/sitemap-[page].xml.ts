import type { APIRoute } from 'astro';
import { collectAllUrls } from '@/lib/sitemap/collect-urls';

const CHUNK_SIZE = 1000;

export const GET: APIRoute = async ({ params, site, url }) => {
  const pageNum = parseInt(params.page ?? '1', 10);

  if (!pageNum || pageNum < 1) {
    return new Response('Not found', { status: 404 });
  }

  const baseUrl = site?.origin ?? url.origin;
  const allUrls = await collectAllUrls(baseUrl);

  const start = (pageNum - 1) * CHUNK_SIZE;
  const chunk = allUrls.slice(start, start + CHUNK_SIZE);

  if (chunk.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const urlEntries = chunk
    .map((u) => {
      const lastmodTag = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '';
      return `  <url><loc>${u.loc}</loc>${lastmodTag}</url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};