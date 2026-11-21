import { readFile } from 'node:fs/promises';

const COUNTRY_CODES = { India: 'IN' };

// Reads "- Key: value" lines from content/contact.md and merges content/site.json.
export async function loadSite({ contactPath, sitePath }) {
  const md = await readFile(contactPath, 'utf8');
  const fields = {};
  for (const [, key, value] of md.matchAll(/^- ([^:(]+?)\s*(?:\([^)]*\))?:\s*(.+)$/gm)) {
    fields[key.trim().toLowerCase()] = value.trim();
  }
  const need = (key) => {
    if (!fields[key]) throw new Error(`content/contact.md is missing "${key}"`);
    return fields[key];
  };

  const extra = JSON.parse(await readFile(sitePath, 'utf8'));
  const site = {
    ...extra,
    name: need('display name'),
    jobTitle: need('job title'),
    email: need('email'),
    linkedin: need('linkedin'),
    location: need('location line'),
    city: need('city'),
    region: need('state'),
    country: need('country'),
    countryCode: COUNTRY_CODES[need('country')] ?? need('country'),
  };
  return site;
}
