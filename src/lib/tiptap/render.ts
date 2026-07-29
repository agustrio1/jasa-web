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
  console.log('renderRichContent INPUT:', JSON.stringify(content));

  if (!content || typeof content !== 'object') {
    console.log('renderRichContent: content bukan object, return empty');
    return '';
  }

  try {
    const html = generateHTML(content as any, EXTENSIONS);
    console.log('renderRichContent OUTPUT:', html);
    return html;
  } catch (err) {
    console.log('renderRichContent ERROR:', err);
    return '';
  }
}