// Safety checks on the generated HTML. Any hit fails the build so nothing private gets deployed.

// Phone-like numbers: "+<country code> ..." or a 10-digit Indian mobile, with optional spaces or dashes.
const PHONE = /\+\d{1,3}[\s-]?\d[\d\s-]{7,}\d|\b[6-9]\d{4}[\s-]?\d{5}\b/;

// Numbers in `source` that are missing from `rewrite` ("zero" counts as 0).
const numbers = (s) => (s.replace(/\bzero\b/gi, '0').match(/\d[\d,.]*[KkMm%]?/g) ?? []).map((n) => n.replace(/[,.]$/, ''));
export const missingNumbers = (source, rewrite) => numbers(source).filter((n) => !numbers(rewrite).includes(n));

export function checkOutput(pages, { privateTexts, dev }) {
  const problems = [];
  for (const [file, html] of pages) {
    const phone = html.match(PHONE);
    if (phone) problems.push(`${file}: contains what looks like a phone number ("${phone[0]}")`);
    for (const s of privateTexts) {
      if (html.includes(s)) problems.push(`${file}: contains a private note ("${s.slice(0, 40)}…")`);
    }
    if (!dev && html.includes('[ADD')) problems.push(`${file}: contains an [ADD] marker or note`);
    const insecure = html.match(/(?:href|src)="http:\/\/[^"]+"/);
    if (insecure) problems.push(`${file}: insecure http:// link (${insecure[0]})`);
  }
  return problems;
}
