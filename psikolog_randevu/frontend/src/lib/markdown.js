import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

// Dış linkleri yeni sekmede ve rel=noopener ile aç
const addLinkAttrs = () => {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
};
addLinkAttrs();

export const renderMarkdown = (source) => {
  const raw = marked.parse(source || '');
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote',
      'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'img', 'del', 's',
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'target', 'rel'],
  });
};

/** Kaynak URL'leri: /uploads/... → tam URL */
export const absoluteUrl = (u) => {
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};
