import { ulid } from 'ulid';
import { db } from '@/lib/db';
import { rateLimits } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export async function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = new Date();
  const existing = await db.query.rateLimits.findFirst({
    where: eq(rateLimits.key, key),
  });

  if (!existing || existing.resetAt < now) {
    const resetAt = new Date(now.getTime() + windowMs);
    if (existing) {
      await db.update(rateLimits)
        .set({ count: '1', resetAt })
        .where(eq(rateLimits.key, key));
    } else {
      await db.insert(rateLimits).values({ id: ulid(), key, count: '1', resetAt });
    }
    return { allowed: true, remaining: limit - 1 };
  }

  const currentCount = parseInt(existing.count, 10);
  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  await db.update(rateLimits)
    .set({ count: String(currentCount + 1) })
    .where(eq(rateLimits.key, key));

  return { allowed: true, remaining: limit - currentCount - 1 };
}