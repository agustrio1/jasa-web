import { ulid } from 'ulid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { media } from '@/lib/db/schema/media';

export async function saveMediaRecord(input: {
  fileId: string; url: string; thumbnailUrl?: string;
  fileName: string; fileType: string; size: number; alt?: string;
}) {
  const id = ulid();
  await db.insert(media).values({ id, ...input });
  return id;
}

export async function deleteMediaRecord(id: string) {
  await db.delete(media).where(eq(media.id, id));
}

export async function getAllMedia() {
  return db.query.media.findMany({ orderBy: (m, { desc }) => [desc(m.createdAt)] });
}