# Feedback tool — Figma-style comments for Nuxt 4

A self-contained, drop-in commenting overlay so a client can browse a site and
leave pinned feedback (place a pin anywhere → comment → reply/resolve), without
any account or access to a CMS. Built as a **Nuxt layer**, so reusing it in
another Nuxt 4 project is one line.

It's a **temporary dev/review tool** — gate it on for the review phase and off for
the real launch.

---

## Install in another project

1. Copy the whole `feedback/` folder into the project root.
2. Extend it from the host `nuxt.config`:
   ```js
   export default defineNuxtConfig({
     extends: ['./feedback'],
   })
   ```
3. Set env vars (see below). Done — the toolbar appears bottom-center.

The layer touches **no host files**: it merges its own `runtimeConfig`, server
routes (`/api/feedback`), and a client plugin that mounts the overlay into
`<body>` (so it sits above page transitions and needs no edits to `app.vue` /
layouts).

### Requirements

- Nuxt 4, `@sanity/client` (already in this stack), and a `public.sanity`
  runtime config (`projectId` / `dataset` / `apiVersion`). The layer self-declares
  these from env as a fallback, so a project that already has them just works.

---

## Storage

Backend is chosen automatically (see `server/utils/feedbackStore.js`):

| When | Backend | Notes |
| --- | --- | --- |
| `SANITY_API_WRITE_TOKEN` set | **Sanity** | The real path. Works on Vercel/serverless. Comments are `_type: "feedbackComment"`, ids prefixed `feedback.` — they never appear in the Studio and the write endpoints are hard-limited to that prefix, so they can't touch real content. |
| no token (local dev) | **`.data/feedback.json`** | Zero-config. The file is gitignored. Lets you try the tool instantly, but it's per-machine — for a client on a deployed preview you need the Sanity token. |

> A separate dataset is **not** required — comments live in your existing dataset
> under their own type and stay out of the Studio.

---

## Environment

```bash
# Sanity token with write (Editor) access. REQUIRED in production/preview
# (read-only filesystem). Optional in local dev (file fallback).
SANITY_API_WRITE_TOKEN=sk...

# Force-enable in a production build — e.g. the Vercel PREVIEW the client reviews.
# Leave unset/false for the real launch. Always on in `nuxt dev`.
FEEDBACK_ENABLED=true
```

Create the token at <https://manage.sanity.io> → API → Tokens (Editor). Add both
vars to the host `.env` and to the Vercel project (Preview environment).

---

## Turn it off for launch

Any one of:

- set `FEEDBACK_ENABLED=false` (or remove it) in the production env, **or**
- remove `extends: ['./feedback']` from `nuxt.config`, **or**
- delete the `feedback/` folder.

When disabled, the plugin mounts nothing and the API returns `[]` / `403`.

---

## Usage

- **Comment** in the toolbar → click anywhere on the page to drop a pin → type →
  *Comment* (or ⌘/Ctrl+Enter).
- Click a pin to open its thread: reply, **Resolve**/Reopen, or **Delete**.
- **Resolved** checkbox toggles resolved pins; the count shows open comments on
  the current page.
- First comment asks for a name (stored in `localStorage`); change it via the
  name chip.
- Pins are stored as fractions of the document and scoped per route, so they
  track the right spot as the responsive layout reflows. Comments refresh on
  focus and every 15s, so you and the client see each other's notes.

---

## Security note

The write endpoints are intentionally **public** (anyone with the URL can comment)
— that's the point of a client-review tool. They're constrained to the
`feedbackComment` type and `feedback.` id prefix, so they can't read or modify
your real content, and the whole thing is meant to be switched off before launch.
For a sensitive preview, also protect it at the deploy layer (e.g. Vercel
password protection / preview auth).

---

## Files

```
feedback/
  nuxt.config.js                 layer entry — runtimeConfig + registers the plugin
  runtime/
    feedback.client.js           gates, wires route + transition, mounts overlay
    FeedbackOverlay.vue          the entire UI (scoped styles, no global CSS)
    useFeedback.js               shared reactive store + API calls
  server/
    api/feedback/                REST: GET list · POST create · PATCH · DELETE
    utils/feedbackStore.js       storage adapter (Sanity ⇄ local file)
```
