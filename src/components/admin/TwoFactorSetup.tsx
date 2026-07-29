import { useState } from 'react';
import QRCode from 'qrcode';

type Props = {
  twoFactorEnabled: boolean;
};

export default function TwoFactorSetup({ twoFactorEnabled: initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'scanning'>('idle');

  async function startSetup() {
    const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    const data = await res.json();
    const qr = await QRCode.toDataURL(data.keyUri);
    setQrDataUrl(qr);
    setStep('scanning');
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/2fa/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setEnabled(true);
    setStep('idle');
  }

  async function disable() {
    await fetch('/api/auth/2fa/disable', { method: 'POST' });
    setEnabled(false);
  }

  if (enabled) {
    return (
      <div>
        <p class="text-sm text-gray-700">2FA aktif untuk akun ini.</p>
        <button onClick={disable} class="mt-3 text-sm text-red-600 hover:underline">
          Matikan 2FA
        </button>
      </div>
    );
  }

  if (step === 'idle') {
    return (
      <button onClick={startSetup} class="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
        Aktifkan 2FA
      </button>
    );
  }

  return (
    <form onSubmit={confirmSetup} class="space-y-4">
      <img src={qrDataUrl} alt="QR Code 2FA" class="mx-auto h-48 w-48" />
      <p class="text-center text-sm text-gray-600">Scan pakai Google Authenticator / Authy</p>

      {error && <p class="text-sm text-red-600">{error}</p>}

      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Masukkan kode 6 digit"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-sm"
      />
      <button type="submit" class="w-full rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
        Konfirmasi
      </button>
    </form>
  );
}