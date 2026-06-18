import { defineType, defineField } from 'sanity'

// A project / case study. Each item is one project. Mirrors the shape currently
// in app/utils/projects.js, plus listing flags used by the Work page (featured,
// comingSoon, year) so the index can be derived from these documents.
export default defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'listing', title: 'Listing & flags' },
    { name: 'caseStudy', title: 'Case study' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      group: 'overview',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'overview',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      group: 'overview',
      description: 'e.g. "Cyber Security · SaaS".',
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle',
      group: 'overview',
      description: 'Short line shown on cards (Work grid / home), e.g. "B2B SaaS conversion-focused website".',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
      group: 'overview',
      description: 'Longer summary used on the project detail page.',
    }),
    defineField({
      name: 'cover',
      type: 'image',
      title: 'Cover image',
      group: 'overview',
      options: { hotspot: true },
    }),
    defineField({
      name: 'services',
      type: 'array',
      title: 'Services',
      group: 'overview',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // --- Listing & flags ---
    defineField({
      name: 'sortOrder',
      type: 'number',
      title: 'Order',
      group: 'listing',
      description: 'Manual sort position (ascending). Drives the Archive order.',
    }),
    defineField({
      name: 'comingSoon',
      type: 'boolean',
      title: 'Coming soon',
      group: 'listing',
      description: 'Mark as not-yet-published in the grid.',
      initialValue: false,
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year',
      group: 'listing',
      description: 'Used to group the Work "Archive".',
    }),
    defineField({
      name: 'liveUrl',
      type: 'url',
      title: 'Live website URL',
      group: 'listing',
      description:
        'For archived projects: the archive row links here (the live site, opens in a new tab) instead of an internal case-study page.',
    }),
    defineField({
      name: 'awards',
      type: 'number',
      title: 'Awards',
      group: 'listing',
      description: 'Number of awards (shown as a badge).',
    }),

    // --- Case study ---
    defineField({ name: 'problem', type: 'text', rows: 3, title: 'Problem', group: 'caseStudy' }),
    defineField({
      name: 'outcomes',
      type: 'array',
      title: 'Outcomes',
      group: 'caseStudy',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'value', type: 'string', title: 'Value' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'role',
      type: 'object',
      title: 'Role',
      group: 'caseStudy',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'statement', type: 'text', rows: 3, title: 'Statement' }),
        defineField({ name: 'scope', type: 'string', title: 'Scope' }),
        defineField({ name: 'methods', type: 'string', title: 'Methods' }),
        defineField({
          name: 'media',
          type: 'array',
          title: 'Media',
          of: [{ type: 'image', options: { hotspot: true } }],
        }),
      ],
    }),
    defineField({
      name: 'decisions',
      type: 'array',
      title: 'Key decisions',
      group: 'caseStudy',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Heading' }),
            defineField({ name: 'body', type: 'text', rows: 4, title: 'Body' }),
            defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
          ],
          preview: { select: { title: 'heading' } },
        },
      ],
    }),

    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  orderings: [
    { title: 'Manual order', name: 'orderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
    { title: 'Year, newest', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] },
    { title: 'Title A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'cover' } },
})
