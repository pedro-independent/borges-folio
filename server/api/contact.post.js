import { Resend } from 'resend'

// Contact form → email, via Resend. The browser POSTs here (same-origin) and the
// API key never leaves the server. Config comes from the PRIVATE half of
// runtimeConfig — see nuxt.config.js for the env vars that override each value.
//
// The reply-to is set to the sender's address, so replying from the inbox goes
// straight back to them rather than to the Resend sandbox sender.

let resend

// Belt-and-braces caps so a scripted POST can't push a multi-megabyte body into
// an email. Anything longer is rejected outright rather than silently truncated.
const LIMITS = { name: 100, email: 200, topic: 100, detail: 5000 }

// Deliberately permissive — real addresses are validated by delivery, not regex.
// This only rejects the obviously-malformed before we spend a Resend call.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean = (v) => (typeof v === 'string' ? v.trim() : '')
// Header-injection guard: these values land in the subject line, where a raw
// newline could start a second header.
const oneLine = (v) => clean(v).replace(/[\r\n]+/g, ' ')
const esc = (v) =>
  clean(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    // Misconfigured host, not a bad request — say so plainly in the log and give
    // the visitor the mailto fallback rather than a silent failure.
    console.error('[contact] NUXT_RESEND_API_KEY is not set — cannot send mail.')
    throw createError({
      statusCode: 503,
      statusMessage: 'Email is not configured',
      data: { message: 'Email isn’t configured right now. Please use the address below instead.' },
    })
  }

  const body = await readBody(event)
  const name = oneLine(body?.name)
  const email = clean(body?.email)
  const topic = oneLine(body?.topic)
  const detail = clean(body?.detail)

  // Honeypot: a field hidden from humans in the markup. Anything that fills it is
  // a bot, so ACK with a normal success and drop the message on the floor —
  // returning an error just tells the bot what to change.
  if (clean(body?.company)) return { ok: true }

  const fail = (message) => createError({ statusCode: 400, statusMessage: 'Invalid submission', data: { message } })
  if (!name) throw fail('Please add your name.')
  if (!email) throw fail('Please add your email.')
  if (!EMAIL_RE.test(email)) throw fail('That email address doesn’t look right.')
  for (const [field, max] of Object.entries(LIMITS)) {
    if (({ name, email, topic, detail })[field].length > max) throw fail(`Your ${field} is too long.`)
  }

  const subject = `New enquiry${topic ? ` — ${topic}` : ''} · ${name}`
  const text = [
    `Name:  ${name}`,
    `Email: ${email}`,
    `About: ${topic || '—'}`,
    '',
    detail || '(no message)',
  ].join('\n')
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#060606">
      <p style="margin:0 0 16px"><strong>New enquiry from the portfolio contact form</strong></p>
      <p style="margin:0 0 4px"><strong>Name:</strong> ${esc(name)}</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
      <p style="margin:0 0 16px"><strong>About:</strong> ${esc(topic) || '—'}</p>
      <div style="white-space:pre-wrap;padding-top:16px;border-top:1px solid #e9e9e9">${esc(detail) || '<em>(no message)</em>'}</div>
    </div>`

  if (!resend) resend = new Resend(config.resendApiKey)

  const { error } = await resend.emails.send({
    from: config.contactFrom,
    to: config.contactTo,
    replyTo: email,
    subject,
    text,
    html,
  })

  if (error) {
    // Resend reports failures in the payload, not by throwing. Log the real
    // reason (bad key, unverified domain, blocked recipient) but don't leak it.
    console.error('[contact] Resend rejected the send:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Email could not be sent',
      data: { message: 'Something went wrong sending your message. Please try the email address below.' },
    })
  }

  return { ok: true }
})
