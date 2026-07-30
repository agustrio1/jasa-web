import { useState } from 'react';
import RichEditor from './RichEditor';
import ImageField from './ImageField';

type LocationInput = { city: string; slug: string; metaTitle: string; metaDescription: string };
type PackageInput = { name: string; price: string; priceNote: string; features: unknown; isPopular: boolean };
type FaqInput = { question: string; answer: string };

type Props = {
  initial?: {
    id?: string;
    name: string;
    slug: string;
    shortDescription: string;
    content: unknown;
    icon: string;
    locations: LocationInput[];
    packages: PackageInput[];
    faq: FaqInput[];
  };
};

export default function ServiceForm({ initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [content, setContent] = useState<unknown>(initial?.content ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [locations, setLocations] = useState<LocationInput[]>(initial?.locations ?? []);
  const [packages, setPackages] = useState<PackageInput[]>(initial?.packages ?? []);
  const [faq, setFaq] = useState<FaqInput[]>(initial?.faq ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addLocation() {
    setLocations([...locations, { city: '', slug: '', metaTitle: '', metaDescription: '' }]);
  }

  function updateLocation(index: number, field: keyof LocationInput, value: string) {
    const next = [...locations];
    next[index] = { ...next[index], [field]: value };
    setLocations(next);
  }

  function removeLocation(index: number) {
    setLocations(locations.filter((_, i) => i !== index));
  }

  function addPackage() {
    setPackages([...packages, { name: '', price: '', priceNote: '', features: '', isPopular: false }]);
  }

  function updatePackage(index: number, field: keyof PackageInput, value: string | boolean | unknown) {
    const next = [...packages];
    next[index] = { ...next[index], [field]: value } as PackageInput;
    setPackages(next);
  }

  function removePackage(index: number) {
    setPackages(packages.filter((_, i) => i !== index));
  }

  function addFaq() {
    setFaq([...faq, { question: '', answer: '' }]);
  }

  function updateFaq(index: number, field: keyof FaqInput, value: string) {
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

    const endpoint = initial?.id ? `/api/admin/services/${initial.id}` : '/api/admin/services';
    const method = initial?.id ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, shortDescription, content, icon, locations, packages, faq }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Gagal menyimpan');
      setSaving(false);
      return;
    }

    window.location.href = '/admin/services';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama layanan"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm" required />
      </div>

      <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)}
        placeholder="Deskripsi singkat" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <div>
        <label className="text-sm font-medium text-gray-700">Icon</label>
        <div className="mt-2">
          <ImageField value={icon} onChange={setIcon} placeholder="Icon (nama/URL)" />
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
          <label className="text-sm font-medium text-gray-700">Paket Harga</label>
          <button type="button" onClick={addPackage} className="text-sm text-blue-600 hover:underline">
            + Tambah paket
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {packages.map((pkg, i) => (
            <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={pkg.name} onChange={(e) => updatePackage(i, 'name', e.target.value)}
                  placeholder="Nama paket (mis. Basic)" className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
                <input value={pkg.price} onChange={(e) => updatePackage(i, 'price', e.target.value)}
                  placeholder="Harga (mis. Rp 1.500.000)" className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
              </div>
              <input value={pkg.priceNote} onChange={(e) => updatePackage(i, 'priceNote', e.target.value)}
                placeholder="Catatan harga (mis. /tahun, opsional)" className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm" />

              <div>
                <label className="text-xs font-medium text-gray-600">Fitur Paket</label>
                <div className="mt-1">
                  <RichEditor content={pkg.features} onChange={(val) => updatePackage(i, 'features', val)} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={pkg.isPopular} onChange={(e) => updatePackage(i, 'isPopular', e.target.checked)} />
                Tandai sebagai paket populer
              </label>
              <button type="button" onClick={() => removePackage(i)} className="text-xs text-red-600 hover:underline">
                Hapus paket
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">FAQ (buat JSON-LD & rich snippet Google)</label>
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
              <button type="button" onClick={() => removeFaq(i)} className="text-xs text-red-600 hover:underline">
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Kota yang dilayani</label>
          <button type="button" onClick={addLocation} className="text-sm text-blue-600 hover:underline">
            + Tambah kota
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {locations.map((loc, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3">
              <input value={loc.city} onChange={(e) => updateLocation(i, 'city', e.target.value)}
                placeholder="Kota" className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <input value={loc.slug} onChange={(e) => updateLocation(i, 'slug', e.target.value)}
                placeholder="slug (mis. jasa-website-jakarta)" className="rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <input value={loc.metaTitle} onChange={(e) => updateLocation(i, 'metaTitle', e.target.value)}
                placeholder="Meta title" className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <textarea value={loc.metaDescription} onChange={(e) => updateLocation(i, 'metaDescription', e.target.value)}
                placeholder="Meta description" className="col-span-2 rounded-md border border-gray-300 px-2 py-1 text-sm" />
              <button type="button" onClick={() => removeLocation(i)}
                className="col-span-2 text-left text-xs text-red-600 hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}