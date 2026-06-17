import groq from 'groq'

// Central GROQ for the site. Image fields are resolved to plain asset URLs so a
// missing image simply yields null and the component falls back to its local
// /img asset. Page docs are singletons (one each); projects are a collection.

// --- Global ---------------------------------------------------------------
export const SITE_SETTINGS = groq`*[_type == "siteSettings"][0]{
  brandName, tagline, contactEmail, locationLabel, timezone,
  socials[]{platform, label, url},
  navItems[]{label, href},
  defaultSeo
}`

// Reusable project-card projection (Work grid / featured / home).
const CARD = groq`_id, title, subtitle, awards, comingSoon, featured, year, tint, "slug": slug.current`

// --- Pages ----------------------------------------------------------------
export const HOME_PAGE = groq`*[_type == "homePage"][0]{
  heroHeading[]{text, indent},
  heroParagraph,
  "heroImage": heroImage.asset->url,
  introText,
  industriesLeftLabel, industriesRightLabel, industries,
  portfolioTitle, portfolioCta,
  "portfolioProjects": portfolioProjects[]->{ ${CARD} },
  contactLabel, contactHeading, contactCta,
  heroAnnotations, industriesAnnotation, portfolioAnnotations,
  seo
}`

export const ABOUT_PAGE = groq`*[_type == "aboutPage"][0]{
  introLede, bioTitle, bioLead, bioBody,
  "portrait": portrait.asset->url, portraitCaption,
  "awardsImage": awardsImage.asset->url,
  quoteText, quoteAttribution,
  cvGroups[]{ title, entries[]{ label, meta } },
  seo
}`

export const WORK_PAGE = groq`*[_type == "workPage"][0]{
  quoteText, quoteAttribution,
  "featured": featuredProjects[]->{ ${CARD} },
  "grid": gridProjects[]->{ ${CARD} },
  "archive": *[_type == "project" && defined(year)] | order(year desc, sortOrder asc){ ${CARD} },
  seo
}`

export const CONTACT_PAGE = groq`*[_type == "contactPage"][0]{
  heading, topicsLabel,
  topics[]{ value, label },
  emailLabel, socialTitle,
  "media": media.asset->url,
  seo
}`

// --- Projects -------------------------------------------------------------
export const ALL_PROJECT_CARDS = groq`*[_type == "project"] | order(sortOrder asc, title asc){ ${CARD} }`

export const PROJECT_BY_SLUG = groq`*[_type == "project" && slug.current == $slug][0]{
  title, subtitle, category, description, awards, tint,
  "cover": cover.asset->url,
  services,
  problem,
  outcomes[]{ label, value },
  role{ statement, scope, methods, "media": media[].asset->url },
  decisions[]{ heading, body, "image": image.asset->url },
  seo
}`

// Slugs for prerendering / static generation of project pages.
export const PROJECT_SLUGS = groq`*[_type == "project" && defined(slug.current)].slug.current`
