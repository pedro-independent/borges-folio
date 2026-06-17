import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

// projectId is public — it's already exposed client-side in the Nuxt app. Read
// it from the env (SANITY_STUDIO_PROJECT_ID) when present, else the value below.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '73l6qarp'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Documents that must exist exactly once — no create / delete / duplicate.
const SINGLETONS = ['siteSettings', 'homePage', 'aboutPage', 'workPage', 'contactPage']

export default defineConfig({
  name: 'default',
  title: 'Pedro Borges',

  projectId,
  dataset,

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    // Keep singletons out of the global "create new document" menu.
    templates: (prev) => prev.filter((t) => !SINGLETONS.includes(t.schemaType)),
  },

  document: {
    // Singletons can be published / edited but never deleted or duplicated.
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev,
  },
})
