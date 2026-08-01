import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema/leads';
import { toCsv } from '@/lib/csv/export';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const allLeads = await db.query.leads.findMany({
    orderBy: (l, { desc }) => [desc(l.createdAt)],
  });

  const csv = toCsv(
    allLeads.map((l) => ({
      ...l,
      createdAt: new Date(l.createdAt).toLocaleString('id-ID'),
      isRead: l.isRead ? 'Sudah dibaca' : 'Belum dibaca',
    })),
    [
      { key: 'name', label: 'Nama' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telepon' },
      { key: 'service', label: 'Layanan' },
      { key: 'message', label: 'Pesan' },
      { key: 'isRead', label: 'Status' },
      { key: 'createdAt', label: 'Tanggal' },
    ]
  );

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
};