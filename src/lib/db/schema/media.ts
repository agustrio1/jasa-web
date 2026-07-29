import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  alt: text('alt'),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});