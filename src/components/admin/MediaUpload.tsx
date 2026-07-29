import { useState, useRef } from 'react';
import { upload } from '@imagekit/javascript';

type Props = {
  onUploaded: (result: { fileId: string; url: string; thumbnailUrl: string; name: string }) => void;
};

export default function MediaUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const authRes = await fetch('/api/media/auth');
      const auth = await authRes.json();

      const result = await upload({
        file,
        fileName: file.name,
        publicKey: import.meta.env.PUBLIC_IMAGEKIT_PUBLIC_KEY,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        onProgress: (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      onUploaded({
        fileId: result.fileId!,
        url: result.url!,
        thumbnailUrl: result.thumbnailUrl ?? result.url!,
        name: result.name!,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {uploading ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm text-gray-500">Mengunggah... {progress}%</p>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
          </svg>
          <p className="text-sm font-medium text-gray-700">Tap atau drag gambar ke sini</p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP</p>
        </>
      )}
    </div>
  );
}