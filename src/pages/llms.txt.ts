import type { APIRoute } from 'astro';
import { getAllServices } from '@/lib/services/service.service';
import { getPublishedPosts } from '@/lib/services/post.service';
import { getPublishedPortfolios } from '@/lib/services/portfolio.service';
import { getSettings } from '@/lib/services/settings.service';

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site?.origin ?? url.origin;

  const [services, posts, portfolios, settings] = await Promise.all([
    getAllServices(),
    getPublishedPosts(),
    getPublishedPortfolios(),
    getSettings(['site_name', 'site_default_meta_description']),
  ]);

  const siteName = settings.site_name || 'Nexaro Studio';
  const description = settings.site_default_meta_description || 'Jasa pembuatan website profesional untuk bisnis di berbagai kota.';

  const serviceLines = services
    .map((s) => `- [${s.name}](${baseUrl}/layanan/${s.slug})${s.shortDescription ? `: ${s.shortDescription}` : ''}`)
    .join('\n');

  const postLines = posts
    .slice(0, 30)
    .map((p) => `- [${p.title}](${baseUrl}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ''}`)
    .join('\n');

  const portfolioLines = portfolios
    .slice(0, 30)
    .map((p) => `- [${p.title}](${baseUrl}/portfolio/${p.slug})${p.category ? ` (${p.category})` : ''}`)
    .join('\n');

  const content = `# ${siteName}

> ${description}

## Layanan

${serviceLines || '- Belum ada layanan yang dipublikasikan.'}

## Portofolio

${portfolioLines || '- Belum ada proyek yang dipublikasikan.'}

## Blog

${postLines || '- Belum ada artikel yang dipublikasikan.'}

## Halaman Lain

- [Beranda](${baseUrl}/)
- [Semua Layanan](${baseUrl}/layanan)
- [Semua Portofolio](${baseUrl}/portfolio)
- [Semua Blog](${baseUrl}/blog)
- [Kontak](${baseUrl}/kontak)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  });
};