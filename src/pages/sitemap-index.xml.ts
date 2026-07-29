import type { APIRoute } from 'astro';
import { collectAllUrls } from '@/lib/sitemap/collect-urls';

const CHUNK_SIZE = 1000;

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site?.origin ?? url.origin;
  const urls = await collectAllUrls(baseUrl);
  const totalChunks = Math.max(1, Math.ceil(urls.length / CHUNK_SIZE));

  const sitemapEntries = Array.from({ length: totalChunks }, (_, i) => {
    return `  <sitemap><loc>${baseUrl}/sitemap-${i + 1}.xml</loc></sitemap>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};