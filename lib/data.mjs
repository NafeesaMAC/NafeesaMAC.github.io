import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseCsv } from './csv.mjs';
import { isTrue, slugify } from './util.mjs';

// Private notes: read so the build can check they never leak, never rendered.
const PRIVATE = ['Numbers still to add', 'Why it attracts recruiters'];
const APPEAL_RANK = { top: 0, strong: 1, supporting: 2 };

// Source order: the Google Sheet (SHEET_URL), else the local CSV export, else the public
// snapshot (data/portfolio.json) that is committed so GitHub can build without the private CSV.
export async function loadItems({ sheetUrl, csvPath, snapshotPath }) {
  let rows, source;
  if (sheetUrl) { rows = await fromSheet(sheetUrl); source = 'Google Sheet'; }
  else if (existsSync(csvPath)) { rows = parseCsv(await readFile(csvPath, 'utf8')); source = csvPath; }
  else if (existsSync(snapshotPath)) { rows = JSON.parse(await readFile(snapshotPath, 'utf8')).items; source = snapshotPath; }
  else throw new Error(`No data: set SHEET_URL, or add ${csvPath} or ${snapshotPath}`);

  // The Apps Script already removes hidden rows and the Show column; the CSV still has both.
  const shown = rows.filter((r) => !('Show on portfolio' in r) || isTrue(r['Show on portfolio']));

  const privateTexts = rows
    .flatMap((r) => PRIVATE.map((k) => String(r[k] ?? '').trim()))
    .filter((s) => s.length >= 15);

  const seen = new Map();
  const items = shown.map(normalise).sort(byOrderThenAppeal);
  for (const item of items) {
    const n = (seen.get(item.slug) ?? 0) + 1;
    seen.set(item.slug, n);
    if (n > 1) item.slug += `-${n}`;
  }

  return { items, privateTexts, source, publicRows: shown.map(publicColumns) };
}

// The committed public snapshot keeps only the columns the site uses (data minimisation):
// private notes, the Show flag, Recruiter appeal and Impact type are left out.
const PUBLIC = ['Project', 'Role', 'Period', 'Result', 'Problem', 'What I did', 'PM keywords', 'Featured', 'Theme',
  'Headline metric', 'Cover image link', 'Cover image alt', 'What I learned', "What's next (planned)", 'Order',
  'Card headline', 'Card sentence'];
const publicColumns = (r) => Object.fromEntries(Object.entries(r).filter(([k]) => PUBLIC.includes(k)));

export async function writeSnapshot(path, rows) {
  await writeFile(path, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), items: rows }, null, 2) + '\n');
}

async function fromSheet(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Sheet request failed: HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Sheet error: ${data.error}`);
  if (!Array.isArray(data.items)) throw new Error('Sheet response has no "items" array');
  return data.items;
}

const str = (v) => (v == null ? '' : String(v).trim());

// Only the public fields we know about are copied, so private columns cannot reach a page.
function normalise(r) {
  const project = str(r.Project);
  return {
    project,
    slug: slugify(project),
    role: str(r.Role),
    period: str(r.Period),
    result: str(r.Result),
    cardHeadline: str(r['Card headline']), // optional column; falls back to site.json, then Result
    problem: str(r.Problem),
    did: str(r['What I did']),
    learned: str(r['What I learned']),
    next: str(r["What's next (planned)"]),
    cardSentence: str(r['Card sentence']), // optional column; falls back to site.json, then first sentence of What I did
    keywords: str(r['PM keywords']).split(',').map((k) => k.trim()).filter(Boolean),
    impactType: str(r['Impact type']),
    appeal: str(r['Recruiter appeal']),
    featured: isTrue(r.Featured),
    theme: str(r.Theme),
    // Up to 3 metric tiles: separate extra metrics with ";" in Headline metric.
    metrics: str(r['Headline metric']).split(';').map((m) => m.trim()).filter(Boolean).slice(0, 3),
    cover: str(r['Cover image link']),
    order: str(r.Order) === '' ? Infinity : Number(r.Order),
  };
}

function byOrderThenAppeal(a, b) {
  if (a.order !== b.order) return a.order - b.order;
  return (APPEAL_RANK[a.appeal.toLowerCase()] ?? 9) - (APPEAL_RANK[b.appeal.toLowerCase()] ?? 9);
}
