<script setup>
import { computed } from 'vue'

// Intro line — comes from homePage.introText; Figma copy is the fallback.
const props = defineProps({ text: { type: String, default: null } })
const text = computed(() => props.text || 'A selection of projects led as UX/UI designer.')
</script>

<template>
  <section class="intro" data-theme-section="light">
    <div class="intro__box">
      <p class="t-h1">{{ text }}</p>
    </div>
  </section>
</template>
