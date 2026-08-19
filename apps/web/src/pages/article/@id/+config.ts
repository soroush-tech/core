import type { Config } from 'vike/types'

// Run data() in the browser on client-side navigation too, not only on the server
// (see dataIsomorph in src/renderer/+config.ts). Article pages are prerendered from the
// build-time gist list; a gist published afterwards has no prerendered page, so navigating
// to it can't fetch a server-rendered pageContext on our static host. Isomorph data lets
// data() resolve the gist in the browser instead of crashing. Prerendered articles are
// unaffected - they still render data() on the server at build time.
export default {
  dataIsomorph: true,
} satisfies Config
