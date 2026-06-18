import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '73l6qarp'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  // Hosted Studio subdomain → https://pedro-borges.sanity.studio
  // (set here so `sanity deploy` runs non-interactively, no hostname prompt).
  studioHost: 'pedro-borges',
})
