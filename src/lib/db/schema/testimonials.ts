import { pgTable, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  quote: text('quote').notNull(),
  avatar: text('avatar'),
  rating: integer('rating').notNull().default(5),
  isFeatured: boolean('is_featured').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});