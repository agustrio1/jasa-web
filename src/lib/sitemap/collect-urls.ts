import { db } from '@/lib/db';

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

export async function collectAllUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const [allServices, allLocations, allPosts, allCategories, allTags, allPortfolios] = await Promise.all([
    db.query.services.findMany({ where: (s, { eq }) => eq(s.isActive, true) }),
    db.query.serviceLocations.findMany({ where: (l, { eq }) => eq(l.isActive, true) }),
    db.query.posts.findMany({ where: (p, { eq }) => eq(p.isPublished, true) }),
    db.query.categories.findMany(),
    db.query.tags.findMany(),
    db.query.portfolios.findMany({ where: (p, { eq }) => eq(p.isPublished, true) }),
  ]);

  const urls: SitemapUrl[] = [
    { loc: baseUrl },
    { loc: `${baseUrl}/layanan` },
    { loc: `${baseUrl}/blog` },
    { loc: `${baseUrl}/portfolio` },
    { loc: `${baseUrl}/kontak` },
    ...allServices.map((s) => ({
      loc: `${baseUrl}/layanan/${s.slug}`,
      lastmod: s.updatedAt.toISOString(),
    })),
    ...allLocations.map((l) => ({
      loc: `${baseUrl}/layanan/${l.slug}`,
      lastmod: l.updatedAt.toISOString(),
    })),
    ...allPosts.map((p) => ({
      loc: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
    })),
    ...allCategories.map((c) => ({ loc: `${baseUrl}/blog/kategori/${c.slug}` })),
    ...allTags.map((t) => ({ loc: `${baseUrl}/blog/tag/${t.slug}` })),
    ...allPortfolios.map((p) => ({
      loc: `${baseUrl}/portfolio/${p.slug}`,
      lastmod: p.updatedAt.toISOString(),
    })),
  ];

  return urls;
}