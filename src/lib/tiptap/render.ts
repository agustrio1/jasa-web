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

  // Kalau sudah string HTML biasa, langsung dipakai
  if (typeof content === 'string') {
    return content;
  }

  // Kalau object, anggap Tiptap JSON, convert ke HTML
  if (typeof content === 'object') {
    try {
      return generateHTML(content as any, EXTENSIONS);
    } catch {
      return '';
    }
  }

  return '';
}