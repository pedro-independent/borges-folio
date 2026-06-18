import { defineType, defineField } from 'sanity'

// Global, site-wide settings (singleton). Centralises values that are currently
// hardcoded/scattered across the nav, footer, menu and contact page: brand name,
// contact email, location/clock, social links and default SEO.
export default defineType({
  name: 'siteSettings',
  type: 'document',
  title: 'General site settings',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contact', title: 'Contact & socials' },
    { name: 'seo', title: 'Default SEO' },
  ],
  fields: [
    defineField({
      name: 'brandName',
      type: 'string',
      title: 'Brand name',
      group: 'general',
      initialValue: 'Pedro Borges',
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      title: 'Tagline / role',
      group: 'general',
      description: 'Used in the browser tab title, e.g. "UX/UI Designer".',
      initialValue: 'UX/UI Designer',
    }),
    defineField({
      name: 'navItems',
      type: 'array',
      title: 'Navigation',
      group: 'general',
      description: 'Primary nav / footer links.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'href', type: 'string', title: 'Link' }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),

    defineField({
      name: 'contactEmail',
      type: 'string',
      title: 'Contact email',
      group: 'contact',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'locationLabel',
      type: 'string',
      title: 'Location label',
      group: 'contact',
      description: 'e.g. "Lisbon, Portugal".',
      initialValue: 'Lisbon, Portugal',
    }),
    defineField({
      name: 'timezone',
      type: 'string',
      title: 'Time zone',
      group: 'contact',
      description: 'IANA name for the local clock, e.g. "Europe/Lisbon".',
      initialValue: 'Europe/Lisbon',
    }),
    defineField({
      name: 'socials',
      type: 'array',
      title: 'Social links',
      group: 'contact',
      of: [{ type: 'socialLink' }],
    }),

    defineField({ name: 'defaultSeo', type: 'seo', title: 'Default SEO', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'General site settings' }) },
})
