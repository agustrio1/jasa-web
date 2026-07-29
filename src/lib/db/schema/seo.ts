import { pgTable, text } from 'drizzle-orm/pg-core';

export const seoMeta = pgTable('seo_meta', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'post' | 'service' | 'service_location' | 'page'
  entityId: text('entity_id').notNull(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  ogImage: text('og_image'),
  noIndex: text('no_index'),
});