// Project case studies — the data source for /work/[slug] and the footer's
// "Next up" navigation. Mirrors a future Sanity `project` document so the client
// can manage these from the CMS. Only published projects live here; covers and
// in-page media are CMS-bound, so each uses a placeholder tint for now. Body
// fields (problem / outcomes / role / decisions) are optional — the template
// renders only the sections a project actually has.
export const projects = [
  {
    slug: 'clickguard',
    title: 'ClickGuard',
    category: 'Cyber Security · SaaS',
    awards: 1,
    tint: '#cdb8f2',
    description:
      'B2B SaaS platform protecting ad spend by detecting and blocking fraudulent clicks across Google, Meta, and Microsoft Ads.',
    services: ['Strategy', 'Information Architecture', 'UX Copy', 'UX/UI Design', 'Design System', 'Rebranding'],
    cover: '#cdb8f2',
    problem: 'A 58-page website that confused users, buried value, and lost to a free Google default.',
    outcomes: [
      { label: 'Pages', value: '58 → fewer' },
      { label: 'Recognition', value: '1× Award' },
      { label: 'Conversion Rate', value: '+29%' },
    ],
    role: {
      statement:
        "Lead UX/UI Designer at duall®studio, working with an Art Director, dev team, and directly with the client's CEO and marketing team",
      scope: 'Full rebrand · Website redesign · Information architecture · UX copy · Design system',
      methods: 'Heatmap analysis · Click tracking · A/B testing',
      media: ['#d3d6e8', '#cdb8f2', '#dfe3ea'], // two squares + one wide
    },
    decisions: [
      {
        heading: "Lead with the cost of inaction, not the product's features",
        body: "For an audience with a free alternative already installed, features aren't the trigger, the cost of not acting is. We restructured the homepage to open with what undetected click fraud actually costs: wasted budget, distorted campaign data, and decisions made on corrupted numbers. ClickGuard enters the page as the answer to a problem the user already feels, not as a pitch they need to evaluate.",
      },
      {
        heading: "Rebuild the pricing page around the user's decision, not the product taxonomy",
        body: 'The original layout stacked packages vertically, price visible only on the first line, feature comparison requiring the user to scroll hundreds of rows while mentally tracking which column they were in. We moved to a side-by-side table with sticky package name and price, shortened feature descriptions to scannable one-liners, and reduced visual noise. The page now works the way a purchase decision actually works, comparing options at a glance, with context always visible.',
        image: '#d8e0ea',
      },
      {
        heading: 'Design for scan, write for experts',
        body: "Performance marketers scan pages — they don't read them. The previous site demanded attention before earning it. We rebuilt every key page around scannability: short UX copy, clear section hierarchy, value proposition legible within seconds. We didn't simplify the language — writing to this audience's level was itself a trust signal. A tool that sounds like it understands PPC is more credible to a PPC specialist than one that explains it to them.",
      },
    ],
  },
  {
    slug: 'leafwell',
    title: 'Leafwell',
    category: 'Healthcare · SaaS',
    tint: '#d8e0ea',
    description: 'Medical cannabis healthcare provider platform connecting patients with licensed physicians.',
    services: ['Strategy', 'UX/UI Design', 'Design System'],
    cover: '#d8e0ea',
  },
  {
    slug: 'amuse-bouche',
    title: 'Amuse Bouche',
    category: 'Agency · Brand',
    awards: 2,
    tint: '#e7ddca',
    description: 'Award-winning marketing consultant agency website with a bold editorial identity.',
    services: ['Brand', 'Art Direction', 'UX/UI Design'],
    cover: '#e7ddca',
  },
]

export const awardLabel = (n) => `${n} award${n > 1 ? 's' : ''}`

export function getProject(slug) {
  return projects.find((p) => p.slug === slug) || null
}

// Next published project, wrapping around — powers the footer's "Next up".
export function getNextProject(slug) {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i === -1) return projects[0] || null
  return projects[(i + 1) % projects.length]
}
