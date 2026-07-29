import { ulid } from 'ulid';
import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema/leads';

const PER_PAGE = 15;

export async function createLead(input: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
}) {
  const id = ulid();

  await db.insert(leads).values({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    service: input.service,
    message: input.message,
  });

  return id;
}

export async function getLeadsPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult, unreadResult] = await Promise.all([
    db.query.leads.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: desc(leads.createdAt),
    }),
    db.select({ value: count() }).from(leads),
    db.select({ value: count() }).from(leads).where(eq(leads.isRead, false)),
  ]);

  const total = totalResult[0]?.value ?? 0;
  const unread = unreadResult[0]?.value ?? 0;

  return {
    items,
    total,
    unread,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function markLeadAsRead(id: string) {
  await db.update(leads).set({ isRead: true }).where(eq(leads.id, id));
}

export async function deleteLead(id: string) {
  await db.delete(leads).where(eq(leads.id, id));
}