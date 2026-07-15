import {defineMigration, at, set, unset} from 'sanity/migrate'

/**
 * Converts the old structured case-study fields into the single rich-text
 * `body` (Portable Text) the client now edits — IN PLACE, preserving every
 * word already authored in the Studio.
 *
 *   npx sanity migration run caseStudyToPortableText --project 73l6qarp --dataset production
 *   (add --no-dry-run to actually write; it dry-runs by default)
 *
 * Why a migration and not a seed re-import: the production dataset has diverged
 * from studio/seed — e.g. Leafwell's whole case study (3 outcomes, 5 decisions)
 * was written in the Studio and appears in no seed file. `dataset import
 * --replace` would overwrite those documents with the seed's version and destroy
 * that work. This only rewrites the four legacy fields and leaves everything
 * else (cover, listing flags, SEO) untouched.
 *
 * Mapping — mirrors app/utils/portableCase.js:
 *   outcomes[]        → "Outcomes" section label + a stats (facts row) block
 *   role.statement    → "My role" section label + h3 heading
 *   role.scope        → h4 "Scope" + paragraph
 *   role.methods      → h4 "Methods" + paragraph
 *   role.media[]      → images appended to the My role section (2+ ⇒ half width,
 *                       matching the design's side-by-side pair)
 *   decisions[]       → "Key decisions" section label + h3/paragraph per item,
 *                       each item's image following its body
 *   problem           → left alone; it stays its own structured field
 */

// Deterministic keys: same input ⇒ same output, so a re-run is a no-op rather
// than churning every _key (and the dry-run diff stays readable).
const mkKey = (parts: (string | number)[]) => `m-${parts.join('-')}`

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type Block = {
  _type: 'block'
  _key: string
  style: string
  markDefs: never[]
  children: Span[]
}

const block = (style: string, text: string, key: string): Block => ({
  _type: 'block',
  _key: mkKey([key]),
  style,
  markDefs: [],
  children: [{_type: 'span', _key: mkKey([key, 's']), text, marks: []}],
})

export default defineMigration({
  title: 'Case study: structured fields → rich text body',
  documentTypes: ['project'],

  migrate: {
    document(doc: any) {
      const {outcomes, role, decisions} = doc
      // Nothing legacy to convert, or already converted — skip untouched.
      if (!outcomes && !role && !decisions) return undefined
      if (Array.isArray(doc.body) && doc.body.length) return undefined

      const body: any[] = []

      if (Array.isArray(outcomes) && outcomes.length) {
        body.push(block('h2', 'Outcomes', 'outcomes-label'))
        body.push({
          _type: 'stats',
          _key: mkKey(['outcomes']),
          items: outcomes.map((o: any, i: number) => ({
            _key: mkKey(['outcome', i]),
            ...(o.label && {label: o.label}),
            ...(o.value && {value: o.value}),
          })),
        })
      }

      if (role && (role.statement || role.scope || role.methods || role.media?.length)) {
        body.push(block('h2', 'My role', 'role-label'))
        if (role.statement) body.push(block('h3', role.statement, 'role-statement'))
        if (role.scope) {
          body.push(block('h4', 'Scope', 'role-scope-label'))
          body.push(block('normal', role.scope, 'role-scope'))
        }
        if (role.methods) {
          body.push(block('h4', 'Methods', 'role-methods-label'))
          body.push(block('normal', role.methods, 'role-methods'))
        }
        // The design pairs role media side by side; a lone image goes full width.
        const media = Array.isArray(role.media) ? role.media : []
        media.forEach((img: any, i: number) => {
          body.push({...img, _key: mkKey(['role-media', i]), ...(media.length > 1 && {half: true})})
        })
      }

      if (Array.isArray(decisions) && decisions.length) {
        body.push(block('h2', 'Key decisions', 'decisions-label'))
        decisions.forEach((d: any, i: number) => {
          if (d.heading) body.push(block('h3', d.heading, `decision-${i}-h`))
          if (d.body) body.push(block('normal', d.body, `decision-${i}-b`))
          if (d.image) body.push({...d.image, _key: mkKey(['decision-img', i])})
        })
      }

      if (!body.length) return undefined

      return [
        at('body', set(body)),
        at('outcomes', unset()),
        at('role', unset()),
        at('decisions', unset()),
      ]
    },
  },
})
