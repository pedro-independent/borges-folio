// Storage adapter for the feedback tool. Backend-agnostic so the server routes
// stay thin and the front-end never knows where comments live:
//
//   • Sanity   — used whenever a write token is configured (the deployed/preview
//                path; works on serverless where the filesystem is read-only).
//   • Local file — `.data/feedback.json` (gitignored), used in dev when no token
//                is set, so the tool works out-of-the-box with zero provisioning.
//
// Comments are stored under a dedicated `_type` ("feedbackComment") with ids
// prefixed `feedback.` — they never collide with real content, never appear in
// the Studio desk, and the public write endpoints are hard-limited to that prefix
// so they can't mutate anything else. Document shape is identical across both
// backends (note `replies[]._key`, so the Sanity array is valid).
//
// NB: this lives in a Nuxt LAYER. Layer server files don't receive Nitro's
// auto-imports, so h3 helpers are imported explicitly and config is read straight
// from process.env (available at runtime in dev and on Vercel/Nitro alike).

import { createError } from 'h3'
import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { resolve, dirname } from 'node:path'

export const FEEDBACK_TYPE = 'feedbackComment'
export const ID_PREFIX = 'feedback.'

const hasToken = () => !!process.env.SANITY_API_WRITE_TOKEN

export function feedbackEnabled() {
  return process.env.FEEDBACK_ENABLED === 'true' || process.env.NODE_ENV !== 'production'
}

export function assertEnabled() {
  if (!feedbackEnabled()) {
    throw createError({ statusCode: 403, statusMessage: 'Feedback tool is disabled' })
  }
}

// Guard for the public [id] routes: only ids this tool minted may be touched.
export function assertId(id) {
  if (typeof id !== 'string' || !id.startsWith(ID_PREFIX)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid feedback id' })
  }
  return id
}

// ── Sanity backend ──────────────────────────────────────────────────────────
let _sc
function sanity() {
  if (!_sc) {
    _sc = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false, // comments must read back immediately after a write
    })
  }
  return _sc
}

// ── File backend ────────────────────────────────────────────────────────────
const FILE = resolve(process.cwd(), '.data/feedback.json')
async function fileRead() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    return []
  }
}
async function fileWrite(list) {
  await fs.mkdir(dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(list, null, 2))
}

// ── Public API (backend-agnostic) ────────────────────────────────────────────
export async function listComments() {
  if (hasToken()) {
    return await sanity().fetch(`*[_type == $t] | order(createdAt asc)`, { t: FEEDBACK_TYPE })
  }
  return await fileRead()
}

export async function createComment(input) {
  const doc = {
    _id: ID_PREFIX + randomUUID(),
    _type: FEEDBACK_TYPE,
    route: str(input.route, '/', 300),
    xPct: clamp01(input.xPct),
    yPct: clamp01(input.yPct),
    viewportWidth: int(input.viewportWidth),
    selectorHint: str(input.selectorHint, '', 200),
    elementText: str(input.elementText, '', 120),
    pageTitle: str(input.pageTitle, '', 200),
    author: str(input.author, 'Anonymous', 80),
    body: str(input.body, '', 4000),
    status: 'open',
    replies: [],
    createdAt: new Date().toISOString(),
  }
  if (hasToken()) return await sanity().create(doc)
  const list = await fileRead()
  list.push(doc)
  await fileWrite(list)
  return doc
}

export async function addReply(id, input) {
  const reply = {
    _key: randomUUID(),
    _type: 'feedbackReply',
    author: str(input.author, 'Anonymous', 80),
    body: str(input.body, '', 4000),
    at: new Date().toISOString(),
  }
  if (hasToken()) {
    return await sanity().patch(id).setIfMissing({ replies: [] }).append('replies', [reply]).commit()
  }
  return await fileMutate(id, (doc) => {
    doc.replies = doc.replies || []
    doc.replies.push(reply)
  })
}

export async function setStatus(id, status) {
  const s = status === 'resolved' ? 'resolved' : 'open'
  if (hasToken()) return await sanity().patch(id).set({ status: s }).commit()
  return await fileMutate(id, (doc) => { doc.status = s })
}

export async function editBody(id, body) {
  const b = str(body, '', 4000)
  if (hasToken()) return await sanity().patch(id).set({ body: b }).commit()
  return await fileMutate(id, (doc) => { doc.body = b })
}

export async function deleteComment(id) {
  if (hasToken()) {
    await sanity().delete(id)
  } else {
    const list = await fileRead()
    await fileWrite(list.filter((c) => c._id !== id))
  }
  return { ok: true, id }
}

async function fileMutate(id, mutate) {
  const list = await fileRead()
  const doc = list.find((c) => c._id === id)
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  mutate(doc)
  await fileWrite(list)
  return doc
}

// ── helpers ──────────────────────────────────────────────────────────────────
function str(v, fallback, max) {
  const s = (v ?? '').toString().trim()
  return (s || fallback).slice(0, max)
}
function clamp01(n) {
  const x = Number(n)
  return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0
}
function int(n) {
  const x = parseInt(n, 10)
  return Number.isFinite(x) ? x : 0
}
