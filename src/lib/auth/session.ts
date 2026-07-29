import { randomBytes } from 'node:crypto';
import { ulid } from 'ulid';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const id = ulid();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ id, userId, expiresAt });

  return { token: `${id}.${token}`, expiresAt };
}

export async function validateSession(rawToken: string) {
  const [id] = rawToken.split('.');
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}