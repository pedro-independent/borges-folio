<script setup>
// Industries hand-drawn annotations (desktop only). Paths exported from Figma.
</script>

<template>
  <AnnotationLayer>
    <!-- big ellipse around the top of the list -->
    <svg class="anno__svg anno__svg--ind-ellipse" viewBox="0 0 669 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M251.413 14.923C300.026 0.365174 351.066 0.427302 401.468 2.47858C472.729 5.37873 542.448 19.5281 605.746 53.423C627.342 64.9875 650.155 79.1816 661.246 101.867C669.539 118.831 669.078 138.642 662.802 156.256C654.036 180.857 629.045 198.118 607.524 210.645C592.781 219.227 576.861 225.309 560.746 230.756C547.364 235.28 533.649 238.31 519.857 241.367C488.663 248.282 457.352 255.194 425.802 260.312C374.483 268.637 321.279 268.249 269.413 267.923C218.858 267.606 167.444 263.084 117.857 252.923C86.6614 246.53 47.6617 236.902 24.8572 212.701C9.56826 196.476 0.25461 173.131 1.63495 150.701C3.4081 121.887 22.5267 99.9159 44.8572 83.7008C78.8293 59.0322 118.394 44.739 158.191 32.4786C194.552 21.2763 231.024 11.7174 268.968 7.92302C291.441 5.67573 313.867 5.92302 336.413 5.92302" />
    </svg>

    <!-- "Good Focal Point" → arrow up to the ellipse -->
    <div class="anno__note anno__note--ind-focal"><p>Good Focal Point</p></div>
    <svg class="anno__svg anno__svg--ind-focal-arrow" viewBox="0 0 26 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 42C16 30 9 16 3 3" />
    </svg>
    <svg class="anno__svg anno__svg--ind-focal-head" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.68183 20.1844C3.44283 14.5625 -1.90595 6.74965 4.66103 2.33741C7.03866 0.739924 9.79811 1.71352 12.0384 2.93353" />
    </svg>
  </AnnotationLayer>
</template>
