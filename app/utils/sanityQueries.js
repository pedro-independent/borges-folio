import groq from 'groq'

// Central GROQ for the site. Image fields are resolved to plain asset URLs so a
// missing image simply yields null and the component falls back to its local
// /img asset. Page docs are singletons (one each); projects are a collection.

// Reusable SEO projection — resolves the social share image to a plain URL so a
// missing one yields null (the page then falls back to the default OG image).
const SEO = groq`metaTitle, metaDescription, "ogImage": ogImage.asset->url`

// --- Global ---------------------------------------------------------------
export const SITE_SETTINGS = groq`*[_type == "siteSettings"][0]{
  brandName, tagline, contactEmail, locationLabel, timezone,
  socials[]{platform, label, url},
  navItems[]{label, href},
  defaultSeo{ ${SEO} }
}`

// Reusable project-card projection (Work grid / featured / home). `tint` is kept
// as a graceful background fallback for existing data; new cards use `cover`.
const CARD = groq`_id, title, subtitle, category, awards, comingSoon, year, tint, "cover": cover.asset->url, "slug": slug.current`

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
  seo{ ${SEO} }
}`

export const ABOUT_PAGE = groq`*[_type == "aboutPage"][0]{
  introLede, bioTitle, bioLead, bioBody,
  "portrait": portrait.asset->url, portraitCaption,
  quoteText, quoteAttribution,
  cvGroups[]{ title, entries[]{ label, meta } },
  seo{ ${SEO} }
}`

export const WORK_PAGE = groq`*[_type == "workPage"][0]{
  quoteText, quoteAttribution,
  "featured": featuredProjects[]->{ ${CARD} },
  "grid": gridProjects[]->{ ${CARD} },
  "archive": archiveProjects[]->{ ${CARD}, liveUrl },
  seo{ ${SEO} }
}`

export const CONTACT_PAGE = groq`*[_type == "contactPage"][0]{
  heading, topicsLabel,
  topics[]{ value, label },
  emailLabel, socialTitle,
  "media": media.asset->url,
  seo{ ${SEO} }
}`

// --- Projects -------------------------------------------------------------
// Case-study cards for the footer's "Next up" rotation: the workPage doc's
// curated featured + grid lists, in that order. These are the projects with a
// case study to land on — the by-year archive list (archiveProjects) is
// deliberately absent, and a bare *[_type == "project"] sweep would include it.
// (`year` can NOT discriminate: real data fills it on case studies too.)
export const NEXT_UP_CARDS = groq`*[_type == "workPage"][0]{
  "cards": coalesce(featuredProjects[]->{ ${CARD} }, []) + coalesce(gridProjects[]->{ ${CARD} }, [])
}`

export const PROJECT_BY_SLUG = groq`*[_type == "project" && slug.current == $slug][0]{
  title, subtitle, category, description, awards, tint, liveUrl,
  "cover": cover.asset->url,
  services,
  problem,
  body[]{
    ...,
    _type == "image" => { "url": asset->url, alt, half },
    _type == "stats" => { items[]{ _key, label, value, "image": image.asset->url } }
  },
  seo{ ${SEO} }
}`

// Slugs for prerendering / static generation of project pages.
export const PROJECT_SLUGS = groq`*[_type == "project" && defined(slug.current)].slug.current`
