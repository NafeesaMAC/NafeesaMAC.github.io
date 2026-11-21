// Builds the static site into dist/.
//   node build.mjs         published build (placeholders removed)
//   node build.mjs --dev   development build (placeholders shown as [ADD])
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadItems, writeSnapshot } from './lib/data.mjs';
import { robotsTxt, sitemapXml } from './lib/seo.mjs';
import { loadSite } from './lib/site.mjs';
import { renderHome } from './lib/home.mjs';
import { renderCaseStudy } from './lib/case-study.mjs';
import { checkOutput, missingNumbers } from './lib/checks.mjs';
import { hasPlaceholder } from './lib/util.mjs';

const DIST = 'dist';
const MAX_FEATURED = 4;
const dev = process.argv.includes('--dev');

try { process.loadEnvFile(); } catch { /* no .env file: fine */ }
const sheetUrl = (process.env.SHEET_URL ?? '').includes('PASTE_YOUR') ? '' : process.env.SHEET_URL ?? '';
const site = await loadSite({ contactPath: 'content/contact.md', sitePath: 'content/site.json' });
site.photo = ['jpg', 'jpeg', 'png', 'webp'].map((ext) => `assets/photo.${ext}`).find((p) => existsSync(p)) ?? '';
// SITE_URL env var wins over site.json; a placeholder like [yourusername] counts as unset.
const rawSiteUrl = process.env.SITE_URL || site.siteUrl || '';
const siteUrl = hasPlaceholder(rawSiteUrl) ? '' : rawSiteUrl.replace(/\/$/, '');
if (!siteUrl) console.warn('Warning: site URL not set yet (content/site.json "siteUrl"), so absolute URLs are left out.');
site.url = siteUrl;
const SNAPSHOT = 'data/portfolio.json';
const { items, privateTexts, source, publicRows } = await loadItems({ sheetUrl, csvPath: 'data/brag-book.csv', snapshotPath: SNAPSHOT });
// Building from the private CSV refreshes the public snapshot that GitHub builds from.
if (source.endsWith('.csv')) await writeSnapshot(SNAPSHOT, publicRows);

const featured = items.filter((i) => i.featured);
const homeFeatured = featured.slice(0, MAX_FEATURED);
// Extra featured rows keep their case study and are listed under More wins instead.
const wins = items.filter((i) => !homeFeatured.includes(i));

const pages = new Map();
pages.set('index.html', renderHome({ site, featured: homeFeatured, wins, dev, siteUrl }));
featured.forEach((item, i) => {
  const next = featured.length > 1 ? featured[(i + 1) % featured.length] : null;
  pages.set(`work/${item.slug}/index.html`, renderCaseStudy({ site, item, next, dev }));
});

const problems = checkOutput(pages, { privateTexts, dev });
if (problems.length) {
  console.error('Build stopped. Fix these before publishing:\n- ' + problems.join('\n- '));
  process.exit(1);
}

await rm(DIST, { recursive: true, force: true });
for (const [file, html] of pages) {
  const path = join(DIST, file);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
}
await cp('assets', join(DIST, 'assets'), { recursive: true });
await writeFile(join(DIST, 'robots.txt'), robotsTxt(siteUrl));
if (siteUrl) {
  const paths = ['', ...featured.map((i) => `work/${i.slug}/`)];
  await writeFile(join(DIST, 'sitemap.xml'), sitemapXml(siteUrl, paths, new Date().toISOString().slice(0, 10)));
}

console.log(`Built ${pages.size} pages from ${source}${dev ? ' (dev mode)' : ''}`);
console.log(`  ${items.length} shown rows: ${featured.length} featured, ${wins.length} more wins`);
for (const file of pages.keys()) console.log(`  dist/${file}`);
if (featured.length > MAX_FEATURED) {
  console.warn(`Warning: ${featured.length} rows are Featured; only the first ${MAX_FEATURED} appear as home cards.`);
}
for (const item of homeFeatured) {
  const headline = item.cardHeadline || site.cardHeadlines?.[item.slug];
  const lost = headline ? missingNumbers(item.result, headline) : [];
  if (lost.length) console.warn(`Warning: card headline for "${item.project}" drops ${lost.join(', ')} from its Result.`);
}
if (!site.photo) console.warn('Warning: no assets/photo.jpg yet, so the intro shows without a photo.');
if (!existsSync('assets/resume.pdf')) console.warn('Warning: assets/resume.pdf is missing, so the resume link will 404.');
