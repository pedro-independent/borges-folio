<script setup>
import { computed } from 'vue'

// Hero copy. Background portrait is /img/borges_hero.jpg — see .hero__bg in main.css.
// Layout/positions are read off the 1440 Figma frame. Content comes from the
// homePage CMS doc (passed by the page); the hardcoded Figma copy is the fallback
// when a field is empty or the fetch hasn't landed yet on client nav.
const props = defineProps({
  heading: { type: Array, default: null },
  paragraph: { type: String, default: null },
})

const FALLBACK_HEADING = [
  { text: 'An awarded designer specialized' },
  { text: 'in psychology-driven design', indent: true },
  { text: 'decisions.' },
]
const FALLBACK_PARAGRAPH =
  'I believe that unlike art, which invites interpretation, design should remove it. Its role is to guide, clarify, and support decisions.'

const heading = computed(() => (props.heading?.length ? props.heading : FALLBACK_HEADING))
const paragraph = computed(() => props.paragraph || FALLBACK_PARAGRAPH)
</script>

<template>
  <section id="top" class="hero" data-theme-section="dark">
    <div class="hero__bg" aria-hidden="true">
      <img src="/img/borges_hero.jpg" alt="" />
    </div>

    <h1 class="hero__h1">
      <span
        v-for="(line, i) in heading"
        :key="i"
        class="t-h1"
        :class="{ 'hero__h1-indent': line.indent }"
        >{{ line.text }}</span
      >
    </h1>

    <div class="hero__paragraph">
      <p class="t-body">{{ paragraph }}</p>
    </div>

    <HpHeroAnnotations />
  </section>
</template>
