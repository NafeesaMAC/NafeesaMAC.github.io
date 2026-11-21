// Turns content/resume.md into assets/resume.pdf (A4, text-based, single column for ATS).
//   npm run resume
// Uses the local Google Chrome to print. Set CHROME=/path/to/chrome if it lives elsewhere.
// Placeholders like [Organisation] are left out of the PDF and listed as warnings.
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SOURCE = 'content/resume.md';
const OUTPUT = resolve('assets/resume.pdf');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PHONE = /\+\d{1,3}[\s-]?\d[\d\s-]{7,}\d|\b[6-9]\d{4}[\s-]?\d{5}\b/;

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const warnings = [];

// Inline formatting: **bold**, and email / URLs as links that show their full text.
function inline(raw) {
  let s = raw;
  const placeholders = s.match(/\[[^\]]+\]/g);
  if (placeholders) {
    warnings.push(`Left out ${placeholders.join(', ')} in: "${raw.slice(0, 60)}"`);
    s = s.replace(/,?\s*\[[^\]]+\]/g, '').replace(/^\s*,\s*/, '');
  }
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(https?:\/\/[^\s·]+)/g, (url) => `<a href="${url}">${url.replace(/^https?:\/\/(www\.)?/, '')}</a>`)
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
}

function toHtml(md) {
  const out = [];
  let list = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  let afterName = 0;

  for (const line of md.split('\n')) {
    const t = line.trim();
    if (!t) { closeList(); continue; }
    let m;
    if ((m = t.match(/^# (.+)/))) { closeList(); out.push(`<h1>${inline(m[1])}</h1>`); afterName = 2; continue; }
    if ((m = t.match(/^## (.+)/))) { closeList(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = t.match(/^### (.+)/))) {
      closeList();
      const [role, dates] = m[1].split(' | ');
      out.push(`<h3><span>${inline(role)}</span>${dates ? `<span class="dates">${inline(dates)}</span>` : ''}</h3>`);
      continue;
    }
    if ((m = t.match(/^- (.+)/)) || (m = t.match(/^\d+\. (.+)/))) {
      const kind = /^\d+\./.test(t) ? 'ol' : 'ul';
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    closeList();
    // The two lines under the name are the headline and the contact line.
    const cls = afterName === 2 ? 'headline' : afterName === 1 ? 'contact' : '';
    afterName = Math.max(0, afterName - 1);
    out.push(`<p${cls ? ` class="${cls}"` : ''}>${inline(t)}</p>`);
  }
  closeList();
  return out.join('\n');
}

const CSS = `
@page { size: A4; margin: 13mm 15mm 13mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.32; color: #1a1a1a; }
a { color: inherit; text-decoration: none; }
h1 { font-size: 20pt; margin: 0 0 2pt; letter-spacing: 0.2pt; }
.headline { font-size: 11pt; font-weight: bold; color: #0A5C5C; margin: 0 0 3pt; }
.contact { font-size: 9.5pt; margin: 0 0 6pt; }
h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.6pt; color: #0A5C5C;
     border-bottom: 1px solid #0A5C5C; padding-bottom: 1.5pt; margin: 9pt 0 4pt; break-after: avoid; }
h3 { display: flex; justify-content: space-between; gap: 8pt; font-size: 10.5pt; margin: 7pt 0 2pt; break-after: avoid; }
h3 .dates { font-weight: normal; white-space: nowrap; }
p { margin: 0 0 3pt; }
ul, ol { margin: 0; padding-left: 13pt; }
li { margin: 0 0 2.2pt; break-inside: avoid; }
`;

const md = await readFile(SOURCE, 'utf8');
if (PHONE.test(md)) throw new Error('content/resume.md contains a phone number. The web resume must not include one.');

const name = md.match(/^# (.+)$/m)?.[1] ?? 'Resume';
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(name)} – Resume</title><meta name="author" content="${esc(name)}">
<style>${CSS}</style></head><body>${toHtml(md)}</body></html>`;

const dir = await mkdtemp(join(tmpdir(), 'resume-'));
const htmlPath = join(dir, 'resume.html');
await writeFile(htmlPath, html);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${OUTPUT}`, `file://${htmlPath}`], { stdio: 'ignore' });

const pdf = await readFile(OUTPUT, 'latin1');
const pages = (pdf.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
console.log(`Wrote assets/resume.pdf (${pages} page${pages === 1 ? '' : 's'})`);
if (pages > 2) console.warn('Warning: the resume is longer than 2 pages.');
for (const w of warnings) console.warn(`Warning: ${w}`);
