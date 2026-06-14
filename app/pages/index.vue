<script setup>
useSeoMeta({
  title: '',
  description:
    'Pedro Borges — an awarded designer specialized in psychology-driven design decisions. A selection of UX/UI projects across multiple industries.',
})

// When the Sanity Studio is live, swap this for a GROQ fetch and pass the
// result into <HpPortfolio :projects="projects" />:
//
// import groq from 'groq'
// const QUERY = groq`*[_type == "project"] | order(order asc){
//   title, subtitle, role, "media": media
// }`
// const { data: projects } = await useSanityQuery('projects', QUERY)
</script>

<template>
  <div>
    <HpHero />
    <HpIntro />
    <HpPortfolio />
    <HpIndustries />
    <HpContact />
  </div>
</template>
