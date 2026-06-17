import { defineType, defineField } from 'sanity'

// Work index page static content (singleton). The Featured / grid / archive
// listings are derived from project documents (via their featured / comingSoon /
// year fields); this doc holds the page's own copy and an optional curated
// "featured" order.
export default defineType({
  name: 'workPage',
  type: 'document',
  title: 'Work',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'quoteText', type: 'text', rows: 3, title: 'Quote', group: 'content' }),
    defineField({ name: 'quoteAttribution', type: 'string', title: 'Attribution', group: 'content' }),
    defineField({
      name: 'featuredProjects',
      type: 'array',
      title: 'Featured projects',
      group: 'content',
      description: 'Curate + order the Featured section. Leave empty to use each project’s "Featured" flag.',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'gridProjects',
      type: 'array',
      title: 'Grid projects',
      group: 'content',
      description: 'The main project grid, in order. Coming-soon projects show a muted badge. The Archive below is derived automatically from each project’s "Year".',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Work' }) },
})
