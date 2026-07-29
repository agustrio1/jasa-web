import { generateSecret, generate, verify, generateURI } from 'otplib';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { encrypt, decrypt } from '@/lib/crypto/encryption';

export function generateTwoFactorSecret() {
  return generateSecret();
}

export function getTwoFactorKeyUri(email: string, secret: string) {
  return generateURI({
    secret,
    issuer: 'Jasa Website',
    label: email,
  });
}

export async function enableTwoFactor(userId: string, secret: string) {
  const encryptedSecret = await encrypt(secret);

  await db
    .update(users)
    .set({ twoFactorEnabled: true, twoFactorSecret: encryptedSecret, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function disableTwoFactor(userId: string) {
  await db
    .update(users)
    .set({ twoFactorEnabled: false, twoFactorSecret: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function verifyTwoFactorForUser(userId: string, token: string): Promise<boolean> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) return false;

  const secret = await decrypt(user.twoFactorSecret);
  const result = await verify({ secret, token });
  return result.valid;
}

export async function verifyTwoFactorToken(token: string, secret: string): Promise<boolean> {
  const result = await verify({ secret, token });
  return result.valid;
}

export async function generateTwoFactorToken(secret: string): Promise<string> {
  return generate({ secret });
}