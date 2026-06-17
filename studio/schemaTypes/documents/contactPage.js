import { defineType, defineField } from 'sanity'

// Contact page static content (singleton). The email address, socials and the
// Lisbon clock come from General site settings; this doc holds the page-specific
// copy: heading, the "reaching out about" options, labels and the media image.
export default defineType({
  name: 'contactPage',
  type: 'document',
  title: 'Contact',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      group: 'content',
      initialValue: "Let's work together.",
    }),
    defineField({
      name: 'topicsLabel',
      type: 'string',
      title: 'Topics label',
      group: 'content',
      initialValue: 'I am reaching out about',
    }),
    defineField({
      name: 'topics',
      type: 'array',
      title: 'Topics',
      group: 'content',
      description: 'The "I am reaching out about" options.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              type: 'string',
              title: 'Value',
              description: 'Stable key, e.g. "full-time".',
            }),
            defineField({ name: 'label', type: 'string', title: 'Label' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
    defineField({
      name: 'emailLabel',
      type: 'string',
      title: 'Email fallback label',
      group: 'content',
      initialValue: 'Or just start a conversation at',
    }),
    defineField({
      name: 'socialTitle',
      type: 'string',
      title: 'Social section title',
      group: 'content',
      initialValue: 'Social',
    }),
    defineField({
      name: 'media',
      type: 'image',
      title: 'Media image',
      group: 'content',
      options: { hotspot: true },
    }),
    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
})
