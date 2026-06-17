import { defineType, defineField } from 'sanity'

// A single social profile link — used in the site settings "socials" list.
export default defineType({
  name: 'socialLink',
  type: 'object',
  title: 'Social link',
  fields: [
    defineField({
      name: 'platform',
      type: 'string',
      title: 'Platform',
      options: {
        list: [
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'X / Twitter', value: 'twitter' },
          { title: 'Behance', value: 'behance' },
          { title: 'Dribbble', value: 'dribbble' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
      description: 'Shown text, e.g. "LinkedIn".',
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'URL',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'url' } },
})
