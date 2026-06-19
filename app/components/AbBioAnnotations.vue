<script setup>
// About-page bio annotations (desktop only): the numbered ring markers that key
// back to the "Organizing content" legend — 2 (Consistent Formatting) on the bio
// title, 3 (Subheadings) on the lead line, 4 (Body Text) bracketing the body
// paragraph, 5 (Whitespace) floating in the empty column — plus a 2 by the quote
// below. Arrows are centre-line strokes from Figma; DrawSVG traces them on scroll.
const RING =
  'M10.5414 0.833494C16.4046 2.00613 20.8097 3.14102 22.8562 9.16683C24.0377 12.6456 23.8233 16.7697 22.2081 20.0002C20.2494 23.9174 16.4252 27.0835 12.0229 27.0835C8.55406 27.0835 4.77844 24.8581 2.71731 22.0835C-3.25864 14.0389 6.0341 -0.795149 15.9581 4.16683'
// Marker 2 → bio title
const A_2_LONG =
  'M43.0739 0.833333C23.4649 0.833333 9.38866 15.3195 3.07387 32.6852C-0.231669 41.7754 0.975687 50.9075 1.40721 60.1852C1.63359 65.0525 3.31673 69.9559 4.74054 74.5833C5.28888 76.3654 6.80826 81.8672 8.07387 82.5'
const A_2_HEAD = 'M7.50018 0.833493C7.73427 2.01371 13.2187 16.9554 7.50018 15.6483C4.50599 14.9639 3.36113 12.0973 0.833516 10.8335'
// Marker 3 → lead line
const A_3_HEAD1 = 'M13.3333 0.833516C8.66734 3.16651 5.2908 6.95837 3.33333 11.852C2.83323 13.1023 0.833333 19.4059 0.833333 19.1668'
const A_3_HEAD2 = 'M0.833547 0.833547C1.62508 2.68689 3.7683 11.8761 7.31503 10.6484C8.3143 10.3025 8.97862 9.50741 10.0002 9.16688'
// Marker 4 → body paragraph (a brace down each side)
const A_4_TOP =
  'M22.0423 0.838997C10.9645 0.838997 8.2917 0.231158 7.87565 11.6723C7.45961 23.1135 10.3757 21.8334 10.3757 32.876C10.3757 37.2766 8.92111 42.2968 4.35714 43.9871C3.9301 44.1453 0.685114 45.783 0.838618 45.8853C1.36427 46.2357 1.20899 48.576 1.20899 47.5057'
const A_4_BOT =
  'M0.83349 0.83349C1.14708 2.44065 0.950371 6.53444 3.33349 6.66684C4.44264 6.72846 5.71783 6.23958 5.83349 7.68536C6.76078 12.333 7.30912 15.333 6.76078 19.5141C6.32966 22.8014 5.78813 26.275 7.50152 29.2734C8.04382 30.2224 12.8031 29.0828 13.9367 29.8197C15.8968 31.0937 17.397 33.5578 19.0756 35.2363'
</script>

<template>
  <AnnotationLayer class="anno--ab-bio">
    <!-- 2 → Consistent Formatting (bio title) -->
    <svg class="anno__svg anno__svg--ab-a2long" viewBox="0 0 43.9072 83.3335" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_2_LONG" /></svg>
    <svg class="anno__svg anno__svg--ab-a2head" viewBox="0 0 10.9277 16.5623" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_2_HEAD" /></svg>
    <div class="anno__mark anno__mark--ab-2">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="RING" /></svg>
      <div class="anno__note anno__mark-num"><p>2</p></div>
    </div>

    <!-- 3 → Subheadings (lead line) -->
    <svg class="anno__svg anno__svg--ab-a3h1" viewBox="0 0 14.1668 20.0085" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_3_HEAD1" /></svg>
    <svg class="anno__svg anno__svg--ab-a3h2" viewBox="0 0 10.8338 11.5958" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_3_HEAD2" /></svg>
    <div class="anno__mark anno__mark--ab-3">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="RING" /></svg>
      <div class="anno__note anno__mark-num"><p>3</p></div>
    </div>

    <!-- 4 → Body Text (body paragraph) -->
    <svg class="anno__svg anno__svg--ab-a4top" viewBox="0 0 22.8757 48.6171" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_4_TOP" /></svg>
    <svg class="anno__svg anno__svg--ab-a4bot" viewBox="0 0 19.9089 36.0697" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="A_4_BOT" /></svg>
    <div class="anno__mark anno__mark--ab-4">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="RING" /></svg>
      <div class="anno__note anno__mark-num"><p>4</p></div>
    </div>

    <!-- 5 → Whitespace (the empty column) -->
    <div class="anno__mark anno__mark--ab-5">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="RING" /></svg>
      <div class="anno__note anno__mark-num"><p>5</p></div>
    </div>

    <!-- 2 → by the quote below -->
    <div class="anno__mark anno__mark--ab-quote">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg"><path :d="RING" /></svg>
      <div class="anno__note anno__mark-num"><p>2</p></div>
    </div>
  </AnnotationLayer>
</template>
