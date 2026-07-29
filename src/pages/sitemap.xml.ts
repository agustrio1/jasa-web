import type { APIRoute } from 'astro';
import { db } from '@/lib/db';

export const GET: APIRoute = async ({ site }) => {
  const [allServices, allLocations, allPosts, allCategories, allTags] = await Promise.all([
    db.query.services.findMany(),
    db.query.serviceLocations.findMany(),
    db.query.posts.findMany({ where: (p, { eq }) => eq(p.isPublished, true) }),
    db.query.categories.findMany(),
    db.query.tags.findMany(),
  ]);

  const baseUrl = site?.origin ?? 'https://jasaweb.nexarostudio.com';

  const urls = [
    baseUrl,
    ...allServices.map((s) => `${baseUrl}/layanan/${s.slug}`),
    ...allLocations.map((l) => `${baseUrl}/layanan/${l.slug}`),
    ...allPosts.map((p) => `${baseUrl}/blog/${p.slug}`),
    ...allCategories.map((c) => `${baseUrl}/blog/kategori/${c.slug}`),
    ...allTags.map((t) => `${baseUrl}/blog/tag/${t.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};