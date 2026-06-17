import { defineType, defineField } from 'sanity'

// About page static content (singleton): intro lede, bio, portrait, a pull
// quote, an awards image, and the CV (grouped sections of entries —
// Experience / Education / Certificates / Awards).
export default defineType({
  name: 'aboutPage',
  type: 'document',
  title: 'About',
  groups: [
    { name: 'intro', title: 'Intro & bio', default: true },
    { name: 'quote', title: 'Quote' },
    { name: 'cv', title: 'CV' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'introLede', type: 'text', rows: 2, title: 'Intro lede', group: 'intro' }),
    defineField({ name: 'bioTitle', type: 'text', rows: 2, title: 'Bio title', group: 'intro' }),
    defineField({ name: 'bioLead', type: 'text', rows: 2, title: 'Bio lead', group: 'intro' }),
    defineField({ name: 'bioBody', type: 'text', rows: 6, title: 'Bio body', group: 'intro' }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait',
      group: 'intro',
      options: { hotspot: true },
    }),
    defineField({ name: 'portraitCaption', type: 'string', title: 'Portrait caption', group: 'intro' }),
    defineField({
      name: 'awardsImage',
      type: 'image',
      title: 'Awards image',
      group: 'intro',
      options: { hotspot: true },
    }),

    defineField({ name: 'quoteText', type: 'text', rows: 3, title: 'Quote', group: 'quote' }),
    defineField({ name: 'quoteAttribution', type: 'string', title: 'Attribution', group: 'quote' }),

    defineField({
      name: 'cvGroups',
      type: 'array',
      title: 'CV sections',
      group: 'cv',
      description: 'e.g. Professional Experience, Education, Certificates, Awards.',
      of: [
        {
          type: 'object',
          title: 'Section',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section title' }),
            defineField({
              name: 'entries',
              type: 'array',
              title: 'Entries',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      type: 'string',
                      title: 'Label',
                      description: 'Role / qualification / award.',
                    }),
                    defineField({
                      name: 'meta',
                      type: 'string',
                      title: 'Meta',
                      description: 'Place · year, etc.',
                    }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'meta' } },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', entries: 'entries' },
            prepare: ({ title, entries }) => ({ title, subtitle: `${entries?.length || 0} entries` }),
          },
        },
      ],
    }),

    defineField({ name: 'seo', type: 'seo', title: 'SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'About' }) },
})
