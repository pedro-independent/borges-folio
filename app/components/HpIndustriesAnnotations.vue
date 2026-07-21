<script setup>
// Industries hand-drawn annotations (desktop only). Paths exported from Figma.
</script>

<template>
  <AnnotationLayer>
    <!-- big ellipse around the top of the list -->
    <svg class="anno__svg anno__svg--ind-ellipse" viewBox="0 0 669 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M251.413 14.923C300.026 0.365174 351.066 0.427302 401.468 2.47858C472.729 5.37873 542.448 19.5281 605.746 53.423C627.342 64.9875 650.155 79.1816 661.246 101.867C669.539 118.831 669.078 138.642 662.802 156.256C654.036 180.857 629.045 198.118 607.524 210.645C592.781 219.227 576.861 225.309 560.746 230.756C547.364 235.28 533.649 238.31 519.857 241.367C488.663 248.282 457.352 255.194 425.802 260.312C374.483 268.637 321.279 268.249 269.413 267.923C218.858 267.606 167.444 263.084 117.857 252.923C86.6614 246.53 47.6617 236.902 24.8572 212.701C9.56826 196.476 0.25461 173.131 1.63495 150.701C3.4081 121.887 22.5267 99.9159 44.8572 83.7008C78.8293 59.0322 118.394 44.739 158.191 32.4786C194.552 21.2763 231.024 11.7174 268.968 7.92302C291.441 5.67573 313.867 5.92302 336.413 5.92302" />
    </svg>

    <!-- "Good Focal Point" → arrow up to the ellipse. Tail + hook head are the
         Figma vectors (2027/2028) with the design's 132.61° rotation baked into
         a group transform; each viewBox is the rotated bounding box. -->
    <div class="anno__note anno__note--ind-focal"><p>Good Focal Point</p></div>
    <svg class="anno__svg anno__svg--ind-focal-arrow" viewBox="0 0 77.4 73.03" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(38.698 36.516) rotate(132.61) translate(-8.0002 -45.23)">
        <path d="M1.50035 1.50035C8.11809 27.9713 14.5004 53.7118 14.5004 81.0559C14.5004 81.9288 14.5004 93.8737 14.5004 89.5004" />
      </g>
    </svg>
    <svg class="anno__svg anno__svg--ind-focal-head" viewBox="0 0 25.37 25.6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(12.686 12.801) rotate(132.61) translate(-10.0004 -8.037)">
        <path d="M18.5004 1.50035C15.8783 6.95421 13.749 16.18 6.05591 14.3337C3.27056 13.6652 2.11905 10.9751 1.50035 8.50035" />
      </g>
    </svg>
  </AnnotationLayer>
</template>
