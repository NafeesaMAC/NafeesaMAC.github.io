import { page } from './layout.mjs';
import { personJsonLd } from './seo.mjs';
import * as s from './sections.mjs';

// Home page, in the order set in CLAUDE.md.
export function renderHome({ site, featured, wins, dev, siteUrl }) {
  const body = [
    s.hero(site, dev),
    s.stats(site),
    s.work(site, featured, dev),
    s.moreWins(wins, dev),
    s.about(site),
    s.skills(site),
    s.facts(site),
    s.contact(site),
  ].filter(Boolean)
    // Each section sits on a full-width band that fades from cream to lavender at its end.
    .map((html) => `<div class="band">${html}\n</div>`)
    .join('\n');

  return page({
    site,
    title: `${site.name} | ${site.titleTagline}`,
    description: site.description,
    body,
    root: './',
    jsonLd: personJsonLd(site, siteUrl),
  });
}
