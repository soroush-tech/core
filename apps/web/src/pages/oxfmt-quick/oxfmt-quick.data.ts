import type { PackageHeroProps } from 'src/section/PackageHero'

/**
 * Hero content for the oxfmt-quick package page.
 *
 * Unlike the other package pages, oxfmt-quick lives in its own repository rather than under
 * `packages/`, so `repoUrl` points at that repository root and the page renders a README
 * written for the site instead of the package's own.
 */
export const hero: PackageHeroProps = {
  name: 'oxfmt-quick',
  tagline:
    'Run oxfmt on the files you actually changed, and re-stage them — so unformatted code cannot reach a commit. What pretty-quick is to Prettier, for the oxc formatter.',
  install: 'npm i -D oxfmt oxfmt-quick',
  npmUrl: 'https://www.npmjs.com/package/oxfmt-quick',
  repoUrl: 'https://github.com/soroush-tech/oxfmt-quick',
}
