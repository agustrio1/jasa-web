import { useState } from 'react';

type Props = {
  services: { name: string }[];
};

export default function ContactForm({ services }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    setErrorMsg('');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, service, message }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? 'Gagal mengirim pesan');
      setStatus('error');
      setSending(false);
      return;
    }

    setStatus('success');
    setName('');
    setEmail('');
    setPhone('');
    setService('');
    setMessage('');
    setSending(false);
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-brass/30 bg-brass/5 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="mt-4 font-display text-lg font-semibold text-charcoal">Pesan terkirim</p>
        <p className="mt-1 text-sm text-charcoal/60">Kami akan segera menghubungi Anda kembali.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-brick hover:underline"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Anda"
          required
          className="rounded-md border border-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-md border border-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nomor WhatsApp (opsional)"
          className="rounded-md border border-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded-md border border-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        >
          <option value="">Layanan yang diminati (opsional)</option>
          {services.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ceritakan kebutuhan Anda"
        rows={4}
        className="w-full rounded-md border border-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
      />

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-brick px-6 py-3 text-sm font-medium text-bone hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {sending ? 'Mengirim...' : 'Kirim Pesan'}
      </button>
    </form>
  );
}