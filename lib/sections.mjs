// Home page sections. Each takes the site content (and items) and returns HTML, or '' to skip.
import { ADD_MARKER, el, esc, firstSentence, sentence, text } from './util.mjs';

// Keep terms like "0-to-1" on one line (no break at the hyphens).
const together = (html) => html.replace(/0-to-1/g, '<span class="nowrap">0-to-1</span>');

// Values with arrows get a spoken version for screen readers ("12 hours down to 5 minutes").
const statValue = (s) => s.spoken
  ? `<span class="stat-value" aria-hidden="true">${esc(s.value)}</span><span class="sr-only">${esc(s.spoken)}</span>`
  : `<span class="stat-value">${esc(s.value)}</span>`;

// Intro: pills, outcome headline, summary and buttons, with the photo alongside.
// Without assets/photo.* the photo is left out (published) or shown as a placeholder (dev).
export function hero(site, dev) {
  const pills = (site.pills ?? []).map((p, i) => `<li class="pill pill-${(i % 4) + 1}">${esc(p)}</li>`).join('');
  const photo = site.photo
    ? `<figure class="portrait"><img src="${esc(site.photo)}" alt="${esc(`Portrait of ${site.name}, ${site.jobTitle}`)}" width="800" height="1000"></figure>`
    : dev ? `<figure class="portrait portrait-empty"><p>${ADD_MARKER} Save your photo as assets/photo.jpg</p></figure>` : '';
  return `
<section class="hero${photo ? ' has-photo' : ''}" aria-labelledby="hero-title">
  <div class="hero-text">
    ${pills ? `<ul class="pills" aria-label="Focus areas">${pills}</ul>` : ''}
    <h1 id="hero-title">${together(esc(site.hero.headline))}</h1>
    <p class="lede">${together(esc(site.hero.subline))}</p>
    <p class="actions"><a class="button" href="#work">See my work</a> <a class="button" href="#contact">Contact me</a></p>
  </div>
  ${photo}
</section>`;
}

export const stats = (site) => `
<section class="stats" aria-label="Highlights">
  <ul>${site.stats.map((s) => `
    <li>${statValue(s)} <span class="stat-label">${esc(s.label)}</span></li>`).join('')}
  </ul>
</section>`;

// Outcome headline: sheet "Card headline", then site.json cardHeadlines, then Result.
export const headlineFor = (item, site) => item.cardHeadline || site.cardHeadlines?.[item.slug] || item.result;

export function work(site, featured, dev) {
  const t = (v) => text(v, { dev });
  const cards = featured.map((i) => {
    const headline = together(t(headlineFor(i, site)));
    return `
    <article class="card">
      ${el('p', t(i.theme), 'class="label"')}
      <h3><a href="work/${i.slug}/">${headline}</a></h3>
      ${el('p', t(i.metrics[0]), 'class="metric"')}
      ${el('p', t(i.cardSentence || site.cardSentences?.[i.slug] || firstSentence(i.did)))}
    </article>`;
  }).join('');
  return `
<section id="work" aria-labelledby="work-title">
  <h2 id="work-title">Work</h2>
  <div class="cards">${cards}
  </div>
</section>`;
}

export function moreWins(wins, dev) {
  const rows = wins.map((i) => {
    const result = text(sentence(i.result), { dev });
    if (!result) return '';
    const name = i.featured ? `<a href="work/${i.slug}/">${esc(i.project)}</a>` : esc(i.project);
    return `\n    <li><strong>${name}:</strong> ${result}</li>`;
  }).join('');
  if (!rows) return '';
  return `
<section id="more-wins" aria-labelledby="wins-title">
  <div class="box">
  <h2 id="wins-title">More wins</h2>
  <ul class="wins">${rows}
  </ul>
  </div>
</section>`;
}

// Small numbered badge before a box heading (decorative, hidden from screen readers).
const num = (n) => `<span class="num" aria-hidden="true">${String(n).padStart(2, '0')}</span>`;

// About: sky header panel, "Who I am" box, then "What I do best" cards in a rose panel.
export const about = (site) => `
<section id="about" aria-labelledby="about-title">
  <header class="box box-sky about-head">
    <p class="eyebrow">${esc(site.about.eyebrow)}</p>
    <h2 id="about-title">About</h2>
    <p class="about-sub">${esc(site.jobTitle)} at ${esc(site.employer)}. Based in ${esc(site.location)}.</p>
  </header>

  <div class="box">
    <h3 class="box-title">${num(1)} Who I am</h3>${site.about.whoIAm.map((p) => `
    ${p.heading ? `<h4>${esc(p.heading)}</h4>` : ''}
    <p>${esc(p.text)}</p>`).join('')}
  </div>

  <div class="box box-rose">
    <h3 class="box-title">${num(2)} What I do best</h3>
    <div class="best-grid">${site.about.bestAt.map((b) => `
      <div class="box box-inner">
        <h4>${esc(b.title)}</h4>
        <p>${esc(b.text)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;

export const skills = (site) => `
<section id="skills" class="box box-lavender" aria-labelledby="skills-title">
  <h2 id="skills-title">Skills</h2>
  <p>${esc(site.skillsIntro)}</p>
  <dl class="skills-list">${site.skills.map((g) => `
    <div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(', ')}</dd></div>`).join('')}
  </dl>
</section>`;

// Education, Certifications and Publications as three stone boxes side by side.
const factBox = (id, title, items) => `
  <section id="${id}" class="box box-stone fact" aria-labelledby="${id}-title">
    <h2 id="${id}-title">${title}</h2>
    <ul>${items.map(([main, sub]) => `
      <li><strong>${main}</strong>${sub ? `<span>${sub}</span>` : ''}</li>`).join('')}
    </ul>
  </section>`;

export const facts = (site) => `
<div class="facts">${factBox('education', 'Education', site.education.map((e) => [esc(e.degree), `${esc(e.school)}, ${esc(e.years)}`]))}${factBox('certifications', 'Certifications', site.certifications.map((c) => [esc(c.name), [c.issuer, c.date, c.credentialId && `Credential ID ${c.credentialId}`].filter(Boolean).map(esc).join(' · ')]))}${factBox('publications', 'Publications', site.publications.map((p) => [`<cite>${esc(p.title)}</cite>`, `${esc(p.venue)}, ${esc(p.date)}`]))}
</div>`;

export const contact = (site) => `
<section id="contact" class="box box-lavender" aria-labelledby="contact-title">
  <h2 id="contact-title">Contact</h2>
  <p>The best way to reach me is by email or LinkedIn.</p>
  <ul class="plain contact">
    <li>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
    <li>LinkedIn: <a href="${esc(site.linkedin)}">${esc(site.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></li>
    <li>Location: ${esc(site.location)}</li>
    <li><a href="assets/resume.pdf" target="_blank" rel="noopener">View my resume (PDF)<span class="sr-only"> (opens in a new tab)</span></a></li>
  </ul>
</section>`;
