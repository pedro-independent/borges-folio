<script setup>
// Home reads the homePage singleton; each Hp* section falls back to its Figma
// copy when a field is empty. Lazy on the client so the fetch never suspends the
// page transition (see useSanity.js). The bespoke portfolio showcase stays
// hardcoded in HpPortfolio — only its title/CTA come from the CMS.
import { HOME_PAGE } from '~/utils/sanityQueries'

const { data } = await useSanityQuery('homePage', HOME_PAGE, {}, { lazy: import.meta.client })
const cms = computed(() => data.value || {})

useSeoMeta({
  title: () => cms.value.seo?.metaTitle || '',
  description: () =>
    cms.value.seo?.metaDescription ||
    'Pedro Borges — an awarded designer specialized in psychology-driven design decisions. A selection of UX/UI projects across multiple industries.',
})
</script>

<template>
  <div>
    <HpHero :heading="cms.heroHeading" :paragraph="cms.heroParagraph" />
    <HpIntro :text="cms.introText" />
    <HpPortfolio :title="cms.portfolioTitle" :cta="cms.portfolioCta" />
    <HpIndustries
      :industries="cms.industries"
      :left-label="cms.industriesLeftLabel"
      :right-label="cms.industriesRightLabel"
    />
    <HpContact :label="cms.contactLabel" :heading="cms.contactHeading" :cta="cms.contactCta" />
  </div>
</template>
