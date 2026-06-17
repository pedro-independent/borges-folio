<script setup>
import { computed } from 'vue'

// Contact band — label / heading / CTA from homePage; Figma copy is the fallback.
// The heading may contain newlines (rendered as <br>).
const props = defineProps({
  label: { type: String, default: null },
  heading: { type: String, default: null },
  cta: { type: Object, default: null },
})
const label = computed(() => props.label || 'Contact')
const heading = computed(() => props.heading || "Liking what you’re seeing?\nLet's work together.")
const headingLines = computed(() => heading.value.split('\n'))
const cta = computed(() => props.cta || { label: 'Get in touch', href: 'mailto:hello@example.com' })
</script>

<template>
  <section id="contact" class="contact container" data-theme-section="light">
    <div class="contact__inner">
      <div class="contact__heading">
        <p class="t-base">{{ label }}</p>
        <h2 class="t-h1"><template v-for="(line, i) in headingLines" :key="i"><br v-if="i" />{{ line }}</template></h2>
      </div>
      <AppButton class="btn btn--dark" :href="cta.href" :label="cta.label" />
    </div>
  </section>
</template>
