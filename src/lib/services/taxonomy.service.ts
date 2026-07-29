import { ulid } from 'ulid';
import { eq, ne, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, tags } from '@/lib/db/schema/blog';

const PER_PAGE = 10;

export async function getAllCategories() {
  return db.query.categories.findMany();
}

export async function getCategoriesPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.categories.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    }),
    db.select({ value: count() }).from(categories),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function createCategory(name: string, slug: string, description?: string) {
  const id = ulid();
  await db.insert(categories).values({ id, name, slug, description });
  return id;
}

export async function updateCategory(id: string, name: string, slug: string, description?: string) {
  await db.update(categories)
    .set({ name, slug, description })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

export async function isCategorySlugTaken(slug: string, excludeId?: string) {
  const row = await db.query.categories.findFirst({
    where: excludeId ? and(eq(categories.slug, slug), ne(categories.id, excludeId)) : eq(categories.slug, slug),
  });
  return !!row;
}

export async function getAllTags() {
  return db.query.tags.findMany();
}

export async function getTagsPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.tags.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    }),
    db.select({ value: count() }).from(tags),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function createTag(name: string, slug: string) {
  const id = ulid();
  await db.insert(tags).values({ id, name, slug });
  return id;
}

export async function updateTag(id: string, name: string, slug: string) {
  await db.update(tags)
    .set({ name, slug })
    .where(eq(tags.id, id));
}

export async function deleteTag(id: string) {
  await db.delete(tags).where(eq(tags.id, id));
}

export async function isTagSlugTaken(slug: string, excludeId?: string) {
  const row = await db.query.tags.findFirst({
    where: excludeId ? and(eq(tags.slug, slug), ne(tags.id, excludeId)) : eq(tags.slug, slug),
  });
  return !!row;
}