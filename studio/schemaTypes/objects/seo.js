import { defineType, defineField } from 'sanity'

// Reusable SEO block — embedded on every page document and on projects.
export default defineType({
  name: 'seo',
  type: 'object',
  title: 'SEO',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta title',
      description: 'Overrides the browser tab / search title. ~50–60 characters.',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      rows: 2,
      title: 'Meta description',
      validation: (Rule) => Rule.max(160).warning('Keep under ~160 characters.'),
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'Social share image',
      description: 'Used when the page is shared (Open Graph / Twitter).',
      options: { hotspot: true },
    }),
  ],
})
