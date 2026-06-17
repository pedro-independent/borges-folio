import { defineType, defineField } from 'sanity'

// A button / call-to-action: label + destination (path, anchor, or full URL).
export default defineType({
  name: 'ctaLink',
  type: 'object',
  title: 'Button / link',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      title: 'Label',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      type: 'string',
      title: 'Link',
      description: 'A path ("/work"), an in-page anchor ("#work"), or a full URL.',
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})
