<script setup>
// The wordmark-anchored portfolio marks ("dramatic sizing" note + arrow).
// A plain absolute layer over the section: it scrolls up and away with the
// header as it always did — pinning it isn't possible cleanly, since the note
// sits 4.35em ABOVE the section top and the title latches 1.5em from the
// viewport top, so a pinned copy would linger half-cut off screen. The
// card-anchored marks (hatch, "spacing" note) are the ones that pin — see
// HpPortfolioAnnotations.vue / .portfolio__anno-pin.
</script>

<template>
  <AnnotationLayer>
    <!-- "dramatic sizing" → arrow up to the "My portfolio" wordmark -->
    <div class="anno__note anno__note--pf-dramatic"><p>dramatic sizing to create<br />immediate impact</p></div>
    <svg class="anno__svg anno__svg--pf-dramatic-arrow" viewBox="0 0 58 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M56.3909 40.7803C41.8667 27.519 27.3741 11.999 8.83538 4.22475C8.06498 3.90167 -1.39128 0.519561 2.39094 1.7803" />
    </svg>
    <svg class="anno__svg anno__svg--pf-dramatic-head" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5003 1.50024C12.0252 2.45163 19.7182 15.49 15.2225 16.3891C10.8199 17.2696 5.78211 15.3566 1.50027 14.5002" />
    </svg>
  </AnnotationLayer>
</template>
