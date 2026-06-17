<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount, resolveComponent } from 'vue'
import { CONTACT_PAGE } from '~/utils/sanityQueries'

// Contact page copy from the contactPage singleton; email / socials / location /
// timezone come from siteSettings (shared with the shell). Lazy on the client so
// neither fetch suspends the page transition; every field falls back to its
// Figma copy.
const { data } = await useSanityQuery('contactPage', CONTACT_PAGE, {}, { lazy: import.meta.client })
const cms = computed(() => data.value || {})
const { settings } = useSiteSettings()

const heading = computed(() => cms.value.heading || "Let's work together.")
const topicsLabel = computed(() => cms.value.topicsLabel || 'I am reaching out about')
const emailLabel = computed(() => cms.value.emailLabel || 'Or just start a conversation at')
const socialTitle = computed(() => cms.value.socialTitle || 'Social')
const media = computed(() => cms.value.media || null)

const email = computed(() => settings.value.contactEmail)
const socials = computed(() => settings.value.socials)

// "I am reaching out about" options come from the CMS (value + label); each icon
// is matched to its option by value (inline-SVG components, rendered via
// <component :is>).
const TOPIC_ICONS = {
  'full-time': resolveComponent('IconHome'),
  freelance: resolveComponent('IconCalendar'),
  other: resolveComponent('IconSupport'),
}
const FALLBACK_TOPICS = [
  { value: 'full-time', label: 'A full time role' },
  { value: 'freelance', label: 'A freelance project' },
  { value: 'other', label: 'Something else' },
]
const topics = computed(() =>
  (cms.value.topics?.length ? cms.value.topics : FALLBACK_TOPICS).map((t) => ({
    ...t,
    icon: TOPIC_ICONS[t.value] || TOPIC_ICONS.other,
  })),
)

// Social link → inline icon, matched by platform.
const SOCIAL_ICONS = {
  linkedin: resolveComponent('IconLinkedin'),
  instagram: resolveComponent('IconInstagram'),
}
const socialIcon = (platform) => SOCIAL_ICONS[platform] || null

const form = reactive({
  name: '',
  email: '',
  topic: 'full-time',
  detail: '',
})

// No backend in this build — compose a pre-filled mailto so the form is
// functional out of the box. Swap for a real endpoint (Formspree / serverless /
// Sanity) by replacing this handler. Native `required` guards name + email.
function onSubmit() {
  const topic = topics.value.find((t) => t.value === form.topic)?.label ?? ''
  const subject = `New enquiry — ${topic}`
  const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.detail}`
  window.location.href = `mailto:${email.value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

useSeoMeta({
  title: () => cms.value.seo?.metaTitle || 'Contact',
  description: () =>
    cms.value.seo?.metaDescription ||
    'Let’s work together — reach out to Pedro Borges about a full-time role, a freelance project, or anything else.',
})

// --- Topic option ring ---------------------------------------------------
// A single ring element slides between the options. Hover follows the mouse
// only (touch/pen ignored); keyboard focus moves it too, for a11y. Leaving the
// group hides it — unless a radio inside still holds focus or the mouse.
const topicsList = ref(null)
const topicRing = ref(null)

function showRingAt(el) {
  const ring = topicRing.value
  if (!ring || !el) return
  // First appearance: jump to the option (no slide), then just fade in.
  const firstShow = !ring.classList.contains('is-visible')
  if (firstShow) ring.style.transition = 'none'
  ring.style.width = el.offsetWidth + 'px'
  ring.style.height = el.offsetHeight + 'px'
  ring.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`
  if (firstShow) {
    void ring.offsetWidth // commit the jump before re-enabling transitions
    ring.style.transition = ''
  }
  ring.classList.add('is-visible')
}
function hideRing() {
  topicRing.value?.classList.remove('is-visible')
}
function onTopicHover(e) {
  // pointerenter also fires on touch — only follow a real mouse; focus always moves it
  if (e.type === 'pointerenter' && e.pointerType && e.pointerType !== 'mouse') return
  showRingAt(e.currentTarget)
}
function onTopicsLeave() {
  // keep the ring if a radio inside still has keyboard focus
  if (topicsList.value?.contains(document.activeElement)) return
  hideRing()
}
function onTopicsBlur(e) {
  // focus moving between options stays in the group, or the mouse is still over it
  if (topicsList.value?.contains(e.relatedTarget)) return
  if (topicsList.value?.matches(':hover')) return
  hideRing()
}

// Live local time in Lisbon (mirrors the menu/footer clock). Empty on the server
// so SSR and the first client render match; it fills in after mount.
const time = ref('')
let clock = null
function tick() {
  try {
    time.value = new Intl.DateTimeFormat('en-US', {
      timeZone: settings.value.timezone, hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date())
  } catch { time.value = '' }
}
onMounted(() => {
  tick()
  clock = setInterval(tick, 15000)
})
onBeforeUnmount(() => clearInterval(clock))
</script>

<template>
  <div class="contact-page">
    <section class="contact-page__inner container" data-theme-section="light">
      <!-- Media from the CMS (contactPage.media); gradient placeholder until set. -->
      <div
        class="contact-page__media"
        :style="media ? { backgroundImage: `url(${media})`, backgroundSize: 'cover', backgroundPosition: 'center' } : null"
        aria-hidden="true"
      />

      <div class="contact-page__col">
        <div class="contact-page__block">
          <h1 class="contact-page__title">{{ heading }}</h1>

          <form class="contact-page__form" novalidate @submit.prevent="onSubmit">
            <div class="field">
              <label class="field__label" for="contact-name">Name *</label>
              <input
                id="contact-name"
                v-model="form.name"
                class="field__control"
                type="text"
                name="name"
                placeholder="Your name"
                autocomplete="name"
                required
              />
            </div>

            <div class="field">
              <label class="field__label" for="contact-email">Email *</label>
              <input
                id="contact-email"
                v-model="form.email"
                class="field__control"
                type="email"
                name="email"
                placeholder="your@email.com"
                autocomplete="email"
                required
              />
            </div>

            <div class="field contact-page__topics" role="radiogroup" aria-labelledby="topics-label">
              <span id="topics-label" class="field__label">{{ topicsLabel }}</span>
              <div
                ref="topicsList"
                class="contact-page__topics-list"
                @pointerleave="onTopicsLeave"
                @focusout="onTopicsBlur"
              >
                <!-- One shared hover/focus ring that slides between options
                     (positioned by JS) instead of fading in/out per option. -->
                <span ref="topicRing" class="topic-ring" aria-hidden="true" />
                <label
                  v-for="t in topics"
                  :key="t.value"
                  class="topic"
                  :class="{ 'is-selected': form.topic === t.value }"
                  @pointerenter="onTopicHover"
                  @focusin="onTopicHover"
                >
                  <input v-model="form.topic" class="topic__input" type="radio" name="topic" :value="t.value" />
                  <component :is="t.icon" class="topic__icon" />
                  <span class="topic__label">{{ t.label }}</span>
                </label>
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="contact-detail">A bit more detail</label>
              <textarea
                id="contact-detail"
                v-model="form.detail"
                class="field__control contact-page__textarea"
                name="detail"
                placeholder="Tell me about the role, the team, or the project. The more specific the better."
              />
            </div>

            <div class="field contact-page__submit">
              <!-- Same hover animations as the site buttons: the Button 004
                   per-character flip + the Button 029 blue colour wipe. The
                   buttons plugin splits [data-button-004] labels on page:finish. -->
              <button
                type="submit"
                class="contact-page__send button-004 button-029"
                data-button-004
                data-button-029
              >
                <span class="button-029__hover" aria-hidden="true">
                  <span class="button-029__hover-bg"></span>
                </span>
                <span class="button-004__inner">
                  <span data-button-004-text class="button-004__text is--default">Send message</span>
                  <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">Send message</span>
                </span>
              </button>
              <p class="contact-page__required">*Required fields</p>
            </div>
          </form>

          <p class="contact-page__email">
            <span class="contact-page__email-label">{{ emailLabel }}</span>
            <a class="contact-page__email-link" :href="`mailto:${email}`">{{ email }}</a>
          </p>
        </div>

        <div class="contact-page__social">
          <h2 class="contact-page__social-title">{{ socialTitle }}</h2>
          <div class="contact-page__social-col">
            <p class="contact-page__place">
              <span>{{ settings.locationLabel }}</span>
              <span class="contact-page__time">{{ time }}</span>
            </p>
            <div class="contact-page__social-links">
              <a
                v-for="s in socials"
                :key="s.url"
                :href="s.url"
                target="_blank"
                rel="noopener"
                class="contact-page__social-link"
              >
                {{ s.label }}
                <component :is="socialIcon(s.platform)" v-if="socialIcon(s.platform)" class="contact-page__social-icon" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* === CONTACT PAGE (Figma 1440 frame; px ÷ 16 = em) =======
   Media block left, form + social column right. Sized in em so it rides the
   global tablet/mobile tiers; the media queries below only reshape layout.
   Namespaced `.contact-page__*` so it never collides with the homepage's global
   `.contact` section styles. */
.contact-page__inner {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 3em;
  max-width: var(--size-container);
  padding: 7.5em 1.5em;             /* 120 — clears the fixed nav */
}

/* Placeholder media (694 × 655) */
.contact-page__media {
  flex-shrink: 0;
  width: 43.375em;                  /* 694 */
  height: 40.9375em;                /* 655 */
  background: linear-gradient(135deg, #c9c4ba 0%, #b6b1a6 100%);
}

.contact-page__col {
  flex-shrink: 0;
  width: 37.9375em;                 /* 607 */
  display: flex;
  flex-direction: column;
  gap: 15em;                        /* 240 — form block → social */
}

/* --- Form block --- */
.contact-page__block {
  width: 21.5625em;                 /* 345 */
  display: flex;
  flex-direction: column;
  gap: 2.1875em;                    /* 35 */
}
.contact-page__title { font-size: 4.5em; line-height: 1.1; } /* 72 */

.contact-page__form { display: flex; flex-direction: column; gap: 2em; } /* 32 */

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5em;                       /* 8 */
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.field__label { font-size: 0.6875em; line-height: 1.2; padding: 0; } /* 11 */

.field__control {
  width: 100%;
  font: inherit;
  font-size: 1em;                   /* 16 */
  line-height: 1.3;
  color: var(--color-ink);
  background: var(--color-off-white);
  border: 1px solid transparent;
  border-radius: 0.25em;            /* 4 */
  padding: 0.5em;                   /* 8 */
  transition: border-color 0.25s ease;
}
.field__control::placeholder { color: var(--color-ink); opacity: 0.4; }
.field__control:focus-visible { outline: none; border-color: var(--color-blue); }
.contact-page__textarea { height: 7.5em; resize: none; } /* 120 */

/* Topic options — single-select; selected fills accent-blue */
.contact-page__topics-list { position: relative; display: flex; flex-direction: column; gap: 0.5em; }

/* Shared hover/focus ring — a blue outline sitting 0.25em OUTSIDE the option,
   so it glides from one option to the next instead of fading per option. JS
   sets its size + transform; the transitions below do the sliding. */
.topic-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  border-radius: 0.25em;            /* match the option */
  outline: 1.5px solid var(--color-blue);
  outline-offset: 0.25em;           /* 4px gap between the ring and the field */
  opacity: 0;
  transition:
    opacity 0.2s ease,
    transform 0.4s cubic-bezier(0.32, 0.72, 0, 1),
    width 0.4s cubic-bezier(0.32, 0.72, 0, 1),
    height 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.topic-ring.is-visible { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .topic-ring { transition: opacity 0.2s ease; } /* no slide — fade/jump only */
}

.topic {
  position: relative;               /* paint the option above the ring layer */
  display: flex;
  align-items: center;
  gap: 1.5em;                       /* 24 */
  padding: 0.5em;                   /* 8 */
  border-radius: 0.25em;            /* 4 */
  background: var(--color-off-white);
  color: var(--color-ink);
  transition: background-color 0.25s ease, color 0.25s ease;
}
.topic.is-selected {
  background: var(--color-blue);
  color: var(--color-off-white);
}
.topic__input {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0);
  white-space: nowrap; border: 0;
}
.topic__icon { flex-shrink: 0; width: 1.5em; height: 1.5em; } /* 24 */
.topic__label { flex: 1 0 0; min-width: 0; font-size: 1em; line-height: 1.2; }

/* Submit + required note */
.contact-page__submit { gap: 0.5em; }
.contact-page__send {
  width: 100%;
  height: 2.5em;                    /* 40 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: 500;
  color: var(--color-off-white);
  background: var(--color-ink);
  border: 1px solid transparent;    /* match .btn so the 029 wipe overlay aligns */
  border-radius: 0.25em;
}
/* Hover/focus = the Button 004 flip + Button 029 blue wipe; no opacity dim — the
   fill is the affordance (see button-004.css / button-029.css). */
.contact-page__required { font-size: 0.6875em; line-height: 1.2; text-align: center; } /* 11 */

/* Email fallback — right-aligned */
.contact-page__email {
  display: flex;
  flex-direction: column;
  gap: 0.5em;                       /* 8 */
  text-align: right;
}
.contact-page__email-label { font-size: 0.6875em; line-height: 1.2; } /* 11 */
.contact-page__email-link { font-size: 1em; line-height: 1.2; transition: color 0.25s ease; } /* 16 */
.contact-page__email-link:hover { color: var(--color-blue); }

/* --- Social --- */
.contact-page__social { display: flex; align-items: flex-end; gap: 0.25em; }
.contact-page__social-title { width: 21.5625em; font-size: 4.5em; line-height: 1.1; } /* 345 / 72 */
.contact-page__social-col {
  width: 16.125em;                  /* 258 */
  display: flex;
  flex-direction: column;
  gap: 1.3125em;                    /* 21 */
}
.contact-page__place {
  display: flex;
  flex-direction: column;
  gap: 0.125em;                     /* 2 */
  font-size: 0.6875em;              /* 11 */
  line-height: 1.2;
}
.contact-page__time { color: var(--color-blue); }
.contact-page__social-links { display: flex; align-items: center; gap: 3em; } /* 48 */
.contact-page__social-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1em;                   /* 16 */
  line-height: 1.1;
  transition: color 0.25s ease;
}
.contact-page__social-link:hover { color: var(--color-blue); }
.contact-page__social-icon { width: 0.6em; height: 0.6em; } /* ~9.6 */

/* === TABLET (≤991px; Figma node 15324-6206) ======================
   The media block drops and the form + social collapse to a single centred
   column, capped at the social row's width. Type/spacing re-scale via the
   tablet tier, so only layout shape changes here. */
@media (max-width: 991px) {
  .contact-page__media { display: none; }
  .contact-page__inner { justify-content: center; padding-block: 7.5em 5em; } /* 120 / 80 */
  .contact-page__col { width: 100%; max-width: 37.9375em; }  /* 607 — fits the social row */
  .contact-page__block { width: 100%; }                       /* form fills the column */
}

/* === MOBILE (≤479px; Figma node 15324-6894) ======================
   Full-width single column with a 16px gutter and roomier touch targets. The
   display headings stay at 72px per the frame; only layout shape + the larger
   field padding change here. */
@media (max-width: 479px) {
  .contact-page__inner { padding: 15em 1em; }        /* 240 / 16 */
  .contact-page__col { gap: 7.5em; }                 /* 120 — form block → social */

  /* Roomier inputs / options / button + a taller message box (px 24 / py 18) */
  .field__control { padding: 1.125em 1.5em; }        /* 18 / 24 */
  .topic { padding: 1.125em 1.5em; }
  .contact-page__textarea { height: 12.5em; }         /* 200 */
  .contact-page__send { height: auto; padding: 1.125em 1em; } /* 18 / 16 */

  /* Social stacks — heading above the details (heading + gap stay per frame) */
  .contact-page__social { flex-direction: column; align-items: flex-start; }
  .contact-page__social-title { width: 100%; }
  .contact-page__social-col { width: 100%; }
}
</style>
