import { defineType, defineField } from 'sanity'

// A row of small label-over-value columns, embedded in the case-study body.
// Covers both design patterns: outcome stats ("Pages / 58 → fewer") and people
// lists ("Design / Pedro Borges" with an optional avatar).
export default defineType({
  name: 'stats',
  type: 'object',
  title: 'Facts row',
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      title: 'Items',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', description: 'Small line on top, e.g. "Pages" or "Design".' }),
            defineField({ name: 'value', type: 'string', title: 'Value', description: 'e.g. "58 → fewer" or "Pedro Borges".' }),
            defineField({
              name: 'image',
              type: 'image',
              title: 'Avatar (optional)',
              description: 'Small round photo shown before the value — for team members.',
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label', media: 'image' } },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      const parts = (items || []).map((i) => i.value || i.label).filter(Boolean)
      return { title: parts.join(' · ') || 'Facts row', subtitle: 'Facts row' }
    },
  },
})
