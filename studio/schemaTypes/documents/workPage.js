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
      description: 'Curate + order the Featured section. Cards open the project’s case-study page.',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'gridProjects',
      type: 'array',
      title: 'Grid projects',
      group: 'content',
      description: 'The main project grid, in order. Cards open the case-study page; coming-soon projects show a muted badge instead of linking.',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'archiveProjects',
      type: 'array',
      title: 'Archive projects',
      group: 'content',
      description:
        'The year-grouped list below the grid. These are older/archived projects — rows are grouped by each project’s "Year" and link out to the project’s "Live website URL" (new tab) rather than an internal case-study page.',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Work' }) },
})
