import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { seoMeta } from '@/lib/db/schema/seo';

type SeoFallback = {
  title: string;
  description: string;
  ogImage?: string;
};

export async function resolveSeo(entityType: string, entityId: string, fallback: SeoFallback) {
  const override = await db.query.seoMeta.findFirst({
    where: and(eq(seoMeta.entityType, entityType), eq(seoMeta.entityId, entityId)),
  });

  return {
    title: override?.metaTitle ?? fallback.title,
    description: override?.metaDescription ?? fallback.description,
    ogImage: override?.ogImage ?? fallback.ogImage,
    canonicalUrl: override?.canonicalUrl,
    noIndex: override?.noIndex === 'true',
  };
}