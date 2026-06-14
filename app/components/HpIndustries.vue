<script setup>
const industries = [
  'Architecture', 'Banking', 'Cannabis', 'Crypto', 'Cyber Security',
  'Education', 'Entertainment', 'Fashion', 'Food', 'Furniture',
  'Healthcare', 'Investment funds', 'Law', 'Real Estate', 'Sports', 'SaaS',
]
</script>

<template>
  <section class="industries container">
    <div class="industries__row">
      <p class="industries__aside t-base">Experience across multiple industries</p>

      <ul class="industries__list">
        <li v-for="name in industries" :key="name">{{ name }}</li>
      </ul>

      <p class="industries__aside t-base">
        From education platforms to SaaS products, healthcare, media, and hospitality.
      </p>
    </div>
  </section>
</template>
