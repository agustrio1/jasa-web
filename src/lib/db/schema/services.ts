import { pgTable, text, boolean, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description'),
  content: jsonb('content'),
  icon: text('icon'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const serviceLocations = pgTable('service_locations', {
  id: text('id').primaryKey(),
  serviceId: text('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  city: text('city').notNull(),
  slug: text('slug').notNull().unique(),
  contentOverride: jsonb('content_override'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  locations: many(serviceLocations),
}));

export const serviceLocationsRelations = relations(serviceLocations, ({ one }) => ({
  service: one(services, {
    fields: [serviceLocations.serviceId],
    references: [services.id],
  }),
}));