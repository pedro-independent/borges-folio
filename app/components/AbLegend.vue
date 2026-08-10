<script setup>
// "Organizing content" legend — the key for the numbered ring markers scattered
// across the about page. Lives at the TOP of the lead/bio section (first child,
// so it reads before the portrait + copy), sitting in that section's top padding
// above all of its content. Its own annotation layer, so it fades in on scroll
// and inherits the desktop-only gate + pointer-events: none.
const LEGEND_RING =
  'M4.79425 2.23077C11.1567 -0.451088 20.8025 -0.791971 23.7731 6.92064C26.5394 14.1026 21.0689 21.5 13.1439 21.5C9.03099 21.5 6.69293 21.0347 3.25686 18.7473C0.440234 16.8722 0.500145 13.4852 0.500145 10.4635C0.500145 4.84269 6.98864 -1.07271 12.9053 1.77198'

const legend = ['Heading Levels', 'Consistent Formatting', 'Subheadings', 'Body Text', 'Whitespace']
</script>

<template>
  <AnnotationLayer class="anno--ab-legend">
    <div class="anno__note anno__note--ab-legend">
      <p class="ab-legend__title">Organizing content</p>
      <ul class="ab-legend__row">
        <li v-for="(item, i) in legend" :key="i" class="ab-legend__chip">
          <span class="ab-legend__badge">
            <svg class="ab-legend__ring" viewBox="0 0 25.0023 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path :d="LEGEND_RING" />
            </svg>
            <span class="ab-legend__num">{{ i + 1 }}</span>
          </span>
          <span class="ab-legend__label">{{ item }}</span>
        </li>
      </ul>
    </div>
  </AnnotationLayer>
</template>
