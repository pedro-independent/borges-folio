// Helpers for the case-study Portable Text body.
//
// The Studio conventions (see studio/schemaTypes/documents/project.js):
//   h2  = "Section label" — starts a new labelled row; the text becomes the small
//         left-column label and every block after it flows in the right column.
//   h3  = "Heading" (24px statement), h4 = "Small label" (11px field name).
//   image blocks may be marked `half`; consecutive halves pair side by side.
//   stats = a row of label-over-value columns (outcome numbers, team list).

const spanText = (node) => (node.children || []).map((c) => c.text || '').join('')
const isEmptyBlock = (node) => node._type === 'block' && !spanText(node).trim()

// Split a body into renderable sections: [{ key, label, blocks }]. Splits on h2
// blocks, drops empty paragraphs (stray Enter presses in the Studio), and folds
// consecutive half-width images into synthetic `imageRow` nodes so the renderer
// can lay them out side by side without look-ahead.
export function caseSections(body) {
  const sections = []
  let cur = null
  for (const node of body || []) {
    if (isEmptyBlock(node)) continue
    if (node._type === 'block' && node.style === 'h2') {
      if (cur) sections.push(cur)
      cur = { key: node._key || `s${sections.length}`, label: spanText(node).trim(), blocks: [] }
      continue
    }
    if (!cur) cur = { key: 'lead', label: '', blocks: [] }
    const prev = cur.blocks[cur.blocks.length - 1]
    if (node._type === 'image' && node.half && prev?._type === 'imageRow') {
      prev.images.push(node)
    } else if (node._type === 'image' && node.half) {
      cur.blocks.push({ _type: 'imageRow', _key: `row-${node._key}`, images: [node] })
    } else {
      cur.blocks.push(node)
    }
  }
  if (cur) sections.push(cur)
  return sections
}

// --- Builders (local fallback content + studio/seed mirror this shape) ------
let n = 0
const key = () => `pt${(n++).toString(36)}`

export const ptBlock = (style, text) => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
export const ptLabel = (text) => ptBlock('h2', text) // section label — starts a row
export const ptHeading = (text) => ptBlock('h3', text)
export const ptSub = (text) => ptBlock('h4', text)
export const ptP = (text) => ptBlock('normal', text)
// Local-only placeholder image: a flat tint box until the client uploads media.
export const ptTint = (tint, half = false) => ({ _type: 'image', _key: key(), tint, ...(half && { half }) })
export const ptFacts = (...pairs) => ({
  _type: 'stats',
  _key: key(),
  items: pairs.map(([label, value]) => ({ _key: key(), label, value })),
})
