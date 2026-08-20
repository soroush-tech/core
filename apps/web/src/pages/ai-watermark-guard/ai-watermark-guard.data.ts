import type { PackageHeroProps } from 'src/section/PackageHero'

/**
 * Hero content for the ai-watermark-guard package page.
 *
 * Like oxfmt-quick, this package lives in its own repository rather than under `packages/`, so
 * `repoUrl` points at that repository root and the page renders a README written for the site
 * instead of the package's own.
 */
export const hero: PackageHeroProps = {
  name: 'ai-watermark-guard',
  tagline:
    'Finds the characters that mark text as machine-written - em dashes, curly quotes, ellipses - alongside the invisible characters and mojibake nobody meant to commit. Written in Rust: one prebuilt binary that sweeps a 1,600-file repository in about 100ms, so it can run on every commit.',
  install: 'npm i -D ai-watermark-guard',
  npmUrl: 'https://www.npmjs.com/package/ai-watermark-guard',
  repoUrl: 'https://github.com/soroush-tech/ai-watermark-guard',
}
