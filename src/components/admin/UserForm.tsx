import { useState } from 'react';

export default function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Gagal membuat user');
      setSaving(false);
      return;
    }

    window.location.href = '/admin/users';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 8 karakter)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required minLength={8} />

      <button type="submit" disabled={saving}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Tambah Admin'}
      </button>
    </form>
  );
}