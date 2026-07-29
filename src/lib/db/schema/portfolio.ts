import { pgTable, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const portfolios = pgTable('portfolios', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  clientName: text('client_name'),
  category: text('category'),
  coverImage: text('cover_image'),
  content: jsonb('content'),
  technologies: jsonb('technologies'),
  projectUrl: text('project_url'),
  isFeatured: boolean('is_featured').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});