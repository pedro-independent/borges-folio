<script setup>
// Project case-study template (Figma node 15324-5169). Data-driven from
// utils/projects.js so every project reuses this layout; ClickGuard is the only
// one with full copy for now. Covers/media are placeholder tints until the CMS
// supplies images. The "Next up" footer is handled by AppFooter on /work/[slug].
const route = useRoute()
const project = getProject(route.params.slug)

if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

useSeoMeta({
  title: project.title,
  description: project.description,
})
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
              <span v-if="project.awards" class="case__badge">{{ awardLabel(project.awards) }}</span>
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
      <div class="case__cover-img" :style="{ background: project.cover || project.tint }" />
    </section>

    <!-- The problem -->
    <section v-if="project.problem" class="case__problem container">
      <div class="case__problem-inner">
        <h2 class="case__label">The problem</h2>
        <p class="case__problem-statement">{{ project.problem }}</p>
      </div>
    </section>

    <!-- Body: outcomes / role / key decisions -->
    <div v-if="project.outcomes || project.role || project.decisions" class="case__body container">
      <!-- Outcomes -->
      <section v-if="project.outcomes?.length" class="case__row">
        <div class="case__row-label"><h2 class="case__label">Outcomes</h2></div>
        <div class="case__col">
          <div class="case__outcomes">
            <div v-for="o in project.outcomes" :key="o.label" class="case__outcome">
              <span class="case__label">{{ o.label }}</span>
              <p class="case__outcome-value">{{ o.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- My role -->
      <section v-if="project.role" class="case__row">
        <div class="case__row-label"><h2 class="case__label">My role</h2></div>
        <div class="case__col">
          <p class="case__role-statement">{{ project.role.statement }}</p>
          <div v-if="project.role.scope" class="case__field">
            <span class="case__label">Scope</span>
            <p class="case__field-text">{{ project.role.scope }}</p>
          </div>
          <div v-if="project.role.methods" class="case__field">
            <span class="case__label">Methods</span>
            <p class="case__field-text">{{ project.role.methods }}</p>
          </div>
          <div v-if="project.role.media?.length" class="case__media">
            <div class="case__media-row">
              <div
                v-for="(m, i) in project.role.media.slice(0, 2)"
                :key="i"
                class="case__media-sq"
                :style="{ background: m }"
              />
            </div>
            <div
              v-if="project.role.media[2]"
              class="case__media-wide"
              :style="{ background: project.role.media[2] }"
            />
          </div>
        </div>
      </section>

      <!-- Key decisions -->
      <section v-if="project.decisions?.length" class="case__row">
        <div class="case__row-label"><h2 class="case__label">Key decisions</h2></div>
        <div class="case__col">
          <template v-for="(d, i) in project.decisions" :key="i">
            <h3 class="case__decision-heading">{{ d.heading }}</h3>
            <p class="case__decision-body">{{ d.body }}</p>
            <div v-if="d.image" class="case__media-wide" :style="{ background: d.image }" />
          </template>
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
/* === PROJECT DETAIL (Figma 1440 frame; px ÷ 16 = em) ============
   Body sized in em so it rides the global scaling tiers. Horizontal gutters come
   from .container (padding-block keeps them intact); responsive rules below only
   change layout shape. */

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

/* Body */
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

/* Outcomes */
.case__outcomes { display: flex; gap: 0.25em; }
.case__outcome { flex: 1 0 0; min-width: 0; display: flex; flex-direction: column; gap: 0.25em; }
.case__outcome-value { font-size: 1.5em; line-height: 1.1; } /* 24 */

/* Role */
.case__role-statement { font-size: 1.5em; line-height: 1.2; } /* 24 */
.case__field { display: flex; flex-direction: column; gap: 0.5em; } /* 8 */
.case__field-text { font-size: 1em; line-height: 1.3; opacity: 0.4; } /* 16 */

/* Media (tint placeholders until the CMS supplies images) */
.case__media { display: flex; flex-direction: column; gap: 0.25em; }
.case__media-row { display: flex; gap: 0.25em; }
.case__media-sq { flex: 1 0 0; min-width: 0; aspect-ratio: 432 / 387; border-radius: 0.25em; background: var(--color-lavender); }
.case__media-wide { width: 100%; aspect-ratio: 868 / 581; border-radius: 0.25em; background: var(--color-lavender); }

/* Key decisions */
.case__decision-heading { font-size: 1.5em; line-height: 1.2; } /* 24 */
.case__decision-body { font-size: 1em; line-height: 1.35; opacity: 0.4; } /* 16 */

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

  .case__outcomes { flex-wrap: wrap; gap: 1.5em 0.25em; }
  .case__outcome { flex-basis: 40%; }
  .case__media-row { flex-direction: column; }
}
</style>
