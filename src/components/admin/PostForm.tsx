import { useState } from 'react';
import RichEditor from './RichEditor';
import ImageField from './ImageField';

type Option = { id: string; name: string };
type FaqItem = { question: string; answer: string };

type Props = {
  categories: Option[];
  tags: Option[];
  initial?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: unknown;
    coverImage: string;
    categoryId: string;
    tagIds: string[];
    faq: FaqItem[];
    isPublished: boolean;
  };
};

export default function PostForm({ categories, tags, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [content, setContent] = useState<unknown>(initial?.content ?? '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function addFaq() {
    setFaq([...faq, { question: '', answer: '' }]);
  }

  function updateFaq(index: number, field: keyof FaqItem, value: string) {
    const next = [...faq];
    next[index] = { ...next[index], [field]: value };
    setFaq(next);
  }

  function removeFaq(index: number) {
    setFaq(faq.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const endpoint = initial?.id ? `/api/admin/posts/${initial.id}` : '/api/admin/posts';
    const method = initial?.id ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, slug, excerpt, content, coverImage, categoryId, tagIds, faq, isPublished,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Gagal menyimpan');
      setSaving(false);
      return;
    }

    window.location.href = '/admin/posts';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />

      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />

      <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Ringkasan"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <div>
        <label className="text-sm font-medium text-gray-700">Cover Image</label>
        <div className="mt-2">
          <ImageField value={coverImage} onChange={setCoverImage} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">Tanpa kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
              className={`rounded-full border px-3 py-1 text-xs ${
                tagIds.includes(t.id) ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600'
              }`}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Konten</label>
        <div className="mt-2">
          <RichEditor content={content} onChange={setContent} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">FAQ (opsional, buat JSON-LD)</label>
          <button type="button" onClick={addFaq} className="text-sm text-blue-600 hover:underline">
            + Tambah FAQ
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
              <input value={item.question} onChange={(e) => updateFaq(i, 'question', e.target.value)}
                placeholder="Pertanyaan" className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <textarea value={item.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                placeholder="Jawaban" className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <button type="button" onClick={() => removeFaq(i)}
                className="text-xs text-red-600 hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        Publikasikan
      </label>

      <button type="submit" disabled={saving}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}