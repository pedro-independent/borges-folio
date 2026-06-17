<script setup>
// Mirrors the state set by the page transition in app.vue. While true, CSS
// hides the shell so the re-keyed footer can't jump into view mid-transition.
const transitioning = useState('page-transitioning', () => false)

// The contact page carries its own footer-like "Social" block (per its Figma
// design), so the standard site footer is omitted there to avoid duplication.
const route = useRoute()
const showFooter = computed(() => route.path !== '/contact')
</script>

<template>
  <div class="page" :class="{ 'is-transitioning': transitioning }">
    <AppNav />
    <main><slot /></main>
    <AppFooter v-if="showFooter" :key="$route.path" />
  </div>
</template>
