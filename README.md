# Handoff pack: Nafeesa's portfolio

Put this whole folder in your project folder, then open it in VS Code and start Claude Code there. Claude Code reads `CLAUDE.md` automatically.

## What is in here
- `CLAUDE.md`: the rules Claude Code follows (design, content, ATS, honesty).
- `content/`: your resume, LinkedIn text, credentials and contact placeholders.
- `data/`: put your exported Brag Book CSV here (see `data/README.md`).
- `apps-script/Code.gs`: the Google Apps Script that publishes only your ticked rows.
- `.github/workflows/deploy.yml`: builds and deploys to GitHub Pages.
- `.env.example` and `.gitignore`: keep your sheet URL out of GitHub.

## Setup order
1. **Brag Book to Google Sheets.** In the Brag Book sheet, download as .xlsx, upload it to Google Drive, open with Google Sheets. Rename the tab `Portfolio Data`. Add columns: Show on portfolio (checkbox), Featured (checkbox), Theme, Headline metric, Cover image link, Order.
2. **Apps Script.** In the Google Sheet open Extensions, then Apps Script. Paste `apps-script/Code.gs`. Choose Deploy, New deployment, Web app, Execute as: Me, Who has access: Anyone. Copy the web app URL.
3. **Local secret.** Copy `.env.example` to `.env` and paste the URL as `SHEET_URL`. Never commit `.env`.
4. **GitHub.** Create a repo, then Settings, Secrets and variables, Actions, New repository secret: name `SHEET_URL`, value the URL. Then Settings, Pages, Source: GitHub Actions.
5. **Start Claude Code** in this folder and give it the prompts below, one at a time.

## Prompts for Claude Code
1. "Read CLAUDE.md and everything in content/. Propose a file structure and the home page layout. Wait for my approval."
2. "Create build.mjs that reads SHEET_URL (or data/brag-book.csv), and writes dist/index.html plus one dist/work/<slug>/index.html for each Featured row. Add npm scripts."
3. "Build the home page: hero, 4 stat tiles, featured cards, more wins, About, Recommendations, Skills and certifications, Publications, Contact. Use the content files."
4. "Build the case-study template following the page structure in CLAUDE.md."
5. "Add SEO: title, meta description, Open Graph, JSON-LD Person, sitemap.xml, robots.txt and alt text."
6. "Run it locally and fix spacing so nothing feels cramped. Then check accessibility and run a Lighthouse audit."
7. "Review .github/workflows/deploy.yml, then help me push to GitHub and deploy."

## Updating later
Edit a row in the sheet, tick or untick Show on portfolio, then run the workflow from the repo's Actions tab (or wait for the daily run).

## Before you publish
Check with Twin Health that the figures, partner details and tool names are cleared for public sharing. Never include patient or member data.
