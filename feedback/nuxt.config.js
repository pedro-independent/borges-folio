import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

// ── Feedback layer ────────────────────────────────────────────────────────────
// A self-contained, drop-in Figma-style commenting tool for any Nuxt 4 project.
// Enable it from the host nuxt.config:  export default defineNuxtConfig({
//   extends: ['./feedback'] })  — and remove that line (or set
// FEEDBACK_ENABLED=false in production) for the real launch.
//
// Nothing here touches host files: runtimeConfig + server routes merge across
// layers, and the plugin (registered below by absolute path) mounts the overlay.
export default defineNuxtConfig({
  runtimeConfig: {
    feedback: {
      // Sanity token with write access (Editor). Optional in dev — without it,
      // comments are stored in a local .data/feedback.json (gitignored). REQUIRED
      // in production/preview, where the filesystem is read-only.
      writeToken: process.env.SANITY_API_WRITE_TOKEN || '',
    },
    public: {
      // Self-declared so the layer is portable; a host that already sets these
      // wins on merge.
      sanity: {
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
      },
      feedback: {
        // On in dev; in production only when explicitly switched on (e.g. on the
        // Vercel PREVIEW your client reviews). Baked at build — toggle via the
        // FEEDBACK_ENABLED env var, then redeploy.
        enabled: process.env.FEEDBACK_ENABLED === 'true' || process.env.NODE_ENV !== 'production',
      },
    },
  },

  // Register the client plugin by absolute path so it loads regardless of how the
  // layer's dirs are scanned. The component + store are imported by the plugin
  // relatively, so they need no auto-import.
  plugins: [{ src: resolve(here, 'runtime/feedback.client.js'), mode: 'client' }],
})
