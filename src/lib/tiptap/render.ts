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

  let parsed: any = content;

  // 1. Jika bertipe string, coba parse ke objek JSON
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch {
      // Jika string biasa (bukan JSON), langsung bungkus ke tag paragraf
      return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }
  }

  // 2. Jika tipenya objek tetapi tidak memiliki struktur Tiptap standar ('type' dan 'content')
  if (parsed && typeof parsed === 'object' && !parsed.type) {
    // Kemungkinan data dibungkus dalam properti internal Drizzle/Postgres seperti .json atau .value
    if (parsed.json) return renderRichContent(parsed.json);
    if (parsed.value) return renderRichContent(parsed.value);
    
    // Fallback: Jika berupa objek stringified murni bawaan editor teks
    if (typeof parsed.toString === 'function') {
      const str = parsed.toString();
      if (str !== '[object Object]') return `<p>${str}</p>`;
    }
  }

  // 3. Render HTML menggunakan Tiptap generator resmi
  try {
    return generateHTML(parsed, EXTENSIONS);
  } catch (error) {
    // Fallback terakhir: jika Tiptap schema-nya corrupt/tidak valid, ekstrak text node manual
    try {
      if (parsed?.content && Array.isArray(parsed.content)) {
        return parsed.content
          .map((node: any) => {
            if (node.type === 'paragraph' && node.content) {
              return `<p>${node.content.map((c: any) => c.text || '').join('')}</p>`;
            }
            if (node.type === 'heading' && node.content) {
              return `<h${node.attrs?.level || 2}>${node.content.map((c: any) => c.text || '').join('')}</h${node.attrs?.level || 2}>`;
            }
            return '';
          })
          .join('');
      }
    } catch {}
    return '';
  }
}
