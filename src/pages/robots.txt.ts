import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site, url }) => {
  const baseUrl = site?.origin ?? url.origin;

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap-index.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};