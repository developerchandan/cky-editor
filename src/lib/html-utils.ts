const DROPPED_TAGS = 'script,style,meta,link,title,object,embed,form,input,button,select,textarea,base,frame,frameset,svg,math';
const URL_ATTRS = ['href', 'src', 'action', 'formaction', 'xlink:href'];
const SAFE_URL = /^(https?:|mailto:|tel:|#|\/|data:(?!text\/html|image\/svg))/i;
const EMBED_HOSTS = /^https:\/\/(www\.youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)/;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.body.querySelectorAll(DROPPED_TAGS).forEach((el) => el.remove());

  doc.body.querySelectorAll('iframe').forEach((el) => {
    if (!EMBED_HOSTS.test(el.getAttribute('src') ?? '')) el.remove();
  });

  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') {
        el.removeAttribute(attr.name);
      } else if (URL_ATTRS.includes(name) && !SAFE_URL.test(attr.value.trim())) {
        el.removeAttribute(attr.name);
      }
    }
  });

  return doc.body.innerHTML;
}

// Word/Google Docs paste carries mso-* styles, <o:p> tags and class noise.
export function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(sanitizeHtml(html), 'text/html');
  doc.body.querySelectorAll('o\\:p').forEach((el) => el.replaceWith(...Array.from(el.childNodes)));
  doc.body.querySelectorAll('[class]').forEach((el) => {
    if (/(^|\s)Mso/.test(el.getAttribute('class') ?? '')) el.removeAttribute('class');
  });
  doc.body.querySelectorAll('[style]').forEach((el) => {
    const kept = (el.getAttribute('style') ?? '')
      .split(';')
      .filter((rule) => rule.trim() && !/^\s*(mso-|font-family|line-height|margin)/i.test(rule));
    if (kept.length) el.setAttribute('style', kept.join(';'));
    else el.removeAttribute('style');
  });
  return doc.body.innerHTML;
}

export function toEmbedHtml(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const host = parsed.hostname.replace(/^www\./, '');
  let src: string | null = null;

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]{6,})/)?.[1];
    if (id) src = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
  } else if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    if (id) src = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
  } else if (host === 'vimeo.com') {
    const id = parsed.pathname.match(/^\/(\d+)/)?.[1];
    if (id) src = `https://player.vimeo.com/video/${id}`;
  }

  if (src) {
    return `<figure class="cky-media"><iframe src="${src}" allowfullscreen frameborder="0"></iframe></figure><p></p>`;
  }
  if (/\.(mp4|webm|ogg)$/i.test(parsed.pathname)) {
    return `<figure class="cky-media"><video src="${escapeHtml(parsed.href)}" controls></video></figure><p></p>`;
  }
  return null;
}

export function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, space: string, ch: string) => space + ch.toUpperCase());
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const EXPORT_CSS = `
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #bfbfbf; padding: 6px 8px; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 12px; color: #555; }
  pre { background: #f5f5f5; padding: 10px; font-family: Consolas, monospace; }
  .cky-page-break { page-break-after: always; }
  img { max-width: 100%; }
`;

export function buildWordDocument(bodyHtml: string, title: string): string {
  return (
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${EXPORT_CSS}</style></head>` +
    `<body>${bodyHtml}</body></html>`
  );
}

export function buildPrintDocument(bodyHtml: string, title: string): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>` +
    `<style>${EXPORT_CSS} @page { margin: 18mm; }</style></head><body>${bodyHtml}</body></html>`
  );
}

export function downloadFile(content: BlobPart, fileName: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
