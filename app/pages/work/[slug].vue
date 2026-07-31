<script setup>
// Project case-study template (Figma nodes 15491-216 / 15491-371). Hero, cover
// and problem statement are structured fields; everything below is one Portable
// Text `body` the client owns in the Studio — split into labelled rows on
// "Section label" (h2) blocks by caseSections() and rendered with
// @portabletext/vue. Falls back to utils/projects.js field-by-field if the CMS
// is unreachable or a field is empty (in-page media falls back to placeholder
// tints until real images are uploaded). The "Next up" footer is handled by
// AppFooter on /work/[slug].
import { h } from 'vue'
import { PortableText } from '@portabletext/vue'
import { PROJECT_BY_SLUG } from '~/utils/sanityQueries'

const route = useRoute()
const slug = route.params.slug

// Block on the server (SSR ships real data) but NOT on client-side navigation,
// so the page transition isn't suspended waiting on the fetch.
const { data } = await useSanityQuery(`project:${slug}`, PROJECT_BY_SLUG, { slug }, { lazy: import.meta.client })
const local = getProject(slug)

// Field-wise merge: prefer CMS, fall back to the local mirror per field — a
// partially filled CMS doc (e.g. seeded card-only) still renders a full page.
// GROQ returns null for absent fields, so a plain spread would clobber local
// values with nulls.
const project = computed(() => {
  const cms = data.value
  if (!cms) return local || null
  if (!local) return cms
  return {
    ...local,
    ...cms,
    category: cms.category || local.category,
    description: cms.description || local.description,
    services: cms.services?.length ? cms.services : local.services,
    awards: cms.awards ?? local.awards,
    liveUrl: cms.liveUrl || local.liveUrl,
    tint: cms.tint || local.tint,
    cover: cms.cover || local.cover,
    problem: cms.problem || local.problem,
    body: cms.body?.length ? cms.body : local.body,
  }
})

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const sections = computed(() => caseSections(project.value?.body))

useSeo({
  type: 'article',
  title: () => project.value?.seo?.metaTitle || project.value?.title,
  description: () => project.value?.seo?.metaDescription || project.value?.description,
  // Prefer an explicit social image, else the case-study cover (a real uploaded
  // photo URL makes the best share card); the default handles tint-only covers.
  image: () => {
    const img = project.value?.seo?.ogImage || project.value?.cover
    return img && /^https?:/.test(img) ? img : undefined
  },
})

// Cover media: a real uploaded image (Sanity URL) renders as a cover-fit photo;
// the legacy hex `tint` stays a flat background. Mirrors work/index.js cardMedia.
const coverStyle = computed(() => {
  const cover = project.value?.cover
  if (cover && /^(https?:|\/)/.test(cover)) {
    return { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: cover || project.value?.tint }
})

// --- Portable Text renderer --------------------------------------------------
// A real uploaded image renders as an <img>; the local fallback's tint
// placeholder renders as a flat box with the same footprint.
// `data-click-zoom` opts each uploaded image into the click-to-zoom lightbox
// (plugins/click-zoom.client.js) — rich-text media only, so the hero, cover and
// the small stat avatars stay untouched. Tint placeholders have nothing to zoom.
const mediaNode = (value, half) => {
  const cls = half ? 'case__media-sq' : 'case__media-wide'
  if (value.url) {
    // Sanity image CDN params keep payloads sane without touching the asset.
    return h('img', {
      class: cls,
      'data-click-zoom': '',
      src: `${value.url}?w=${half ? 900 : 1600}&fit=max&auto=format`,
      alt: value.alt || '',
    })
  }
  return h('div', { class: cls, style: { background: value.tint || 'var(--color-lavender)' }, 'aria-hidden': 'true' })
}

const ptComponents = {
  block: {
    h3: (_, { slots }) => h('h3', { class: 'case__h' }, slots.default?.()),
    h4: (_, { slots }) => h('p', { class: 'case__sub' }, slots.default?.()),
    normal: (_, { slots }) => h('p', { class: 'case__p' }, slots.default?.()),
  },
  marks: {
    link: ({ value }, { slots }) =>
      h(
        'a',
        /^https?:/.test(value?.href || '')
          ? { href: value.href, target: '_blank', rel: 'noopener' }
          : { href: value?.href },
        slots.default?.(),
      ),
  },
  types: {
    image: ({ value }) => mediaNode(value, false), // full-width single
    imageRow: ({ value }) => h('div', { class: 'case__media-row' }, value.images.map((img) => mediaNode(img, true))),
    stats: ({ value }) =>
      h(
        'div',
        { class: 'case__outcomes' },
        (value.items || []).map((item, i) =>
          h('div', { class: 'case__outcome', key: item._key || i }, [
            h('span', { class: 'case__label' }, item.label),
            h('p', { class: 'case__outcome-value' }, [
              item.image ? h('img', { class: 'case__outcome-avatar', src: `${item.image}?w=96&h=96&fit=crop&auto=format`, alt: '' }) : null,
              item.value,
            ]),
          ]),
        ),
      ),
  },
}
</script>

<template>
  <article class="case" data-theme-section="light">
    <!-- Title card -->
    <section class="case__hero container">
      <div class="case__hero-card">
        <div class="case__hero-head">
          <div class="case__hero-titlerow">
            <h1 class="case__hero-title">{{ project.title }}</h1>
            <div class="case__hero-meta">
              <span class="case__hero-cat">{{ project.category }}</span>
              <span class="case__hero-links">
                <a v-if="project.liveUrl" class="case__hero-live" :href="project.liveUrl" target="_blank" rel="noopener">Open website</a>
                <span v-if="project.awards" class="case__badge">{{ awardLabel(project.awards) }}</span>
              </span>
            </div>
          </div>
          <p class="case__hero-desc">{{ project.description }}</p>
        </div>
        <div v-if="project.services?.length" class="case__services">
          <span v-for="s in project.services" :key="s">{{ s }}</span>
        </div>
      </div>
    </section>

    <!-- Cover -->
    <section class="case__cover container">
      <div class="case__cover-img" :style="coverStyle" />
    </section>

    <!-- The problem -->
    <section v-if="project.problem" class="case__problem container">
      <div class="case__problem-inner">
        <h2 class="case__label">The problem</h2>
        <p class="case__problem-statement">{{ project.problem }}</p>
      </div>
    </section>

    <!-- Body: the client-owned rich text, one labelled row per "Section label" -->
    <div v-if="sections.length" class="case__body container">
      <section v-for="s in sections" :key="s.key" class="case__row">
        <div class="case__row-label">
          <h2 v-if="s.label" class="case__label">{{ s.label }}</h2>
        </div>
        <div class="case__col">
          <PortableText :value="s.blocks" :components="ptComponents" />
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
/* === PROJECT DETAIL (Figma 1440 frame; px ÷ 16 = em) ============
   Body sized in em so it rides the global scaling tiers. Horizontal gutters come
   from .container (padding-block keeps them intact); responsive rules below only
   change layout shape. Everything inside .case__col is rendered by PortableText
   (a child component), so those rules go through :deep(). */

.case__label { font-size: 0.6875em; line-height: 1.1; } /* 11 */

/* Award badge (matches the work page badge) */
.case__badge {
  flex-shrink: 0;
  font-size: 0.6875em;              /* 11 */
  line-height: 1;
  padding: 0.4em 0.73em 0.5em;
  border-radius: 0.73em;
  background: var(--color-blue);
  color: var(--color-off-white);
  text-transform: uppercase;
  white-space: nowrap;
}

/* Title card */
.case__hero { padding-top: 5em; }  /* 80 */
.case__hero-card {
  background: var(--color-off-white);
  border-radius: 0.5em;             /* 8 */
  padding: 15em 5.4375em 2em;       /* 240 / 87 / 32 — content anchored bottom */
  display: flex;
  flex-direction: column;
  gap: 2.5em;                       /* 40 */
}
.case__hero-head { display: flex; flex-direction: column; gap: 1em; } /* 16 */
.case__hero-titlerow { display: flex; flex-direction: column; gap: 0.5em; } /* 8 */
.case__hero-title { font-size: 2.5em; line-height: 1.1; } /* 40 */
.case__hero-meta { display: flex; align-items: center; justify-content: space-between; gap: 1em; }
.case__hero-cat { font-size: 0.6875em; } /* 11 */
.case__hero-links { display: flex; align-items: center; gap: 1.5em; }
.case__hero-live { font-size: 0.6875em; text-decoration: underline; text-underline-offset: 0.2em; } /* 11 */
.case__hero-live:hover { color: var(--color-blue); }
.case__hero-desc { font-size: 1em; line-height: 1.3; opacity: 0.4; } /* 16 */
.case__services {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5em 1.5em;                 /* row 8 */
  font-size: 1em;                   /* 16 */
}

/* Cover */
.case__cover { padding-block: 0.25em; }
.case__cover-img {
  width: 100%;
  aspect-ratio: 868 / 581;
  border-radius: 0.5em;             /* 8 */
}

/* The problem */
.case__problem { padding-block: 5em; }  /* 80 */
.case__problem-inner {
  display: flex;
  flex-direction: column;
  gap: 1.5em;                       /* 24 */
  padding-left: 5.4375em;           /* 111 from viewport (24 container + 87) */
  padding-right: 32.6875em;         /* 547 from viewport */
}
.case__problem-statement { font-size: 2.5em; line-height: 1.1; } /* 40 */

/* Body rows */
.case__body { padding-block: 5em; display: flex; flex-direction: column; gap: 5em; } /* 80 / 80 */
.case__row { display: flex; align-items: flex-start; gap: 0.25em; padding-inline: 5.4375em; } /* px-111 */
.case__row-label { flex: 1 0 0; min-width: 0; padding-block: 1em; } /* 16 */
.case__col {
  flex: 0 0 32.4375em;             /* 519 */
  max-width: 32.4375em;
  border-top: 1px solid var(--color-line);
  padding-block: 1em;              /* 16 */
  display: flex;
  flex-direction: column;
  gap: 2em;                        /* 32 */
}

/* --- Rich text content (rendered by PortableText) --- */
.case__col :deep(.case__h) { font-size: 1.5em; line-height: 1.2; }               /* 24 — headings/statements */
.case__col :deep(.case__sub) { font-size: 0.6875em; line-height: 1.1; }          /* 11 — small field label */
.case__col :deep(.case__p) { font-size: 1em; line-height: 1.4; opacity: 0.6; }  /* 16 — body copy */
/* A small label binds tightly to what it introduces (8px, not the 32px flow gap). */
.case__col :deep(.case__sub + .case__p) { margin-top: -1.5em; }
.case__col :deep(ul),
.case__col :deep(ol) {
  margin: 0;
  padding-left: 1.25em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  font-size: 1em;
  line-height: 1.4;
  opacity: 0.6;
}
.case__col :deep(a) { text-decoration: underline; text-underline-offset: 0.2em; }
.case__col :deep(a:hover) { color: var(--color-blue); }

/* Facts row (outcome stats / team list) */
.case__col :deep(.case__outcomes) { display: flex; gap: 0.25em; }
.case__col :deep(.case__outcome) { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: 0.25em; }
.case__col :deep(.case__outcome-value) { font-size: 1.5em; line-height: 1.1; display: flex; align-items: center; gap: 0.333em; } /* 24 */
.case__col :deep(.case__outcome-avatar) { width: 1em; height: 1em; border-radius: 50%; object-fit: cover; }

/* Media: uploaded images and tint placeholders share the same footprint.
   Halves pair side by side (grouped into .case__media-row by caseSections). */
.case__col :deep(.case__media-row) { display: flex; gap: 0.25em; }
.case__col :deep(.case__media-sq) { flex: 1 0 0; min-width: 0; aspect-ratio: 432 / 387; border-radius: 0.25em; object-fit: cover; }
.case__col :deep(.case__media-wide) { width: 100%; aspect-ratio: 868 / 581; border-radius: 0.25em; object-fit: cover; display: block; }

/* === TABLET (≤991px) — reasonable reflow; refine when the frame lands ===== */
@media (max-width: 991px) {
  .case__hero-card { padding: 10em 2.5em 2em; }
  .case__problem-inner { padding-left: 0; padding-right: 25%; }
  .case__problem-statement { font-size: 2em; } /* 32 */

  .case__row { flex-direction: column; gap: 1em; padding-inline: 0; }
  .case__row-label { flex: none; padding-block: 0; }
  .case__col { flex: none; width: 100%; max-width: none; border-top: 0; }
  .case__row-label .case__label { display: block; padding-bottom: 1em; border-bottom: 1px solid var(--color-line); }
}

/* === MOBILE (≤479px) ====================================================== */
@media (max-width: 479px) {
  .case__hero { padding-top: 6em; }
  .case__hero-card { padding: 7em 1.25em 1.5em; }
  .case__hero-title { font-size: 2em; } /* 32 */
  .case__services { justify-content: flex-start; gap: 0.5em 1.25em; }

  .case__problem-inner { padding-right: 0; }
  .case__problem-statement { font-size: 1.75em; } /* 28 */

  .case__col :deep(.case__outcomes) { flex-wrap: wrap; gap: 1.5em 0.25em; }
  .case__col :deep(.case__outcome) { flex-basis: 40%; }
  .case__col :deep(.case__media-row) { flex-direction: column; }
}
</style>
