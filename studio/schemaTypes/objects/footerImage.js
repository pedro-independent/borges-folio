import { defineType, defineField } from 'sanity'

// Photo revealed beside the site footer's call-to-action ("About me" / "See
// work" / "Next up"). Each static page with a footer (Home, About, Work) has its
// own; the one in General site settings is the default for case-study pages and
// any page left empty.
export default defineType({
  name: 'footerImage',
  type: 'image',
  title: 'Footer image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', type: 'string', title: 'Alt text', initialValue: 'Pedro Borges' }),
  ],
})
