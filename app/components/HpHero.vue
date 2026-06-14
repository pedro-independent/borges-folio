<script setup>
// Hero copy. The background portrait is a placeholder gradient until the
// real asset (or a Sanity image) is wired in — see .hero__bg in main.css.
const heading = ['An awarded designer specialized', 'in psychology-driven design', 'decisions.']
const paragraph =
  'I believe that unlike art, which invites interpretation, design should remove it. Its role is to guide, clarify, and support decisions.'
</script>

<template>
  <section id="top" class="hero">
    <div class="hero__bg" aria-hidden="true">
      <!-- <img src="/img/hero.png" alt="" /> -->
    </div>

    <h1 class="hero__h1">
      <span class="hero__h1-lines">
        <p v-for="(line, i) in heading" :key="i" class="t-h1">{{ line }}</p>
      </span>
    </h1>

    <div class="hero__paragraph">
      <div class="hero__paragraph-box">
        <p class="t-body">{{ paragraph }}</p>
      </div>
    </div>
  </section>
</template>
