import { ulid } from 'ulid';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, postTags, categories, tags } from '@/lib/db/schema/blog';

const PER_PAGE = 10;

export async function getPublishedPosts() {
  return db.query.posts.findMany({
    where: eq(posts.isPublished, true),
    orderBy: desc(posts.publishedAt),
    with: { category: true, postTags: { with: { tag: true } } },
  });
}

export async function getPostsPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.posts.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      with: { category: true, postTags: { with: { tag: true } } },
    }),
    db.select({ value: count() }).from(posts),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function getPostBySlug(slug: string) {
  return db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.isPublished, true)),
    with: { category: true, postTags: { with: { tag: true } } },
  });
}

export async function getPostsByCategory(categorySlug: string) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  if (!category) return { category: null, posts: [] };

  const list = await db.query.posts.findMany({
    where: and(eq(posts.categoryId, category.id), eq(posts.isPublished, true)),
    orderBy: desc(posts.publishedAt),
  });

  return { category, posts: list };
}

export async function getPostsByTag(tagSlug: string) {
  const tag = await db.query.tags.findFirst({ where: eq(tags.slug, tagSlug) });
  if (!tag) return { tag: null, posts: [] };

  const relations = await db.query.postTags.findMany({
    where: eq(postTags.tagId, tag.id),
    with: { post: true },
  });

  return { tag, posts: relations.map((r) => r.post).filter((p) => p.isPublished) };
}

export async function createPost(
  input: {
    title: string; slug: string; excerpt?: string; content?: unknown;
    coverImage?: string; categoryId?: string; faq?: unknown; isPublished?: boolean;
  },
  tagIds: string[]
) {
  const postId = ulid();

  await db.insert(posts).values({
    id: postId,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    coverImage: input.coverImage,
    categoryId: input.categoryId,
    faq: input.faq,
    isPublished: input.isPublished ?? false,
    publishedAt: input.isPublished ? new Date() : null,
  });

  if (tagIds.length > 0) {
    await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
  }

  return postId;
}

export async function updatePost(
  postId: string,
  input: {
    title: string; slug: string; excerpt?: string; content?: unknown;
    coverImage?: string; categoryId?: string; faq?: unknown; isPublished?: boolean;
  },
  tagIds: string[]
) {
  await db.update(posts).set({
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    coverImage: input.coverImage,
    categoryId: input.categoryId,
    faq: input.faq,
    isPublished: input.isPublished ?? false,
    publishedAt: input.isPublished ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));

  await db.delete(postTags).where(eq(postTags.postId, postId));

  if (tagIds.length > 0) {
    await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}