import { ulid } from 'ulid';
import { eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { hashPassword } from '@/lib/auth/password';

export async function getAllUsers() {
  return db.query.users.findMany({
    orderBy: (u, { asc }) => [asc(u.createdAt)],
  });
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function createAdminUser(name: string, email: string, password: string) {
  const existing = await getUserByEmail(email);
  if (existing) throw new Error('Email sudah terdaftar');

  const id = ulid();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({ id, name, email, passwordHash });

  return id;
}

export async function deleteUser(id: string, currentUserId: string) {
  if (id === currentUserId) throw new Error('Tidak bisa menghapus akun sendiri');
  await db.delete(users).where(eq(users.id, id));
}

export async function countUsers() {
  const rows = await db.query.users.findMany();
  return rows.length;
}