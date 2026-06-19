<script setup>
// About-page intro annotations (desktop only): the hand-drawn ellipse looping the
// lede, the "1" ring marker on it, and the "Organizing content" legend that keys
// the numbered markers across the page. Stroke paths are centre-line strokes
// exported from Figma so DrawSVG can trace them on. Plays on load (above fold).
const ELLIPSE =
  'M428.354 29.1144C480.015 19.3714 532.515 14.744 585.221 10.2618C659.034 3.98469 733.159 0.735961 807.372 0.835556C946.093 1.02172 1090.77 13.802 1216.3 64.8371C1249.85 78.4752 1280.73 97.9056 1303.95 121.956C1324.54 143.285 1332.19 169.488 1322.51 195.758C1309.76 230.404 1272.51 257.099 1236.07 276.106C1168.61 311.293 1090.65 333.643 1012.21 346.242C916.852 361.556 818.588 368.241 721.53 371.004C619.323 373.914 516.436 376.834 414.186 373.548C326.38 370.727 237.657 363.989 154.346 340.032C96.9672 323.533 38.1548 297.794 14.9802 249.51C5.51755 229.795 -0.376264 209.573 1.04366 188.351C2.42352 167.728 12.2711 147.184 25.8609 129.849C40.3428 111.375 61.5168 97.0002 84.0147 85.1859C112.962 69.9848 144.694 57.989 177.218 48.7151C257.414 25.8482 344.94 24.1477 429.095 22.718C507.22 21.3908 585.284 18.6702 663.377 22.3814'
// Hand-drawn circle shared by every numbered marker.
const RING =
  'M10.5414 0.833494C16.4046 2.00613 20.8097 3.14102 22.8562 9.16683C24.0377 12.6456 23.8233 16.7697 22.2081 20.0002C20.2494 23.9174 16.4252 27.0835 12.0229 27.0835C8.55406 27.0835 4.77844 24.8581 2.71731 22.0835C-3.25864 14.0389 6.0341 -0.795149 15.9581 4.16683'
// Smaller circle used by the legend chips.
const LEGEND_RING =
  'M4.79425 2.23077C11.1567 -0.451088 20.8025 -0.791971 23.7731 6.92064C26.5394 14.1026 21.0689 21.5 13.1439 21.5C9.03099 21.5 6.69293 21.0347 3.25686 18.7473C0.440234 16.8722 0.500145 13.4852 0.500145 10.4635C0.500145 4.84269 6.98864 -1.07271 12.9053 1.77198'

const legend = ['Heading Levels', 'Consistent Formatting', 'Subheadings', 'Body Text', 'Whitespace']
</script>

<template>
  <AnnotationLayer trigger="load" class="anno--ab-intro">
    <!-- Ellipse looping the lede -->
    <svg
      class="anno__svg anno__svg--ab-ellipse"
      viewBox="0 0 1327.5 375.833"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path :d="ELLIPSE" />
    </svg>

    <!-- "1" → Heading Levels (the lede) -->
    <div class="anno__mark anno__mark--ab-1">
      <svg class="anno__svg anno__mark-ring" viewBox="0 0 24.4391 27.9168" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :d="RING" />
      </svg>
      <div class="anno__note anno__mark-num"><p>1</p></div>
    </div>

    <!-- "Organizing content" legend -->
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
