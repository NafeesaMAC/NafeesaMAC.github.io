import { page } from './layout.mjs';
import { headlineFor } from './sections.mjs';
import { clip, esc, sentence, stripNotes, text } from './util.mjs';

// Case-study page, in the order set in CLAUDE.md:
// outcome headline → up to 3 metric tiles → Problem → What I did → Result
// → What I learned → Skills demonstrated.
export function renderCaseStudy({ site, item, next, dev }) {
  const t = (v) => text(v, { dev });
  const headline = headlineFor(item, site);

  // A line break inside a sheet cell starts a new paragraph.
  // Sections are numbered in the order they appear (01 Problem, 02 What I did, ...).
  let n = 0;
  const section = (id, heading, value) => {
    const paras = String(value ?? '').split(/\n+/).map((p) => t(sentence(p.trim()))).filter(Boolean);
    if (!paras.length) return '';
    n += 1;
    return `
  <section class="box cs-section" aria-labelledby="${id}">
    <h2 id="${id}"><span class="num" aria-hidden="true">${String(n).padStart(2, '0')}</span> ${heading}</h2>
    ${paras.map((p) => `<p>${p}</p>`).join('\n    ')}
  </section>`;
  };

  const tiles = item.metrics.map(t).filter(Boolean);
  const tilesHtml = tiles.length ? `
  <ul class="metric-tiles" aria-label="Key results">${tiles.map((m) => `
    <li>${m}</li>`).join('')}
  </ul>` : '';

  const context = [item.project, item.role, item.period].filter(Boolean).map(esc).join(' · ');
  const skills = item.keywords.map(esc).join(', ');

  const body = `
<div class="band">
<article class="case-study">
  <p class="crumb"><a href="../../#work">Back to all work</a></p>
  <header class="box box-sky cs-header">
    ${item.theme ? `<p class="label">${t(item.theme)}</p>` : ''}
    <h1>${t(headline) || esc(item.project)}</h1>
    <p class="cs-context">${context}</p>
  </header>
  ${tilesHtml}
  ${section('problem', 'Problem', item.problem)}
  ${section('what-i-did', 'What I did', item.did)}
  ${section('result', 'Result', item.result)}
  ${section('what-i-learned', 'What I learned', item.learned)}
  ${section('whats-next', 'What’s next', item.next)}
  ${skills ? `<p class="box box-stone skills-line"><strong>Skills demonstrated:</strong> ${skills}.</p>` : ''}
  <nav class="cs-nav" aria-label="Case studies">
    <a href="../../#work">Back to all work</a>
    ${next ? `<a href="../${next.slug}/">Next case study: ${esc(next.project)}</a>` : ''}
  </nav>
</article>
</div>`;

  return page({
    site,
    title: `${item.project} | ${site.name}, ${site.jobTitle}`,
    description: clip(`${sentence(stripNotes(headline))} ${sentence(stripNotes(item.problem))}`),
    body,
    root: '../../',
    path: `work/${item.slug}/`,
    ogType: 'article',
  });
}
