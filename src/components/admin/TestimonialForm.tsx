import { useState } from 'react';
import ImageField from './ImageField';

type Props = {
  initial?: {
    id?: string;
    name: string;
    role: string;
    company: string;
    quote: string;
    avatar: string;
    rating: number;
    isFeatured: boolean;
    isPublished: boolean;
  };
};

export default function TestimonialForm({ initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [company, setCompany] = useState(initial?.company ?? '');
  const [quote, setQuote] = useState(initial?.quote ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const endpoint = initial?.id ? `/api/admin/testimonials/${initial.id}` : '/api/admin/testimonials';
    const method = initial?.id ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, company, quote, avatar, rating, isFeatured, isPublished }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Gagal menyimpan');
      setSaving(false);
      return;
    }

    window.location.href = '/admin/testimonials';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama klien"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Jabatan (opsional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Perusahaan (opsional)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Isi testimoni"
        rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />

      <div>
        <label className="text-sm font-medium text-gray-700">Foto (opsional)</label>
        <div className="mt-2">
          <ImageField value={avatar} onChange={setAvatar} placeholder="URL foto" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
          className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} bintang</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Tampilkan di homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publikasikan
        </label>
      </div>

      <button type="submit" disabled={saving}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}