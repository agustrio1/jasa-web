import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false },
  }),
  Image,
  Highlight,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList,
  TaskItem.configure({ nested: true }),
];

export function renderRichContent(content: unknown): string {
  if (!content) return '';

  let parsedContent = content;

  // PERBAIKAN: Jika database mengembalikan string JSON, parse dulu menjadi objek
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error('Gagal memparsing string konten Tiptap:', e);
      return ''; // Jika memang string biasa dan bukan JSON valid, return kosong
    }
  }

  // Pastikan sekarang bentuknya sudah berupa objek Tiptap yang valid
  if (!parsedContent || typeof parsedContent !== 'object') {
    return '';
  }

  try {
    return generateHTML(parsedContent as any, EXTENSIONS);
  } catch (error) {
    console.error('Gagal generate HTML dari Tiptap Object:', error);
    return '';
  }
}
