import { ulid } from 'ulid';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema/testimonials';

const PER_PAGE = 10;

export async function getFeaturedTestimonials(limit: number = 6) {
  return db.query.testimonials.findMany({
    where: and(eq(testimonials.isPublished, true), eq(testimonials.isFeatured, true)),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
    limit,
  });
}

export async function getTestimonialsPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.testimonials.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    }),
    db.select({ value: count() }).from(testimonials),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function getTestimonialById(id: string) {
  return db.query.testimonials.findFirst({ where: eq(testimonials.id, id) });
}

export async function createTestimonial(input: {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  avatar?: string;
  rating?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}) {
  const id = ulid();

  await db.insert(testimonials).values({
    id,
    name: input.name,
    role: input.role,
    company: input.company,
    quote: input.quote,
    avatar: input.avatar,
    rating: input.rating ?? 5,
    isFeatured: input.isFeatured ?? false,
    isPublished: input.isPublished ?? true,
  });

  return id;
}

export async function updateTestimonial(
  id: string,
  input: {
    name: string;
    role?: string;
    company?: string;
    quote: string;
    avatar?: string;
    rating?: number;
    isFeatured?: boolean;
    isPublished?: boolean;
  }
) {
  await db.update(testimonials).set({
    name: input.name,
    role: input.role,
    company: input.company,
    quote: input.quote,
    avatar: input.avatar,
    rating: input.rating ?? 5,
    isFeatured: input.isFeatured ?? false,
    isPublished: input.isPublished ?? true,
    updatedAt: new Date(),
  }).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: string) {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}