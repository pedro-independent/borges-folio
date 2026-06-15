<script setup>
// Button with two stacked Osmo hover effects, both running on hover:
//   - "Button 004" — per-character flip of the label (SplitText, buttons.client.js)
//   - "Button 029" — colour fill that wipes in from the bottom to the top
// Keeps the existing .btn styling: pass the variant via `class`
// (e.g. "btn btn--light") and href/etc. as normal attributes — they fall
// through to the <a>. The label is duplicated (default + hover copy).
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <a data-button-004 data-button-029 class="button-004 button-029">
    <span class="button-029__hover" aria-hidden="true">
      <span class="button-029__hover-bg"></span>
    </span>
    <span class="button-004__inner">
      <span data-button-004-text class="button-004__text is--default">{{ label }}</span>
      <span aria-hidden="true" data-button-004-text class="button-004__text is--hover">{{ label }}</span>
    </span>
  </a>
</template>
