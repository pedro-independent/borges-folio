<script setup>
const social = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]
const nav = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]
</script>

<template>
  <footer id="about" class="footer container">
    <div class="footer__inner">
      <nav class="footer__links t-base">
        <div class="footer__links-col">
          <a v-for="l in social" :key="l.label" :href="l.href" target="_blank" rel="noopener">{{ l.label }}</a>
        </div>
        <div class="footer__links-col">
          <a v-for="l in nav" :key="l.label" :href="l.href">{{ l.label }}</a>
        </div>
      </nav>

      <div class="footer__bottom">
        <!-- "About me" — first ~349px solid, remainder at 30% (Figma reveal effect) -->
        <div class="footer__wordmark">
          <p class="t-display-l is-muted">About me</p>
          <div class="footer__wordmark-clip"><p class="t-display-l">About me</p></div>
        </div>

        <div class="footer__photo">
          <div class="footer__photo-frame">
            <!-- <img src="/img/footer-photo.png" alt="Pedro Borges" /> -->
          </div>
        </div>

        <div class="footer__arrow">
          <IconArrowRight />
        </div>
      </div>
    </div>
  </footer>
</template>
