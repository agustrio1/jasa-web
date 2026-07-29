import { useState } from 'react';
import MediaPicker from './MediaPicker';

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

export default function ImageField({ value, onChange, placeholder = 'URL gambar' }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Pilih Media
        </button>
      </div>

      {value && (
        <img src={value} alt="Preview" className="mt-2 h-24 w-24 rounded-md border border-gray-200 object-cover" />
      )}

      <MediaPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}