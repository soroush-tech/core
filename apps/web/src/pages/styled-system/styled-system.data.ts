import * as pkg from 'packages/styled-system/package.json'
import type { PackageHeroProps } from 'src/section/PackageHero'

/** Hero content for the @soroush.tech/styled-system page, sourced from its package.json. */
export const hero: PackageHeroProps = {
  name: pkg.name,
  tagline: pkg.description,
  install: `npm i ${pkg.name}`,
  npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
  repoUrl: 'https://github.com/soroush-tech/core/tree/main/packages/styled-system',
}
