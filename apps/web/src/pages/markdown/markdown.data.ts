import * as pkg from 'npm/@soroush.tech/markdown/package.json'
import type { PackageHeroProps } from 'src/section/PackageHero'

/** Hero content for the @soroush.tech/markdown page, sourced from its published package.json. */
export const hero: PackageHeroProps = {
  name: pkg.name,
  tagline: pkg.description,
  install: `npm i ${pkg.name} @soroush.tech/design-system`,
  npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
  repoUrl: 'https://github.com/soroush-tech/design-system/tree/main/packages/markdown',
}
