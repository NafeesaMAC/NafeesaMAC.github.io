// JSON-LD Person. The phone number is deliberately not included.
export function personJsonLd(site, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.jobTitle,
    email: `mailto:${site.email}`,
    ...(siteUrl && { url: `${siteUrl}/` }),
    ...(siteUrl && site.photo && { image: `${siteUrl}/${site.photo}` }),
    sameAs: [site.linkedin],
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.countryCode,
    },
    worksFor: { '@type': 'Organization', name: site.employer },
    alumniOf: [...new Set((site.education ?? []).map((e) => e.school))].map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    hasCredential: (site.certifications ?? []).filter((c) => c.issuer).map((c) => ({
      '@type': 'EducationalOccupationalCredential', name: c.name, recognizedBy: { '@type': 'Organization', name: c.issuer },
    })),
  };
}

export function sitemapXml(siteUrl, paths, date) {
  const urls = paths.map((p) => `  <url><loc>${siteUrl}/${p}</loc><lastmod>${date}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const robotsTxt = (siteUrl) => `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`;
