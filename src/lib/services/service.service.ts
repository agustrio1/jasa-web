import { ulid } from 'ulid';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { services, serviceLocations } from '@/lib/db/schema/services';

const PER_PAGE = 10;

export async function getAllServices() {
  return db.query.services.findMany({
    where: eq(services.isActive, true),
    orderBy: (s, { asc }) => [asc(s.sortOrder)],
    with: { locations: true },
  });
}


export async function getServicesPaginated(page: number) {
  const offset = (page - 1) * PER_PAGE;

  const [items, totalResult] = await Promise.all([
    db.query.services.findMany({
      limit: PER_PAGE,
      offset,
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      with: { locations: true },
    }),
    db.select({ value: count() }).from(services),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    items,
    total,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
    page,
  };
}

export async function getServiceBySlug(slug: string) {
  return db.query.services.findFirst({
    where: and(eq(services.slug, slug), eq(services.isActive, true)),
    with: { locations: true },
  });
}

export async function getServiceLocationBySlug(fullSlug: string) {
  return db.query.serviceLocations.findFirst({
    where: and(eq(serviceLocations.slug, fullSlug), eq(serviceLocations.isActive, true)),
    with: { service: true },
  });
}

export async function isSlugTaken(slug: string, excludeId?: string) {
  const [existingService, existingLocation] = await Promise.all([
    db.query.services.findFirst({ where: eq(services.slug, slug) }),
    db.query.serviceLocations.findFirst({ where: eq(serviceLocations.slug, slug) }),
  ]);

  if (existingService && existingService.id !== excludeId) return true;
  if (existingLocation && existingLocation.id !== excludeId) return true;
  return false;
}

// PERBAIKAN: Menggunakan eksekusi sekuensial non-transaksi untuk neon-http
export async function createServiceWithLocations(
  input: { name: string; slug: string; shortDescription?: string; content?: unknown; icon?: string },
  locations: Array<{ city: string; slug: string; metaTitle?: string; metaDescription?: string }>
) {
  const serviceId = ulid();

  // 1. Insert data service utama terlebih dahulu
  await db.insert(services).values({
    id: serviceId,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    content: input.content,
    icon: input.icon,
  });

  // 2. Jika ada lokasi, lakukan insert bulk data lokasi
  if (locations.length > 0) {
    await db.insert(serviceLocations).values(
      locations.map((loc) => ({
        id: ulid(),
        serviceId,
        city: loc.city,
        slug: loc.slug,
        metaTitle: loc.metaTitle,
        metaDescription: loc.metaDescription,
      }))
    );
  }

  return serviceId;
}

// PERBAIKAN: Menggunakan eksekusi sekuensial non-transaksi untuk neon-http
export async function updateServiceWithLocations(
  serviceId: string,
  input: { name: string; slug: string; shortDescription?: string; content?: unknown; icon?: string },
  locations: Array<{ id?: string; city: string; slug: string; metaTitle?: string; metaDescription?: string }>
) {
  // 1. Update data utama layanan
  await db.update(services).set({
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    content: input.content,
    icon: input.icon,
    updatedAt: new Date(),
  }).where(eq(services.id, serviceId));

  // 2. Hapus relasi lokasi lama
  await db.delete(serviceLocations).where(eq(serviceLocations.serviceId, serviceId));

  // 3. Masukkan relasi lokasi yang baru diperbarui
  if (locations.length > 0) {
    await db.insert(serviceLocations).values(
      locations.map((loc) => ({
        id: ulid(),
        serviceId,
        city: loc.city,
        slug: loc.slug,
        metaTitle: loc.metaTitle,
        metaDescription: loc.metaDescription,
      }))
    );
  }
}

export async function deleteService(id: string) {
  await db.delete(services).where(eq(services.id, id));
}
