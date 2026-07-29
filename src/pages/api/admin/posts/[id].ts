import type { APIRoute } from 'astro';
import { eq, ne, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema/blog';
import { updatePost, deletePost } from '@/lib/services/post.service';
import { postInputSchema, formatZodError } from '@/lib/validation/schemas';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const postId = params.id!;

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

  const slugTaken = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), ne(posts.id, postId)),
  });
  if (slugTaken) {
    return new Response(JSON.stringify({ error: 'Slug sudah dipakai' }), { status: 400 });
  }

  await updatePost(
    postId,
    { title, slug, excerpt, content, coverImage, categoryId: categoryId || undefined, faq, isPublished },
    tagIds
  );

  return new Response(JSON.stringify({ success: true }));
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await deletePost(params.id!);

  return new Response(JSON.stringify({ success: true }));
};