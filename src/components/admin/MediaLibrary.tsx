import { useState } from 'react';
import MediaUpload from './MediaUpload';

type MediaItem = {
  id: string;
  fileId: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  alt: string | null;
};

type Props = {
  initialMedia: MediaItem[];
  publicKey: string;
};

export default function MediaLibrary({ initialMedia, publicKey }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleUploaded(result: { fileId: string; url: string; thumbnailUrl: string; name: string }) {
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: result.fileId,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        fileName: result.name,
        fileType: 'image',
        size: 0,
      }),
    });
    const data = await res.json();
    setMediaList((prev) => [{ id: data.id, ...result, thumbnailUrl: result.thumbnailUrl, alt: null }, ...prev]);
  }

  async function handleDelete(id: string, fileId: string) {
    setDeletingId(id);
    await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  }

  async function handleCopyLink(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      {/* Oper publicKey ke MediaUpload */}
      <MediaUpload onUploaded={handleUploaded} publicKey={publicKey} />

      {mediaList.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-400">Belum ada media</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mediaList.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="aspect-square w-full">
                <img
                  src={m.thumbnailUrl ?? m.url}
                  alt={m.alt ?? m.fileName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => handleDelete(m.id, m.fileId)}
                    disabled={deletingId === m.id}
                    aria-label="Hapus"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-red-600 hover:bg-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => handleCopyLink(m.id, m.url)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white/90 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                >
                  {copiedId === m.id ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Tersalin
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Salin Link
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
