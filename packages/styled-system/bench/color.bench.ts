// Built dist of this package, both formats, imported directly by file path (a
// deliberate exception to the no-relative-imports rule: we target the build
// artifact, not src, so the comparison against the npm release's prebuilt dist
// is like-for-like). Run `pnpm build` in this package first.
import { color as colorCjs } from '../dist/color.cjs'
import { color as colorMjs } from '../dist/color.mjs'
import type { BenchConfig } from '@soroush.tech/bench'

const props = {
  theme: { colors: { brand: '#0af', muted: '#666' } },
  color: 'brand',
  bg: 'muted',
}

type ColorFn = (props: typeof props) => unknown

/**
 * CI performance gate: the local build vs the last published release of this
 * same package, installed inside the sandbox via npm's `latest` dist-tag (so
 * "previous version" never needs a lookup step) and read off `ctx.modules`.
 * The bench-action job compares every local case against `previous` and fails
 * the PR when one drops below the configured minimum speed ratio.
 *
 * Plain-object export (`satisfies` + erased type import), so the sandbox needs
 * nothing installed to load this file.
 */
export default {
  name: 'styled-system color()',
  packages: { previous: '@soroush.tech/styled-system@latest' },
  cases: {
    'local-cjs': () => colorCjs(props),
    'local-mjs': () => colorMjs(props),
    previous: ({ modules }) => (modules.previous as { color: ColorFn }).color(props),
  },
  // Median-of-5 keeps the gate stable on shared CI runners.
  options: { rounds: 5 },
} satisfies BenchConfig
