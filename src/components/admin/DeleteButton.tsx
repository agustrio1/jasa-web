import { useState } from 'react';

type Props = {
  endpoint: string;
  confirmMessage?: string;
};

export default function DeleteButton({ endpoint, confirmMessage = 'Yakin ingin menghapus ini?' }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    setFailed(false);

    const res = await fetch(endpoint, { method: 'DELETE' });

    if (res.ok) {
      window.location.reload();
    } else {
      setDeleting(false);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Hapus"
      className={`shrink-0 rounded-md p-2 disabled:opacity-50 ${
        failed ? 'text-red-700 bg-red-50' : 'text-red-500 hover:bg-red-50'
      }`}
      title={failed ? 'Gagal menghapus, coba lagi' : 'Hapus'}
    >
      {deleting ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}