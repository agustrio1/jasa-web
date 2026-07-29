export function renderRichContent(content: unknown): string {
  if (!content) return '';

  let doc: any = content;

  // 1. Jika data masih dalam bentuk string JSON, parse dulu ke objek
  if (typeof content === 'string') {
    try {
      doc = JSON.parse(content);
    } catch {
      return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }
  }

  // Pastikan struktur Tiptap memiliki array content
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.content)) {
    return '';
  }

  // 2. Fungsi Rekursif untuk menerjemahkan setiap Node JSON Tiptap menjadi HTML Tag murni
  function parseNode(node: any): string {
    if (!node) return '';

    // Jika node berupa teks biasa, cek apakah memiliki style/marks (bold, italic, dll)
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

    // Rekursi untuk mengambil isi/anak dari elemen saat ini
    const childrenHtml = Array.isArray(node.content) 
      ? node.content.map(parseNode).join('') 
      : '';

    // Mapping tipe tag Tiptap ke HTML
    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 2;
        return `<h${level} class="font-display font-semibold text-charcoal mt-6 mb-2">${childrenHtml}</h${level}>`;
      
      case 'paragraph':
        // Abaikan paragraf kosong di akhir skema
        if (!childrenHtml.trim()) return '';
        return `<p class="mt-3 leading-relaxed text-charcoal/80">${childrenHtml}</p>`;
      
      case 'bulletList':
        return `<ul class="list-disc list-inside my-4 pl-4 space-y-1">${childrenHtml}</ul>`;
      
      case 'orderedList':
        return `<ol class="list-decimal list-inside my-4 pl-4 space-y-1">${childrenHtml}</ol>`;
      
      case 'listItem':
        return `<li class="text-charcoal/80">${childrenHtml}</li>`;
      
      default:
        return childrenHtml;
    }
  }

  // Eksekusi semua root content dan gabungkan hasilnya
  return doc.content.map(parseNode).join('');
}
