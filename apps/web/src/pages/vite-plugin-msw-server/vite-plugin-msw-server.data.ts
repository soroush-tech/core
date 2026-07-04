import type { PackageHeroProps } from 'src/section/PackageHero'

/** Hero content for the vite-plugin-msw-server package page. Mirrors packages/…/package.json. */
export const hero: PackageHeroProps = {
  name: '@soroush.tech/vite-plugin-msw-server',
  tagline:
    'A Vite plugin that starts an msw/node mock server inside the Vite process, so server-side data fetching resolves against your mocks during dev (SSR) and build (SSG prerendering).',
  install: 'npm i -D @soroush.tech/vite-plugin-msw-server msw',
  npmUrl: 'https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server',
  repoUrl: 'https://github.com/soroush-tech/soroush.tech/tree/main/packages/vite-plugin-msw-server',
}
