import { useState } from 'react';
import RichEditor from './RichEditor';
import ImageField from './ImageField';

type Props = {
  initial?: {
    id?: string;
    title: string;
    slug: string;
    clientName: string;
    category: string;
    coverImage: string;
    content: unknown;
    technologies: string[];
    projectUrl: string;
    isFeatured: boolean;
    isPublished: boolean;
  };
};

export default function PortfolioForm({ initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [clientName, setClientName] = useState(initial?.clientName ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '');
  const [content, setContent] = useState<unknown>(initial?.content ?? '');
  const [technologies, setTechnologies] = useState<string[]>(initial?.technologies ?? []);
  const [techInput, setTechInput] = useState('');
  const [projectUrl, setProjectUrl] = useState(initial?.projectUrl ?? '');
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addTech() {
    const value = techInput.trim();
    if (value && !technologies.includes(value)) {
      setTechnologies([...technologies, value]);
    }
    setTechInput('');
  }

  function removeTech(tech: string) {
    setTechnologies(technologies.filter((t) => t !== tech));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const endpoint = initial?.id ? `/api/admin/portfolio/${initial.id}` : '/api/admin/portfolio';
    const method = initial?.id ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, slug, clientName, category, coverImage, content, technologies, projectUrl, isFeatured, isPublished,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Gagal menyimpan');
      setSaving(false);
      return;
    }

    window.location.href = '/admin/portfolio';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul proyek"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nama klien"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori (mis. E-commerce)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Cover Image</label>
        <div className="mt-2">
          <ImageField value={coverImage} onChange={setCoverImage} />
        </div>
      </div>

      <input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="URL live proyek (opsional)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <div>
        <label className="text-sm font-medium text-gray-700">Teknologi yang dipakai</label>
        <div className="mt-2 flex gap-2">
          <input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTech();
              }
            }}
            placeholder="mis. Astro, Tailwind — tekan Enter"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="button" onClick={addTech} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600">
            + Tambah
          </button>
        </div>
        {technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span key={tech} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} className="text-gray-400 hover:text-red-600">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Deskripsi Proyek</label>
        <div className="mt-2">
          <RichEditor content={content} onChange={setContent} />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Tampilkan sebagai unggulan
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