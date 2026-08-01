import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema/testimonials';
import { toCsv } from '@/lib/csv/export';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const allTestimonials = await db.query.testimonials.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  const csv = toCsv(
    allTestimonials.map((t) => ({
      ...t,
      isPublished: t.isPublished ? 'Terbit' : 'Draft',
      isFeatured: t.isFeatured ? 'Ya' : 'Tidak',
      createdAt: new Date(t.createdAt).toLocaleString('id-ID'),
    })),
    [
      { key: 'name', label: 'Nama' },
      { key: 'role', label: 'Jabatan' },
      { key: 'company', label: 'Perusahaan' },
      { key: 'quote', label: 'Testimoni' },
      { key: 'rating', label: 'Rating' },
      { key: 'isFeatured', label: 'Homepage' },
      { key: 'isPublished', label: 'Status' },
      { key: 'createdAt', label: 'Tanggal' },
    ]
  );

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="testimoni-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
};