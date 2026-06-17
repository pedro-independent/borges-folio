# Pedro Borges — Sanity Studio

The CMS for the portfolio. Self-contained Sanity Studio (separate from the Nuxt
app). The front-end reads published content over GROQ via `@sanity/client`.

## Structure

The desk is organised into three groups (see `structure.js`):

- **General site settings** — brand name, contact email, location/clock, social
  links, default SEO. A single document.
- **Pages** — one editable document per page: **Home**, **About**, **Work**,
  **Contact** (static/editorial content for each).
- **Projects** — the case studies. Each item is one project.

Site settings and the page documents are **singletons** — they can be edited and
published but not created again, deleted, or duplicated.

## Run it

```bash
cd studio
npm install
npm run dev        # http://localhost:3333
```

The project ID / dataset come from `sanity.config.js` + `sanity.cli.js`. Either
edit the inlined value, or create a `.env` (see `.env.example`):

```
SANITY_STUDIO_PROJECT_ID=xxxxxxxx
SANITY_STUDIO_DATASET=production
```

## Schemas

- `schemaTypes/documents/` — `siteSettings`, `homePage`, `aboutPage`, `workPage`,
  `contactPage`, `project`.
- `schemaTypes/objects/` — reusable blocks: `seo`, `socialLink`, `ctaLink`.

## Deploy

```bash
npm run deploy     # hosts the Studio at <name>.sanity.studio
```

> Remember to add the front-end origin under **API → CORS origins** in
> manage.sanity.io so the Nuxt app can fetch from the browser.
