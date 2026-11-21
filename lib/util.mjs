export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const slugify = (value) =>
  String(value).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const isTrue = (value) => value === true || String(value).trim().toUpperCase() === 'TRUE';

// Placeholders like [X]%, [ADD], [Name] or a bare "X%" mean "number not filled in yet".
const PLACEHOLDER = /\[[^\]]*\]|\bX%/;
export const hasPlaceholder = (value) => PLACEHOLDER.test(String(value ?? ''));

export const ADD_MARKER = '<mark class="add">[ADD]</mark>';

// Inline author notes like "[ADD: reports per month]" are reminders to write more.
const NOTE = /\s*\[ADD:[^\]]*\]/g;
export const stripNotes = (value) => String(value ?? '').replace(NOTE, '').trim();

// Escaped text for the page.
// - "[ADD: …]" notes are removed when published and highlighted in dev; the rest of the text stays.
// - Any other placeholder ([X]%, [Name]) means the value isn't ready: dropped when published, flagged in dev.
export function text(value, { dev }) {
  const raw = String(value ?? '').trim();
  const s = stripNotes(raw);
  if (!s) return '';
  if (hasPlaceholder(s)) return dev ? `${esc(s)} ${ADD_MARKER}` : '';
  if (!dev) return esc(s);
  return esc(raw).replace(/\[ADD:[^\]]*\]/g, (note) => `<mark class="add">${note}</mark>`);
}

// Wrap html in a tag, or return '' so empty values leave no empty elements.
export const el = (tag, html, attrs = '') => (html ? `<${tag}${attrs ? ' ' + attrs : ''}>${html}</${tag}>` : '');

// Add a full stop if the text doesn't already end with one.
// Trailing "[ADD: …]" notes are ignored when deciding whether a full stop is needed.
export function sentence(s) {
  if (!s) return s;
  const [, body, notes] = s.match(/^([\s\S]*?)((?:\s*\[ADD:[^\]]*\])*)$/);
  return (/[.!?]$/.test(body) ? body : body + '.') + notes;
}

// Shorten to about `max` characters at a word boundary.
export function clip(s, max = 155) {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max - 1)).replace(/[,;:]$/, '') + '…';
}

export function firstSentence(value) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  const first = s.split(/(?<=[.!?])\s+/)[0];
  return /[.!?]$/.test(first) ? first : first + '.';
}
