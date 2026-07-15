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
    defineField({
      name: 'problem',
      type: 'text',
      rows: 3,
      title: 'The problem',
      group: 'caseStudy',
      description: 'The one-sentence hook shown large under the cover, e.g. "A 58-page website that confused users…".',
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Case study',
      group: 'caseStudy',
      description:
        'The whole case study. "Section label" starts a new labelled row (Outcomes, My role, Key decisions…) — ' +
        'the label sits in the left column, everything after it flows in the right column until the next label. ' +
        '"Heading" is the big statement style, "Small label" the tiny field name (Scope, Methods). ' +
        'Add images anywhere — tick "Half width" on two images in a row to pair them side by side — ' +
        'and "Facts row" blocks for stats or the team list.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Section label', value: 'h2' },
            { title: 'Heading', value: 'h3' },
            { title: 'Small label', value: 'h4' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [defineField({ name: 'href', type: 'url', title: 'URL', validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }) })],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text', description: 'Describes the image for screen readers and SEO.' }),
            defineField({
              name: 'half',
              type: 'boolean',
              title: 'Half width',
              description: 'Two consecutive half-width images sit side by side.',
              initialValue: false,
            }),
          ],
        },
        { type: 'stats' },
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
