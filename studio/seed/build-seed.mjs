// Builds seed.ndjson — a one-time bootstrap of the site's original hardcoded
// content into Sanity, so a FRESH dataset starts populated.
//
//   node build-seed.mjs            # writes ./seed.ndjson
//
// ⚠️  DO NOT import this into `production` any more. It was a bootstrap, and the
// production dataset has since diverged: content has been written directly in
// the Studio that exists in no file here (e.g. Leafwell's entire case study —
// problem, 3 outcomes, 5 key decisions — plus ClickGuard's uploaded cover).
// `dataset import --replace` overwrites documents by _id, so it would replace
// those with this file's thinner versions and destroy that work.
//
// To change the SHAPE of live documents, write a migration instead — it edits
// in place and touches only the fields it names:
//   npx sanity migration run <name> --project <id> --dataset production
// See migrations/caseStudyToPortableText for the structured-fields → rich-text
// conversion. This file stays useful for seeding a brand-new/empty dataset:
//   npx sanity dataset import seed/seed.ndjson <new-dataset>
//
// Notes:
// - Singletons use fixed _ids (siteSettings/homePage/aboutPage/workPage/contactPage)
//   matching studio/structure.js. Projects use `project-<slug>`.
// - Images are intentionally omitted; the front-end falls back to its local
//   /img assets until the client uploads images in the Studio.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

// Add a stable _key to every object/reference in an array (required by Sanity).
const keyed = (arr) => arr.map((item, i) => ({ _key: `k${i}`, ...item }))
// Build an ordered reference list to project documents.
const refs = (slugs) => slugs.map((s) => ({ _type: 'reference', _ref: `project-${s}`, _key: s }))

// --- Case-study Portable Text builders (mirror app/utils/portableCase.js) --
// h2 = "Section label" (starts a labelled row on the site), h3 = heading,
// h4 = small label, stats = facts row. Images are intentionally NOT seeded —
// the client drops them into the rich text in the Studio (the front-end's
// local fallback shows placeholder tints until then). Keys are deterministic
// so re-running this script produces an identical file.
let ptN = 0
const ptKey = () => `pt${(ptN++).toString(36)}`
const block = (style, text) => ({
  _type: 'block',
  _key: ptKey(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: ptKey(), text, marks: [] }],
})
const ptLabel = (t) => block('h2', t)
const ptHeading = (t) => block('h3', t)
const ptSub = (t) => block('h4', t)
const ptP = (t) => block('normal', t)
const ptFacts = (...pairs) => ({
  _type: 'stats',
  _key: ptKey(),
  items: pairs.map(([label, value]) => ({ _key: ptKey(), label, value })),
})

// --- Projects (each item is one project) ---------------------------------
const projectSource = [
  {
    slug: 'clickguard',
    title: 'ClickGuard',
    subtitle: 'B2B SaaS conversion-focused website',
    category: 'Cyber Security · SaaS',
    awards: 1,
    tint: '#cdb8f2',
    featured: true,
    order: 1,
    description:
      'B2B SaaS platform protecting ad spend by detecting and blocking fraudulent clicks across Google, Meta, and Microsoft Ads.',
    services: ['Strategy', 'Information Architecture', 'UX Copy', 'UX/UI Design', 'Design System', 'Rebranding'],
    liveUrl: 'https://clickguard.com',
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

      ptLabel('Key decisions'),
      ptHeading("Lead with the cost of inaction, not the product's features"),
      ptP(
        "For an audience with a free alternative already installed, features aren't the trigger, the cost of not acting is. We restructured the homepage to open with what undetected click fraud actually costs: wasted budget, distorted campaign data, and decisions made on corrupted numbers. ClickGuard enters the page as the answer to a problem the user already feels, not as a pitch they need to evaluate.",
      ),
      ptHeading("Rebuild the pricing page around the user's decision, not the product taxonomy"),
      ptP(
        'The original layout stacked packages vertically, price visible only on the first line, feature comparison requiring the user to scroll hundreds of rows while mentally tracking which column they were in. We moved to a side-by-side table with sticky package name and price, shortened feature descriptions to scannable one-liners, and reduced visual noise. The page now works the way a purchase decision actually works, comparing options at a glance, with context always visible.',
      ),
      ptHeading('Design for scan, write for experts'),
      ptP(
        "Performance marketers scan pages — they don't read them. The previous site demanded attention before earning it. We rebuilt every key page around scannability: short UX copy, clear section hierarchy, value proposition legible within seconds. We didn't simplify the language — writing to this audience's level was itself a trust signal. A tool that sounds like it understands PPC is more credible to a PPC specialist than one that explains it to them.",
      ),
    ],
  },
  {
    slug: 'leafwell',
    title: 'Leafwell',
    subtitle: 'Medical cannabis healthcare provider platform',
    category: 'Healthcare · SaaS',
    tint: '#d8e0ea',
    featured: true,
    order: 2,
    description: 'Medical cannabis healthcare provider platform connecting patients with licensed physicians.',
    services: ['Strategy', 'UX/UI Design', 'Design System'],
  },
  {
    slug: 'amuse-bouche',
    title: 'Amuse Bouche',
    subtitle: 'Award-winning marketing consultant agency website',
    category: 'Agency · Brand',
    awards: 2,
    tint: '#e7ddca',
    featured: true,
    order: 3,
    description: 'Award-winning marketing consultant agency website with a bold editorial identity.',
    services: ['Brand', 'Art Direction', 'UX/UI Design'],
  },

  // Grid
  {
    slug: 'plen-advogados',
    title: 'Plen Advogados',
    subtitle: 'Law firm brand & website',
    category: 'Legal · Law Firm',
    tint: '#d8e0ea',
    description:
      "Corporate and M&A law firm founded in 2007, ranked by Chambers & Partners. Serving international clients from Lisbon's Amoreiras Tower.",
    services: ['Strategy', 'Information Architecture', 'UX Copy', 'UX/UI Design', 'SEO'],
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
      ptHeading('Make the team the centrepiece, not a footnote'),
      ptP(
        "In the previous site, the team was fragmented across three separate pages — partners, associates, trainees — each shallow and hard to navigate. The people are Plen's most credible asset: Chambers-ranked, decades of experience, recognised names in Portuguese corporate law. We consolidated the team into a single, richly designed experience, with individual member pages that function almost like editorial profiles — premium photography, detailed bios, areas of expertise, notable work. For an international client evaluating whether to engage a Portuguese law firm, this is the page that makes the decision.",
      ),
      ptHeading('Use motion to signal craft, not decoration'),
      ptP(
        "We implemented seamless page transitions using Barba.js, something essentially absent from the Portuguese legal sector online. The decision wasn't aesthetic. In a sector where every competitor's website feels static and dated, smooth transitions communicate modernity and intentionality without a single word of copy. A client visiting three law firm websites in a row will feel the difference immediately, even if they can't articulate why. The experience itself becomes part of the trust signal.",
      ),
    ],
  },

  // Grid — coming soon
  { slug: 'opterion', title: 'Opterion', subtitle: 'Fintech dashboard product design', tint: '#e7ddca', comingSoon: true },
  { slug: 'omniscience', title: 'Omniscience', subtitle: 'AI analytics marketing site', tint: '#d3ddd5', comingSoon: true },
  { slug: 'nova-mentorship', title: 'Nova | Mentorship', subtitle: 'Executive education platform', tint: '#ecd9c6', comingSoon: true },
  { slug: 'aruki', title: 'Aruki', subtitle: 'E-commerce storefront & product system', tint: '#d3d6e8', comingSoon: true },
  { slug: 'insider', title: 'Insider', subtitle: 'Membership community platform', tint: '#e3d2d2', comingSoon: true },
  { slug: 'woods', title: 'Woods', subtitle: 'Outdoor brand editorial website', tint: '#cdd9cf', comingSoon: true },

  // Archive — grouped by year on the Work page
  { slug: 'nexa', title: 'Nexa', subtitle: 'B2B SaaS conversion-focused website', awards: 2, year: 2024 },
  { slug: 'rocco', title: 'Rocco', subtitle: 'Restaurant brand & booking experience', awards: 1, year: 2024 },
  { slug: 'software-angels', title: 'Software Angels', subtitle: 'Software studio portfolio', awards: 1, year: 2024 },
  { slug: 'pg-arquitetos', title: 'PG Arquitetos', subtitle: 'Architecture studio website', awards: 1, year: 2024 },
  { slug: 'the-land-group', title: 'The Land Group', subtitle: 'Real-estate investment platform', awards: 1, year: 2023 },
  { slug: 'specialist-ceramics', title: 'Specialist Ceramics', subtitle: 'Industrial ceramics e-commerce', awards: 2, year: 2023 },
  { slug: 'design-for-investment', title: 'Design for Investment', subtitle: 'Financial advisory website', awards: 1, year: 2023 },
]

const projectDoc = (p, i) => {
  const doc = { _id: `project-${p.slug}`, _type: 'project', title: p.title, slug: { _type: 'slug', current: p.slug } }
  // Sequential order = position in projectSource, so the query-derived Archive
  // keeps its curated within-year order (Featured/Grid are ordered ref lists).
  // NB: field is `sortOrder`, not `order` — `order` is a reserved GROQ keyword.
  doc.sortOrder = i + 1
  if (p.subtitle) doc.subtitle = p.subtitle
  if (p.category) doc.category = p.category
  if (p.description) doc.description = p.description
  if (p.tint) doc.tint = p.tint
  if (p.services) doc.services = p.services
  if (p.featured) doc.featured = true
  if (p.comingSoon) doc.comingSoon = true
  if (typeof p.year === 'number') doc.year = p.year
  if (typeof p.awards === 'number') doc.awards = p.awards
  if (p.liveUrl) doc.liveUrl = p.liveUrl
  if (p.problem) doc.problem = p.problem
  if (p.body) doc.body = p.body
  return doc
}

// --- Singletons ----------------------------------------------------------
const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  brandName: 'Pedro Borges',
  tagline: 'UX/UI Designer',
  contactEmail: 'pedrosmborges@gmail.com',
  locationLabel: 'Lisbon, Portugal',
  timezone: 'Europe/Lisbon',
  socials: keyed([
    { _type: 'socialLink', platform: 'linkedin', label: 'Linkedin', url: 'https://www.linkedin.com/in/pedrosmborges/' },
    { _type: 'socialLink', platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/pedro.sm.borges/' },
  ]),
  navItems: keyed([
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
  ]),
  defaultSeo: { _type: 'seo', metaTitle: 'Pedro Borges — UX/UI Designer' },
}

const homePage = {
  _id: 'homePage',
  _type: 'homePage',
  heroHeading: keyed([
    { text: 'An awarded designer specialized' },
    { text: 'in psychology-driven design', indent: true },
    { text: 'decisions.' },
  ]),
  heroParagraph:
    'I believe that unlike art, which invites interpretation, design should remove it. Its role is to guide, clarify, and support decisions.',
  introText: 'A selection of projects led as UX/UI designer.',
  industriesLeftLabel: 'Experience across multiple industries',
  industriesRightLabel: 'From education platforms to SaaS products, healthcare, media, and hospitality.',
  industries: [
    'Architecture', 'Banking', 'Cannabis', 'Crypto', 'Cyber Security', 'Education', 'Entertainment', 'Fashion',
    'Food', 'Furniture', 'Healthcare', 'Investment funds', 'Law', 'Real Estate', 'Sports', 'SaaS',
  ],
  portfolioTitle: 'My portfolio',
  portfolioCta: { _type: 'ctaLink', label: 'View more projects', href: '#work' },
  contactLabel: 'Contact',
  contactHeading: "Liking what you're seeing?\nLet's work together.",
  contactCta: { _type: 'ctaLink', label: 'Get in touch', href: 'mailto:pedrosmborges@gmail.com' },
}

const aboutPage = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  introLede:
    "I'm a UX/UI designer focused on intentional design decisions rooted in psychology and perception.",
  bioTitle: 'I lead digital experiences across platforms, products, and institutional systems.',
  bioLead:
    'Senior UX/UI designer recognized among the top designers by Clube da Criatividade de Portugal.',
  bioBody:
    'At duall studio I play a central role within the design team, acting as lead designer to shape creative directions and ensure clarity and consistency across projects. I have experience in strategic decision-making, end-to-end project management, and direct communication with national and international clients. I am also responsible for presenting proposals, aligning strategy, and guiding projects from initial concept through to production.',
  portraitCaption: 'If awards are your thing check them out bellow',
  quoteText:
    'Indifference to people and the reality in which they live is actually the only true deadly sin in design.',
  quoteAttribution: 'Dieter Rams',
  cvGroups: keyed([
    {
      title: 'Professional experience',
      entries: keyed([
        { label: 'Senior UX/UI Designer', meta: 'duall®studio [2021 — Present]' },
        { label: 'Senior UX/UI Designer', meta: 'BYLD [2024 — Present]' },
        { label: 'UX/UI Designer', meta: 'duall®studio [2020 — 2021]' },
        { label: 'Designer | 3D Designer', meta: 'Opção Global [2019 — 2020]' },
        { label: 'Product Designer', meta: 'Modus Design [2015 — 2019]' },
        { label: 'Researcher', meta: 'Ideas Revolution [2015 — 2019]' },
      ]),
    },
    {
      title: 'Education',
      entries: keyed([
        { label: 'UX/UI Design', meta: 'Lisbon School of Design [2020]' },
        { label: 'Masters in Product Design', meta: 'IADE [2014 — 2016]' },
        { label: 'Bachelor’s Degree in Design', meta: 'IADE [2011 — 2015]' },
      ]),
    },
    {
      title: 'Certificates',
      entries: keyed([
        { label: 'C1 advanced English | Written and spoken', meta: '[2026]' },
        { label: 'Master Typography & Layout', meta: 'Oliver Gareis [2026]' },
        { label: 'Building Better User Experiences with a Product Thinking Approach', meta: 'Olha Uzhykova [2025]' },
        { label: 'Create a Design System from scratch in Figma', meta: 'Bruno Saez [2023]' },
        { label: 'Make Design Systems People Want to Use', meta: 'Dan Mall [2023]' },
        { label: 'Impress everyone with a 3D particle scene with Blender and Three.js', meta: 'Fabio Ottaviani [2022]' },
        { label: 'Using motion design to animate with purpose and create delightful experiences', meta: 'Louis Paquet [2022]' },
        { label: 'Creating Epic Ecommerce Experiences for Brands: An Advanced Guide', meta: 'Bruno Arizio [2021]' },
        { label: 'Design meaningful experiences through an animation system', meta: 'Louis Ansa [2021]' },
      ]),
    },
    {
      title: 'Awards',
      entries: keyed([
        { label: 'Top 2 UX Designer', meta: 'Clube Criativos de Portugal [2023]' },
        { label: 'Top 7 UX Designer', meta: 'Clube Criativos de Portugal [2021]' },
        { label: 'Top 9 UI Designer', meta: 'Clube Criativos de Portugal [2021]' },
        { label: 'Special Kudos | Clickguard', meta: 'CSS Design Awards [5 Oct 2025]' },
        { label: 'Special Kudos | The Land Group', meta: 'CSS Design Awards [23 Apr 2024]' },
        { label: 'Special Kudos | Software Angels', meta: 'CSS Design Awards [18 Apr 2023]' },
        { label: 'Special Kudos | Rocco', meta: 'CSS Design Awards [3 Sep 2022]' },
        { label: 'Honorable Mentions | Specialist Ceramics', meta: 'awwwards [8 Mar 2022]' },
        { label: 'Special Kudos | PG Arquitetos', meta: 'CSS Design Awards [11 Apr 2022]' },
        { label: 'Website of the day | Specialist Ceramics', meta: 'CSS Design Awards [18 Nov 2021]' },
        { label: 'Honorable Mentions | PG Arquitetos', meta: 'awwwards [29 Oct 2021]' },
        { label: 'Site of the day | Amouse Bouche', meta: 'awwwards [15 Aug 2021]' },
        { label: 'Website of the day | Amouse Bouche', meta: 'CSS Design Awards [13 Jul 2021]' },
        { label: 'Honorable Mentions | Design for investment', meta: 'awwwards [14 Jan 2021]' },
      ]),
    },
  ]),
  seo: {
    _type: 'seo',
    metaTitle: 'About',
    metaDescription:
      'Pedro Borges — a UX/UI designer focused on intentional design decisions rooted in psychology and perception.',
  },
}

const workPage = {
  _id: 'workPage',
  _type: 'workPage',
  quoteText: 'Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.',
  quoteAttribution: 'Charles Eames',
  featuredProjects: refs(['clickguard', 'leafwell', 'amuse-bouche']),
  gridProjects: refs(['clickguard', 'plen-advogados', 'opterion', 'omniscience', 'nova-mentorship', 'aruki', 'insider', 'woods']),
  seo: {
    _type: 'seo',
    metaTitle: 'Work',
    metaDescription:
      'Selected work by Pedro Borges — UX/UI design for SaaS, healthcare, and brand platforms, including award-winning projects.',
  },
}

const contactPage = {
  _id: 'contactPage',
  _type: 'contactPage',
  heading: "Let's work together.",
  topicsLabel: 'I am reaching out about',
  topics: keyed([
    { value: 'full-time', label: 'A full time role' },
    { value: 'freelance', label: 'A freelance project' },
    { value: 'other', label: 'Something else' },
  ]),
  emailLabel: 'Or just start a conversation at',
  socialTitle: 'Social',
  seo: {
    _type: 'seo',
    metaTitle: 'Contact',
    metaDescription:
      "Let's work together — reach out to Pedro Borges about a full-time role, a freelance project, or anything else.",
  },
}

// --- Emit (projects first so references resolve cleanly) -----------------
const docs = [...projectSource.map(projectDoc), siteSettings, homePage, aboutPage, workPage, contactPage]
const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n'
const outPath = join(here, 'seed.ndjson')
writeFileSync(outPath, ndjson)
console.log(`Wrote ${docs.length} documents → ${outPath}`)
