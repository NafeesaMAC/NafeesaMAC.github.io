# Nafeesa – Product Manager portfolio

## Goal
A clean, uncluttered portfolio website that leads with outcomes and impact, and reads well to ATS tools, recruiter search and search engines. Content comes from my Brag Book (a Google Sheet) so I can add, hide or delete achievements any time.

## How this project works
- Static site. `build.mjs` fetches JSON from `process.env.SHEET_URL` (a Google Apps Script web app) and writes plain HTML and CSS into `dist/`.
- If `SHEET_URL` is not set, read `data/brag-book.csv` instead so I can develop offline.
- Hosted on GitHub Pages, deployed by `.github/workflows/deploy.yml` (on push, daily, and manually).
- No framework unless I ask. No client-side fetching of the sheet: all content must be in the generated HTML so crawlers can read it.
- Never commit `.env`. The sheet URL lives in `.env` locally and in the GitHub Actions secret `SHEET_URL`.

## Data (one row = one achievement)
Columns: Project, Role, Period, Result, Problem, What I did, PM keywords, Numbers still to add, Impact type, Recruiter appeal (Top / Strong / Supporting), Why it attracts recruiters, Show on portfolio, Featured, Theme, Headline metric, Cover image link, Order.
- Show only rows where Show on portfolio is TRUE.
- Featured rows get a full case-study page (`dist/work/<slug>/index.html`). Other shown rows are one-line wins.
- Never output "Numbers still to add" or "Why it attracts recruiters" on the site. Those are private notes.
- Sort by Order, then Recruiter appeal (Top first).

## Design
- Palette (used on every page): each section sits on a full-width band that starts cream #F7F0E5 and fades to lavender #E4D9EE at its end, where it hands over to the next section (case-study pages use one band before the footer); boxes cream #FBF7F0; panels sky #ACD5E2, rose #DCA2AC, lavender #DFD2EE, stone #ECE6DB, sand #E8D5BC; text ink #2B211D, secondary text #5B4F49; accent teal #0A5C5C (buttons and links); numbers deep rose #A33A55. Never put grey text or links on rose, and use only ink text on rose.
- Box style (from the reference site thaisafernandes.com): every section sits in a box with a 3px ink border, square corners and a solid 6px ink offset shadow. About opens with a sky header panel, then "01 Who I am" (cream) and "02 What I do best" (rose panel with four cream cards). Skills and Contact are lavender boxes. Education, Certifications and Publications are three stone boxes side by side. Case studies use a sky header panel and numbered cream boxes per section. The footer is a dark ink band with your name, title and location. Keep DM fonts and no icons.
- Fonts: DM Serif Display (headings), DM Sans (body), loaded from Google Fonts.
- Single-column page flow, max width 1080px, generous whitespace, mobile friendly, text contrast at least 4.5:1. Exceptions: the intro puts the photo beside the text, stat tiles sit 4 across (2×2 on smaller screens), and Work cards are 2×2. All stack to one column on phones.
- No carousels, popups, decorative icons or stock photos.
- Motion is limited to these effects, and every one is switched off when the visitor's device asks for reduced motion:
  - Scroll fade-in: home page sections below the first screen fade and slide up as they come into view, and the Work cards appear one after another (`assets/reveal.js`). All content stays in the HTML, and nothing is hidden if JavaScript is off.
  - Work card highlight: on hover or keyboard focus a card shifts up and left, its ink shadow grows, a teal left edge appears and its headline underlines.
  - Buttons ("See my work", "Contact me") and the header menu (Work, About, Contact, Resume (PDF)) are embossed teal pills that turn deeper teal and lift slightly on hover or focus, and press in when tapped.
  - On touch screens (no hover), the Work card nearest the middle of the screen gets the highlight as the visitor scrolls.
  - In-page links scroll smoothly and land exactly on their heading, just below the sticky header (reveal.js measures the header height into --header-h).
- Sticky header: a floating rounded bar that stays at the top while scrolling, semi-transparent cream with a frosted blur, 2px ink border and ink offset shadow. On phones it is compact and hides the job-title line.
- CTA colour: every button and menu pill uses a left-to-right gradient from deep teal #063F3F through #0A5C5C to #1A7F7F (white text at least 4.8:1), darker on hover.
- On phones, the header and intro are compact so the pills, headline, summary and both buttons fit on the first screen without scrolling (checked at 375×667 and 390×844).
- Category labels on cards are embossed pale-teal pill badges. The intro has pastel pills above the headline and the photo (`assets/photo.jpg`) in a tilted, layered frame on the right.
- Do not add other animations without asking.
- Workflow diagrams (content/site.json "caseFlows", keyed by case-study slug) are built from HTML text and boxes, never images, so every step stays readable to crawlers and screen readers. Only the blood-draw case study has one, and it uses only facts from that row of the Brag Book.
- Max 4 featured case studies on the home page. Each card: category label, outcome headline, one metric, one sentence. Nothing more.

## Page structure
Home: hero (one-line outcome headline) → 4 stat tiles → Work (featured cards) → More wins (one line each) → About → Skills and certifications → Publications → Contact.
Case study: outcome headline → up to 3 metric tiles → Problem → What I did → Result → What I learned → Skills demonstrated.

## Content rules
- Lead with the outcome, then the number, then the method. Example: "Cut report upload from 20 minutes to zero with an AI agent".
- Only the blood-draw agent is labelled AI. The adherence and commitment-tracker agents are rule-based automation. Do not call them AI.
- Do not invent numbers. If a value is missing or a placeholder like [X]%, leave it out or show a visible `[ADD]` marker in development only, never on the published site.
- No member data, partner names or confidential figures. Round rupee figures (for example "about Rs. 75K a month") and generalise partners ("a US payer partner").
- Use plain, active language. No keyword stuffing.

## ATS and SEO rules
- One H1 per page, then H2 sections named plainly: Work, About, Skills, Certifications, Publications, Contact.
- Page title pattern: "Nafeesa | Product Manager, Digital Health | Partner Launches, AI Automation". Meta description about 150 characters.
- Keywords appear in sentences, not only in lists, and never inside images. Every image has alt text.
- Use these exact phrases where they are true: Product Manager, Product Strategy, Product Roadmap, Go-to-Market Strategy, Stakeholder Management, Cross-Functional Leadership, Product Analytics, 0-to-1, Product Launch, Workflow Automation, AI Agents, Digital Health, Partner Launches.
- Each case study ends with a "Skills demonstrated" line built from the row's PM keywords column.
- Add JSON-LD `Person` structured data, a sitemap.xml, robots.txt, Open Graph tags, and a visible link to the resume PDF.

## Working style
Propose the plan before writing files. Build one section at a time, run it locally (`npm run dev` or `node build.mjs`) and show me what changed. Keep files small and readable.
