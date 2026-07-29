import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema/blog';
import { createPost } from '@/lib/services/post.service';
import { postInputSchema, formatZodError } from '@/lib/validation/schemas';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Request body tidak valid' }), { status: 400 });
  }

  const parsed = postInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: formatZodError(parsed.error) }), { status: 400 });
  }

  const { title, slug, excerpt, content, coverImage, categoryId, tagIds, faq, isPublished } = parsed.data;

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (existing) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  const postId = await createPost(
    { title, slug, excerpt, content, coverImage, categoryId: categoryId || undefined, faq, isPublished },
    tagIds
  );

  return new Response(JSON.stringify({ success: true, id: postId }), { status: 201 });
};