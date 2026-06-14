// Mirrors the portfolio content model in HpPortfolio.vue so a GROQ result
// can be dropped straight into <HpPortfolio :projects="..." />.
export default {
  name: 'project',
  type: 'document',
  title: 'Project',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'subtitle', type: 'string', title: 'Subtitle' },
    {
      name: 'role',
      type: 'string',
      title: 'Role',
      initialValue: 'Lead UX/UI Designer',
    },
    {
      name: 'cover',
      type: 'image',
      title: 'Cover image',
      options: { hotspot: true },
    },
    {
      name: 'background',
      type: 'string',
      title: 'Card background',
      options: {
        list: [
          { title: 'Off-white', value: 'blank' },
          { title: 'Lavender', value: 'lavender' },
        ],
      },
      initialValue: 'blank',
    },
    {
      name: 'order',
      type: 'number',
      title: 'Order',
      description: 'Controls position in the portfolio list (ascending).',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'cover' },
  },
}
