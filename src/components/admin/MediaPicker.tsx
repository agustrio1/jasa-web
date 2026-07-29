import { useState, useEffect } from 'react';
import MediaUpload from './MediaUpload';

type MediaItem = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  fileName: string;
  alt: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

export default function MediaPicker({ isOpen, onClose, onSelect }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => setMediaList(data.items ?? []))
      .finally(() => setLoading(false));
  }, [isOpen]);

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
    setMediaList((prev) => [{ id: data.id, ...result, alt: null }, ...prev]);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="font-medium text-gray-900">Pilih Media</h2>
          <button onClick={onClose} aria-label="Tutup" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200 p-4">
          <MediaUpload onUploaded={handleUploaded} />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-3 text-sm text-gray-400">Belum ada media, unggah dulu di atas</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {mediaList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m.url);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-md border border-gray-200 hover:border-gray-900"
                >
                  <img
                    src={m.thumbnailUrl ?? m.url}
                    alt={m.alt ?? m.fileName}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}