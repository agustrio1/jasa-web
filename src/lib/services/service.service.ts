import { ulid } from 'ulid';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { services, serviceLocations, servicePackages } from '@/lib/db/schema/services';

const PER_PAGE = 10;

type PackageInput = {
  id?: string;
  name: string;
  price: string;
  priceNote?: string;
  features?: string[];
  isPopular?: boolean;
};

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
    with: {
      locations: true,
      packages: { orderBy: (p, { asc }) => [asc(p.sortOrder)] },
    },
  });
}

export async function getServiceLocationBySlug(fullSlug: string) {
  return db.query.serviceLocations.findFirst({
    where: and(eq(serviceLocations.slug, fullSlug), eq(serviceLocations.isActive, true)),
    with: {
      service: {
        with: { packages: { orderBy: (p, { asc }) => [asc(p.sortOrder)] } },
      },
    },
  });
}

export async function getFeaturedPackages(limit: number = 6) {
  const allServices = await db.query.services.findMany({
    where: eq(services.isActive, true),
    with: { packages: { orderBy: (p, { asc }) => [asc(p.sortOrder)] } },
  });

  const flattened = allServices.flatMap((s) =>
    s.packages.map((pkg) => ({ ...pkg, serviceName: s.name, serviceSlug: s.slug }))
  );

  const popular = flattened.filter((p) => p.isPopular);
  const rest = flattened.filter((p) => !p.isPopular);

  return [...popular, ...rest].slice(0, limit);
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

export async function createServiceWithLocations(
  input: { name: string; slug: string; shortDescription?: string; content?: unknown; icon?: string },
  locations: Array<{ city: string; slug: string; metaTitle?: string; metaDescription?: string }>,
  packages: PackageInput[] = []
) {
  const serviceId = ulid();

  await db.insert(services).values({
    id: serviceId,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    content: input.content,
    icon: input.icon,
  });

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

  if (packages.length > 0) {
    await db.insert(servicePackages).values(
      packages.map((pkg, index) => ({
        id: ulid(),
        serviceId,
        name: pkg.name,
        price: pkg.price,
        priceNote: pkg.priceNote,
        features: pkg.features ?? [],
        isPopular: pkg.isPopular ?? false,
        sortOrder: index,
      }))
    );
  }

  return serviceId;
}

export async function updateServiceWithLocations(
  serviceId: string,
  input: { name: string; slug: string; shortDescription?: string; content?: unknown; icon?: string },
  locations: Array<{ id?: string; city: string; slug: string; metaTitle?: string; metaDescription?: string }>,
  packages: PackageInput[] = []
) {
  await db.update(services).set({
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    content: input.content,
    icon: input.icon,
    updatedAt: new Date(),
  }).where(eq(services.id, serviceId));

  await db.delete(serviceLocations).where(eq(serviceLocations.serviceId, serviceId));

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

  await db.delete(servicePackages).where(eq(servicePackages.serviceId, serviceId));

  if (packages.length > 0) {
    await db.insert(servicePackages).values(
      packages.map((pkg, index) => ({
        id: ulid(),
        serviceId,
        name: pkg.name,
        price: pkg.price,
        priceNote: pkg.priceNote,
        features: pkg.features ?? [],
        isPopular: pkg.isPopular ?? false,
        sortOrder: index,
      }))
    );
  }
}

export async function deleteService(id: string) {
  await db.delete(services).where(eq(services.id, id));
}