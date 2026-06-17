import { defineType, defineField } from 'sanity'

// Home page static content (singleton). Mirrors the Hp* section components:
// Hero, Intro, Industries, Portfolio, Contact band, plus the optional design
// annotation callouts. Projects themselves are separate documents.
export default defineType({
  name: 'homePage',
  type: 'document',
  title: 'Home',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'intro', title: 'Intro' },
    { name: 'industries', title: 'Industries' },
    { name: 'portfolio', title: 'Portfolio' },
    { name: 'contact', title: 'Contact band' },
    { name: 'annotations', title: 'Annotations' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --- Hero ---
    defineField({
      name: 'heroHeading',
      type: 'array',
      title: 'Hero heading (lines)',
      group: 'hero',
      description: 'Each line of the big hero heading; tick "indent" to push a line in.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'text', type: 'string', title: 'Text' }),
            defineField({ name: 'indent', type: 'boolean', title: 'Indent', initialValue: false }),
          ],
          preview: {
            select: { title: 'text', indent: 'indent' },
            prepare: ({ title, indent }) => ({ title, subtitle: indent ? 'indented' : '' }),
          },
        },
      ],
    }),
    defineField({ name: 'heroParagraph', type: 'text', rows: 3, title: 'Hero paragraph', group: 'hero' }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero background image',
      group: 'hero',
      options: { hotspot: true },
    }),

    // --- Intro ---
    defineField({ name: 'introText', type: 'string', title: 'Intro text', group: 'intro' }),

    // --- Industries ---
    defineField({ name: 'industriesLeftLabel', type: 'string', title: 'Left label', group: 'industries' }),
    defineField({
      name: 'industriesRightLabel',
      type: 'text',
      rows: 2,
      title: 'Right label',
      group: 'industries',
    }),
    defineField({
      name: 'industries',
      type: 'array',
      title: 'Industries list',
      group: 'industries',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // --- Portfolio ---
    defineField({
      name: 'portfolioTitle',
      type: 'string',
      title: 'Section title',
      group: 'portfolio',
      initialValue: 'My portfolio',
    }),
    defineField({ name: 'portfolioCta', type: 'ctaLink', title: 'CTA', group: 'portfolio' }),
    defineField({
      name: 'portfolioProjects',
      type: 'array',
      title: 'Projects shown',
      group: 'portfolio',
      description: 'Curate + order the home portfolio. Leave empty to auto-show featured projects.',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),

    // --- Contact band ---
    defineField({ name: 'contactLabel', type: 'string', title: 'Label', group: 'contact', initialValue: 'Contact' }),
    defineField({ name: 'contactHeading', type: 'text', rows: 2, title: 'Heading', group: 'contact' }),
    defineField({ name: 'contactCta', type: 'ctaLink', title: 'CTA', group: 'contact' }),

    // --- Annotations (optional design callouts) ---
    defineField({
      name: 'heroAnnotations',
      type: 'array',
      title: 'Hero annotations',
      group: 'annotations',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'industriesAnnotation',
      type: 'string',
      title: 'Industries annotation',
      group: 'annotations',
    }),
    defineField({
      name: 'portfolioAnnotations',
      type: 'array',
      title: 'Portfolio annotations',
      group: 'annotations',
      of: [{ type: 'string' }],
    }),

    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Home' }) },
})
