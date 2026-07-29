import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  twoFactorToken: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(200),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().trim().max(30).optional(),
  service: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

const locationInputSchema = z.object({
  id: z.string().optional(),
  city: z.string().trim().min(1, 'Nama kota wajib diisi'),
  slug: z.string().trim().min(1, 'Slug kota wajib diisi'),
  metaTitle: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
});

const packageInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Nama paket wajib diisi').max(100),
  price: z.string().trim().min(1, 'Harga wajib diisi').max(50),
  priceNote: z.string().trim().max(100).optional(),
  features: z.array(z.string()).default([]),
  isPopular: z.boolean().default(false),
});

export const serviceInputSchema = z.object({
  name: z.string().trim().min(1, 'Nama layanan wajib diisi').max(200),
  slug: z.string().trim().min(1, 'Slug wajib diisi').max(200),
  shortDescription: z.string().trim().max(500).optional(),
  content: z.unknown().optional(),
  icon: z.string().trim().max(300).optional(),
  locations: z.array(locationInputSchema).default([]),
  packages: z.array(packageInputSchema).default([]),
});

export const postInputSchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(300),
  slug: z.string().trim().min(1, 'Slug wajib diisi').max(300),
  excerpt: z.string().trim().max(500).optional(),
  content: z.unknown().optional(),
  coverImage: z.string().trim().max(1000).optional(),
  categoryId: z.string().trim().optional(),
  tagIds: z.array(z.string()).default([]),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  isPublished: z.boolean().default(false),
});

export const portfolioInputSchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(300),
  slug: z.string().trim().min(1, 'Slug wajib diisi').max(300),
  clientName: z.string().trim().max(200).optional(),
  category: z.string().trim().max(200).optional(),
  coverImage: z.string().trim().max(1000).optional(),
  content: z.unknown().optional(),
  technologies: z.array(z.string()).default([]),
  projectUrl: z.string().trim().max(1000).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Data yang dikirim tidak valid';
}