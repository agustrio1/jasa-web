import 'dotenv/config';
import { ulid } from 'ulid';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { hashPassword } from '@/lib/auth/password';

async function seedAdmin() {
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi via env');
    process.exit(1);
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log(`Admin dengan email ${email} sudah ada, dilewati.`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id: ulid(),
    name,
    email,
    passwordHash,
  });

  console.log(`Admin berhasil dibuat: ${email}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Gagal membuat admin:', err);
  process.exit(1);
});