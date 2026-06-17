import { computed } from 'vue'
import { SITE_SETTINGS } from '~/utils/sanityQueries'

// Global site settings (email, socials, location, nav) shared by the always-
// mounted shell — AppFooter, AppMenu — and the Contact page. Consumed WITHOUT
// `await` so the persistent shell never suspends the page transition; the same
// 'siteSettings' key dedupes every caller down to a single request. Each field
// falls back to the hardcoded Figma value when the CMS is empty or hasn't landed
// yet, so SSR and the first client paint stay stable.
const FALLBACK = {
  brandName: 'Pedro Borges',
  tagline: 'UX/UI Designer',
  contactEmail: 'pedrosmborges@gmail.com',
  locationLabel: 'Lisbon, Portugal',
  timezone: 'Europe/Lisbon',
  socials: [
    { platform: 'linkedin', label: 'Linkedin', url: 'https://www.linkedin.com/in/pedrosmborges/' },
    { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/pedro.sm.borges/' },
  ],
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
  ],
}

export function useSiteSettings() {
  const { data } = useSanityQuery('siteSettings', SITE_SETTINGS, {}, { lazy: import.meta.client })

  const settings = computed(() => {
    const s = data.value || {}
    return {
      brandName: s.brandName || FALLBACK.brandName,
      tagline: s.tagline || FALLBACK.tagline,
      contactEmail: s.contactEmail || FALLBACK.contactEmail,
      locationLabel: s.locationLabel || FALLBACK.locationLabel,
      timezone: s.timezone || FALLBACK.timezone,
      socials: s.socials?.length ? s.socials : FALLBACK.socials,
      navItems: s.navItems?.length ? s.navItems : FALLBACK.navItems,
    }
  })

  return { settings }
}
