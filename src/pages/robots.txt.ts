import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site?.origin ?? 'https://jasaweb.nexarostudio.com';

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};