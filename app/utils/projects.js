// Project case studies — the fallback data source for /work/[slug] and the
// footer's "Next up" navigation when the CMS is unreachable (or a CMS doc is
// missing a field). Mirrors the Sanity `project` document: the case-study body
// is Portable Text built with the ptX helpers (utils/portableCase.js), matching
// what the client edits in the Studio. In-page media is CMS-bound, so the body
// uses placeholder tints (ptTint) until real images are uploaded.
import { ptLabel, ptHeading, ptSub, ptP, ptTint, ptFacts } from './portableCase'

export const projects = [
  {
    slug: 'clickguard',
    title: 'ClickGuard',
    category: 'Cyber Security · SaaS',
    awards: 1,
    tint: '#cdb8f2',
    liveUrl: 'https://clickguard.com',
    description:
      'B2B SaaS platform protecting ad spend by detecting and blocking fraudulent clicks across Google, Meta, and Microsoft Ads.',
    services: ['Strategy', 'Information Architecture', 'UX Copy', 'UX/UI Design', 'Design System', 'Rebranding'],
    cover: '#cdb8f2',
    problem: 'A 58-page website that confused users, buried value, and lost to a free Google default.',
    body: [
      ptLabel('Made at'),
      ptP('Duall'),

      ptLabel('Team involved'),
      ptFacts(['Design', 'Pedro Borges'], ['Development', 'Pedro Neves']),

      ptLabel('Outcomes'),
      ptFacts(['Pages', '58 → fewer'], ['Recognition', '1× Award'], ['Conversion Rate', '+29%']),

      ptLabel('My role'),
      ptHeading(
        "Lead UX/UI Designer at duall®studio, working with an Art Director, dev team, and directly with the client's CEO and marketing team",
      ),
      ptSub('Scope'),
      ptP('Full rebrand · Website redesign · Information architecture · UX copy · Design system'),
      ptSub('Methods'),
      ptP('Heatmap analysis · Click tracking · A/B testing'),
      ptTint('#d3d6e8', true),
      ptTint('#cdb8f2', true),
      ptTint('#dfe3ea'),

      ptLabel('Key decisions'),
      ptHeading("Lead with the cost of inaction, not the product's features"),
      ptP(
        "For an audience with a free alternative already installed, features aren't the trigger, the cost of not acting is. We restructured the homepage to open with what undetected click fraud actually costs: wasted budget, distorted campaign data, and decisions made on corrupted numbers. ClickGuard enters the page as the answer to a problem the user already feels, not as a pitch they need to evaluate.",
      ),
      ptHeading("Rebuild the pricing page around the user's decision, not the product taxonomy"),
      ptP(
        'The original layout stacked packages vertically, price visible only on the first line, feature comparison requiring the user to scroll hundreds of rows while mentally tracking which column they were in. We moved to a side-by-side table with sticky package name and price, shortened feature descriptions to scannable one-liners, and reduced visual noise. The page now works the way a purchase decision actually works, comparing options at a glance, with context always visible.',
      ),
      ptTint('#d8e0ea'),
      ptHeading('Design for scan, write for experts'),
      ptP(
        "Performance marketers scan pages — they don't read them. The previous site demanded attention before earning it. We rebuilt every key page around scannability: short UX copy, clear section hierarchy, value proposition legible within seconds. We didn't simplify the language — writing to this audience's level was itself a trust signal. A tool that sounds like it understands PPC is more credible to a PPC specialist than one that explains it to them.",
      ),
    ],
  },
  {
    slug: 'plen-advogados',
    title: 'Plen Advogados',
    category: 'Legal · Law Firm',
    tint: '#d8e0ea',
    description:
      "Corporate and M&A law firm founded in 2007, ranked by Chambers & Partners. Serving international clients from Lisbon's Amoreiras Tower.",
    services: ['Strategy', 'Information Architecture', 'UX Copy', 'UX/UI Design', 'SEO'],
    cover: '#96352a',
    problem: 'A Chambers-ranked law firm with a website that looked and felt like it was built in 2000.',
    body: [
      ptLabel('Outcomes'),
      ptFacts(['Pages', '58 → fewer'], ['Recognition', '1× Award'], ['Conversion Rate', '+29%']),

      ptLabel('My role'),
      ptHeading('Lead and sole UX/UI Designer — working directly with the client throughout'),
      ptSub('Scope'),
      ptP('Full website redesign · IA restructure · Brand application · Motion design (Barba.js)'),
      ptSub('Branding'),
      ptP('Brand identity by Alfred Agency — we applied and extended it across the full digital experience'),
      ptTint('#d9c0ba', true),
      ptTint('#c9aaa2', true),

      ptLabel('Analysis'),
      ptHeading('The existing website had 15 pages — but they were fragmented, thin, and structurally confused.'),
      ptP(
        'The team was split across three separate pages (partners, associates, trainees), each too short to rank or inform. Practice area pages were isolated silos with barely enough content to justify existing. There was no narrative, no reason to keep reading, and no path guiding the user anywhere.',
      ),

      ptLabel('Key decisions'),
      ptHeading('Design the tension between authority and approachability, not one or the other'),
      ptP(
        'Most law firm websites resolve this tension by picking a side: either cold and institutional, or warm and startup-like. Both felt wrong for Plen. Their partners are senior, internationally recognised, and serious, but their philosophy is explicitly that of the lawyer-consultant, accessible and business-oriented. The design had to hold both at once.',
      ),
      ptP(
        'We achieved this through editorial layouts with generous white space that signal confidence without coldness, high-quality photography that humanises the team, and language that is clear without being casual. The reference was closer to a premium financial services brand than a traditional law firm.',
      ),
      ptTint('#d3b5ac'),
      ptHeading('Make the team the centrepiece, not a footnote'),
      ptP(
        "In the previous site, the team was fragmented across three separate pages — partners, associates, trainees — each shallow and hard to navigate. The people are Plen's most credible asset: Chambers-ranked, decades of experience, recognised names in Portuguese corporate law. We consolidated the team into a single, richly designed experience, with individual member pages that function almost like editorial profiles — premium photography, detailed bios, areas of expertise, notable work. For an international client evaluating whether to engage a Portuguese law firm, this is the page that makes the decision.",
      ),
      ptTint('#c9aaa2'),
      ptHeading('Use motion to signal craft, not decoration'),
      ptP(
        "We implemented seamless page transitions using Barba.js, something essentially absent from the Portuguese legal sector online. The decision wasn't aesthetic. In a sector where every competitor's website feels static and dated, smooth transitions communicate modernity and intentionality without a single word of copy. A client visiting three law firm websites in a row will feel the difference immediately, even if they can't articulate why. The experience itself becomes part of the trust signal.",
      ),
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
