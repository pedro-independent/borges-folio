<script setup>
// Hero copy. Background portrait is /img/borges_hero.jpg — see .hero__bg in main.css.
// Layout/positions are read off the 1440 Figma frame.
const heading = [
  { text: 'An awarded designer specialized' },
  { text: 'in psychology-driven design', indent: true },
  { text: 'decisions.' },
]
const paragraph =
  'I believe that unlike art, which invites interpretation, design should remove it. Its role is to guide, clarify, and support decisions.'
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
