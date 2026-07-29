export function renderRichContent(content: unknown): string {
  if (!content) return '';

  let doc: any = null;

  // PAKSA PARSING: Ubah paksa apa pun tipe datanya ke string, lalu bersihkan ke objek JavaScript murni
  try {
    if (typeof content === 'string') {
      doc = JSON.parse(content);
    } else {
      // Jika dari Drizzle berupa objek proxy/jsonb internal, stringify dulu baru parse ulang
      doc = JSON.parse(JSON.stringify(content));
    }
  } catch (e) {
    // Jika benar-benar teks biasa (bukan format JSON Tiptap)
    if (typeof content === 'string') {
      return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }
    return '';
  }

  // Jika setelah dibersihkan objeknya bukan format Tiptap valid
  if (!doc || typeof doc !== 'object') {
    return '';
  }

  // Jika data tiptap berada di dalam key bersarang (nested) akibat query builder
  if (doc.json) doc = doc.json;
  if (doc.value && doc.value.content) doc = doc.value;

  // Pastikan array content ada
  if (!Array.isArray(doc.content)) {
    return '';
  }

  // Fungsi Rekursif Parser Elemen
  function parseNode(node: any): string {
    if (!node) return '';

    if (node.type === 'text' && node.text) {
      let textHtml = node.text;
      if (Array.isArray(node.marks)) {
        node.marks.forEach((mark: any) => {
          if (mark.type === 'bold') textHtml = `<strong>${textHtml}</strong>`;
          if (mark.type === 'italic') textHtml = `<em>${textHtml}</em>`;
          if (mark.type === 'highlight') textHtml = `<mark>${textHtml}</mark>`;
        });
      }
      return textHtml;
    }

    const childrenHtml = Array.isArray(node.content) 
      ? node.content.map(parseNode).join('') 
      : '';

    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 2;
        return `<h${level} class="font-display font-semibold text-charcoal mt-6 mb-2 text-xl sm:text-2xl">${childrenHtml}</h${level}>`;
      
      case 'paragraph':
        if (!childrenHtml.trim()) return '';
        return `<p class="mt-3 leading-relaxed text-charcoal/80 text-sm sm:text-base">${childrenHtml}</p>`;
      
      case 'bulletList':
        return `<ul class="list-disc list-inside my-4 pl-4 space-y-2 text-sm sm:text-base">${childrenHtml}</ul>`;
      
      case 'orderedList':
        return `<ol class="list-decimal list-inside my-4 pl-4 space-y-2 text-sm sm:text-base">${childrenHtml}</ol>`;
      
      case 'listItem':
        // Tiptap membungkus teks list item di dalam paragraf lagi, bersihkan tag p ganda jika ada
        let cleanChildren = childrenHtml;
        if (cleanChildren.startsWith('<p class=')) {
          cleanChildren = cleanChildren.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
        }
        return `<li class="text-charcoal/80 my-1">${cleanChildren}</li>`;
      
      default:
        return childrenHtml;
    }
  }

  return doc.content.map(parseNode).join('');
}
