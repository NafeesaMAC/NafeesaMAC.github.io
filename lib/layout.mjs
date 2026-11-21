import { esc } from './util.mjs';

// Security: only this site's own files and Google Fonts may load; no inline scripts, plugins,
// form posts or outside connections. (frame-ancestors cannot be set from a <meta> tag.)
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'none'", "object-src 'none'",
  "base-uri 'self'", "form-action 'none'", 'upgrade-insecure-requests',
].join('; ');

const FONTS = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Serif+Display&display=swap';

// Shared page shell. `root` is the relative path back to the site root ("./" or "../../"),
// so links work on any GitHub Pages URL.
// `path` is the page's address relative to the site root ('' for home, 'work/<slug>/' for a case study).
export function page({ site, title, description, body, root = './', path = '', ogType = 'website', jsonLd }) {
  const url = site.url ? `${site.url}/${path}` : '';
  const image = site.url && site.photo ? `${site.url}/${site.photo}` : '';
  const social = [
    url && `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    url && `<meta property="og:url" content="${esc(url)}">`,
    image && `<meta property="og:image" content="${esc(image)}">`,
    image && `<meta property="og:image:alt" content="${esc(`Portrait of ${site.name}, ${site.jobTitle}`)}">`,
    `<meta name="twitter:card" content="summary">`,
  ].filter(Boolean).join('\n');
  const ld = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${social}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}assets/styles.css">
${ld}</head>
<body>
<header class="site-header${site.hasSideProjects ? ' has-side' : ''}">
  <div class="wrap">
    <a class="brand" href="${root}">${esc(site.name)}</a>
    <span class="role">${esc(site.jobTitle)}</span>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu<span class="chev" aria-hidden="true"></span></button>
    <nav id="site-nav" aria-label="Main">
      <a href="${root}#work">Work</a>
${site.hasSideProjects ? `      <a href="${root}#side-projects">Side projects</a>\n` : ''}      <a href="${root}#about">About</a>
      <a href="${root}#contact">Contact</a>
      <a href="${root}assets/resume.pdf" target="_blank" rel="noopener">Download My Resume<span class="sr-only"> (PDF, opens in a new tab)</span></a>
    </nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p>${esc(site.name)} · ${esc(site.jobTitle)} · ${esc(site.location)}</p>
  </div>
</footer>
<script src="${root}assets/reveal.js" defer></script>
</body>
</html>
`;
}
