import { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { upload } from '@imagekit/javascript';

type Props = {
  content: unknown;
  onChange: (json: unknown) => void;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded disabled:opacity-30 ${
        active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function HeadingIcon({ level }: { level: 1 | 2 | 3 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
        H{level}
      </text>
    </svg>
  );
}

const ICONS = {
  bold: 'M6 4h8a4 4 0 010 8H6V4zm0 8h9a4 4 0 010 8H6v-8z',
  italic: 'M10 4h6M8 20h6M13 4L11 20',
  underline: 'M6 4v6a6 6 0 0012 0V4M4 20h16',
  strike: 'M5 12h14M8 6.5a4 4 0 018 0M8 17.5a4 4 0 008 0',
  bulletList: 'M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12',
  orderedList: 'M4 6h1v2H4V6zm0 5h1v2H4v-2zm0 5h1v2H4v-2zM8 6h12M8 12h12M8 18h12',
  taskList: 'M9 12l2 2 4-4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  quote: 'M7 8c-2 0-3 1.5-3 3.5S5 15 7 15v3H4v-3.5C4 11 6 8 9 8H7zm10 0c-2 0-3 1.5-3 3.5S15 15 17 15v3h-3v-3.5c0-4 2-7 5-7h-2z',
  code: 'M8 9l-4 3 4 3m8-6l4 3-4 3',
  link: 'M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m4.656-4.656l1.5-1.5a4 4 0 115.656 5.656l-3 3a4 4 0 01-5.656 0',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  hr: 'M4 12h16',
  highlight: 'M9 11l6-6m0 0l3 3-6 6-3-3m6-6L6 14l-2 6 6-2 9-9',
  alignLeft: 'M4 6h16M4 12h10M4 18h16',
  alignCenter: 'M4 6h16M7 12h10M4 18h16',
  alignRight: 'M4 6h16M10 12h10M4 18h16',
  undo: 'M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1',
  redo: 'M15 14l4-4m0 0l-4-4m4 4H8a4 4 0 000 8h1',
  clear: 'M6 18L18 6M6 6l12 12',
};

export default function RichEditor({ content, onChange }: Props) {
  const [, forceRerender] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false },
      }),
      Image,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    onTransaction: () => {
      forceRerender((n) => n + 1);
    },
  });

  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const authRes = await fetch('/api/media/auth');
      const auth = await authRes.json();

      const result = await upload({
        file,
        fileName: file.name,
        publicKey: import.meta.env.PUBLIC_IMAGEKIT_PUBLIC_KEY,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
      });

      if (result.url) {
        editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      }
    };

    input.click();
  }, [editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL', previousUrl ?? '');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-gray-300">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Icon path={ICONS.bold} />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Icon path={ICONS.italic} />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Icon path={ICONS.underline} />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Icon path={ICONS.strike} />
        </ToolbarButton>
        <ToolbarButton label="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Icon path={ICONS.highlight} />
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-200" />

        <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <HeadingIcon level={1} />
        </ToolbarButton>
        <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <HeadingIcon level={2} />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <HeadingIcon level={3} />
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-200" />

        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <Icon path={ICONS.bulletList} />
        </ToolbarButton>
        <ToolbarButton label="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <Icon path={ICONS.orderedList} />
        </ToolbarButton>
        <ToolbarButton label="Task list" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <Icon path={ICONS.taskList} />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Icon path={ICONS.quote} />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Icon path={ICONS.code} />
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-200" />

        <ToolbarButton label="Align kiri" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <Icon path={ICONS.alignLeft} />
        </ToolbarButton>
        <ToolbarButton label="Align tengah" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <Icon path={ICONS.alignCenter} />
        </ToolbarButton>
        <ToolbarButton label="Align kanan" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <Icon path={ICONS.alignRight} />
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-200" />

        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={handleLink}>
          <Icon path={ICONS.link} />
        </ToolbarButton>
        <ToolbarButton label="Gambar" onClick={handleImageUpload}>
          <Icon path={ICONS.image} />
        </ToolbarButton>
        <ToolbarButton label="Garis horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Icon path={ICONS.hr} />
        </ToolbarButton>
        <ToolbarButton label="Bersihkan format" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <Icon path={ICONS.clear} />
        </ToolbarButton>

        <div className="mx-1 w-px bg-gray-200" />

        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Icon path={ICONS.undo} />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Icon path={ICONS.redo} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 focus:outline-none" />
    </div>
  );
}