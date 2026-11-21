import { page } from './layout.mjs';
import { headlineFor } from './sections.mjs';
import { clip, esc, sentence, stripNotes, text } from './util.mjs';

// Case-study page, in the order set in CLAUDE.md:
// outcome headline → up to 3 metric tiles → Problem → What I did → Result
// → What I learned → Skills demonstrated.
export function renderCaseStudy({ site, item, next, dev, kind = 'work' }) {
  const side = kind === 'side';
  const folder = side ? 'projects' : 'work';
  const back = side ? { href: '../../#side-projects', text: 'Back to side projects' } : { href: '../../#work', text: 'Back to all work' };
  const t = (v) => text(v, { dev });
  const headline = headlineFor(item, site);

  // A line break inside a sheet cell starts a new paragraph.
  // Sections are numbered in the order they appear (01 Problem, 02 What I did, ...).
  let n = 0;
  // Lines starting "1." become a numbered list and lines starting "- " a bullet list.
  const section = (id, heading, value) => {
    const lines = String(value ?? '').split(/\n+/).map((p) => p.trim()).filter(Boolean);
    if (!lines.length) return '';
    const numbered = lines.length > 1 && lines.every((l) => /^\d+[.)]\s/.test(l));
    const bullets = lines.length > 1 && lines.every((l) => /^[-•]\s/.test(l));
    const items = lines.map((l) => t(sentence(l.replace(/^(\d+[.)]|[-•])\s+/, '')))).filter(Boolean);
    if (!items.length) return '';
    const body = numbered ? `<ol class="cs-list">${items.map((x) => `<li>${x}</li>`).join('')}</ol>`
      : bullets ? `<ul class="cs-list">${items.map((x) => `<li>${x}</li>`).join('')}</ul>`
      : items.map((p) => `<p>${p}</p>`).join('\n    ');
    n += 1;
    return `
  <section class="box cs-section" aria-labelledby="${id}">
    <h2 id="${id}"><span class="num" aria-hidden="true">${String(n).padStart(2, '0')}</span> ${heading}</h2>
    ${body}
  </section>`;
  };

  // Optional workflow diagram (content/site.json "caseFlows"), built from text so it stays readable.
  const flowSection = (flow) => {
    if (!flow?.steps?.length) return '';
    n += 1;
    const box = (x) => `<div class="flow-box${x.tone ? ` flow-${x.tone}` : ''}">${x.label ? `<p class="flow-label">${esc(x.label)}</p>` : ''}<p>${esc(x.text)}</p></div>`;
    const steps = flow.steps.map((st) => st.branches
      ? `<li class="flow-split"><ul>${st.branches.map((br) => `<li>${box(br)}</li>`).join('')}</ul></li>`
      : `<li>${box(st)}</li>`).join('\n      ');
    return `
  <section class="box cs-section" aria-labelledby="how-it-works">
    <h2 id="how-it-works"><span class="num" aria-hidden="true">${String(n).padStart(2, '0')}</span> ${esc(flow.title)}</h2>
    <ol class="flow">
      ${steps}
    </ol>
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
  <p class="crumb"><a href="${back.href}">${back.text}</a></p>
  <header class="box box-sky cs-header">
    ${item.theme || side ? `<p class="label">${t(side ? (item.theme ? `Side project · ${item.theme}` : 'Side project') : item.theme)}</p>` : ''}
    <h1>${t(headline) || esc(item.project)}</h1>
    <p class="cs-context">${context}</p>
  </header>
  ${tilesHtml}
  ${side ? [
    section('idea', 'Idea', item.idea),
    section('problem', 'Problem', item.problem),
    section('proposal', 'Proposal', item.proposal),
    section('user-flow', 'User flow', item.userFlow),
    section('expected-outcome', 'Expected outcome', item.expectedOutcome),
    section('success-metrics', 'Success metrics', item.successMetrics),
    section('how-i-built-it', 'How I built it', item.did),
    flowSection(site.caseFlows?.[item.slug]),
    section('result', 'Result', item.result),
    section('what-i-learned', 'What I learned', item.learned),
    section('whats-next', 'What’s next', item.next),
  ].join('') : [
    section('problem', 'Problem', item.problem),
    section('what-i-did', 'What I did', item.did),
    flowSection(site.caseFlows?.[item.slug]),
    section('result', 'Result', item.result),
    section('what-i-learned', 'What I learned', item.learned),
    section('whats-next', 'What’s next', item.next),
  ].join('')}
  ${item.projectLink ? `<p class="cs-link"><a class="button" href="${esc(item.projectLink)}" target="_blank" rel="noopener">See the project<span class="sr-only"> (opens in a new tab)</span></a></p>` : ''}
  ${skills ? `<p class="box box-stone skills-line"><strong>Skills demonstrated:</strong> ${skills}.</p>` : ''}
  <nav class="cs-nav" aria-label="Case studies">
    <a href="${back.href}">${back.text}</a>
    ${next ? `<a href="../${next.slug}/">Next ${side ? 'side project' : 'case study'}: ${esc(next.project)}</a>` : ''}
  </nav>
</article>
</div>`;

  return page({
    site,
    title: `${item.project} | ${site.name}, ${site.jobTitle}`,
    description: clip(`${sentence(stripNotes(headline))} ${sentence(stripNotes(item.problem))}`),
    body,
    root: '../../',
    path: `${folder}/${item.slug}/`,
    ogType: 'article',
  });
}
