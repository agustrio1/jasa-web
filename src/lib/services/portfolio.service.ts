import { ulid } from 'ulid';
import { eq, ne, and, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema/portfolio';

const PER_PAGE = 10;

export async function getPublishedPortfolios() {
  return db.query.portfolios.findMany({
    where: eq(portfolios.isPublished, true),
    orderBy: (p, { asc }) => [asc(p.sortOrder), desc(p.createdAt)],
  });
}

export async function getFeaturedPortfolios(limit: number = 3) {
  return db.query.portfolios.findMany({
    where: and(eq(portfolios.isPublished, true), eq(portfolios.isFeatured, true)),
    orderBy: (p, { asc }) => [asc(p.sortOrder)],
    limit,
  });
}

export async function getPortfoliosPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.portfolios.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    }),
    db.select({ value: count() }).from(portfolios),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function getPortfolioBySlug(slug: string) {
  return db.query.portfolios.findFirst({
    where: and(eq(portfolios.slug, slug), eq(portfolios.isPublished, true)),
  });
}

export async function getPortfolioById(id: string) {
  return db.query.portfolios.findFirst({ where: eq(portfolios.id, id) });
}

export async function isPortfolioSlugTaken(slug: string, excludeId?: string) {
  const row = await db.query.portfolios.findFirst({
    where: excludeId ? and(eq(portfolios.slug, slug), ne(portfolios.id, excludeId)) : eq(portfolios.slug, slug),
  });
  return !!row;
}

export async function createPortfolio(input: {
  title: string;
  slug: string;
  clientName?: string;
  category?: string;
  coverImage?: string;
  content?: unknown;
  technologies?: string[];
  projectUrl?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
}) {
  const id = ulid();

  await db.insert(portfolios).values({
    id,
    title: input.title,
    slug: input.slug,
    clientName: input.clientName,
    category: input.category,
    coverImage: input.coverImage,
    content: input.content,
    technologies: input.technologies,
    projectUrl: input.projectUrl,
    isFeatured: input.isFeatured ?? false,
    isPublished: input.isPublished ?? true,
  });

  return id;
}

export async function updatePortfolio(
  id: string,
  input: {
    title: string;
    slug: string;
    clientName?: string;
    category?: string;
    coverImage?: string;
    content?: unknown;
    technologies?: string[];
    projectUrl?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
  }
) {
  await db.update(portfolios).set({
    title: input.title,
    slug: input.slug,
    clientName: input.clientName,
    category: input.category,
    coverImage: input.coverImage,
    content: input.content,
    technologies: input.technologies,
    projectUrl: input.projectUrl,
    isFeatured: input.isFeatured ?? false,
    isPublished: input.isPublished ?? true,
    updatedAt: new Date(),
  }).where(eq(portfolios.id, id));
}

export async function deletePortfolio(id: string) {
  await db.delete(portfolios).where(eq(portfolios.id, id));
}