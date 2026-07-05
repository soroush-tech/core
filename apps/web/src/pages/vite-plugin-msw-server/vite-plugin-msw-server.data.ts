import type { PackageHeroProps } from 'src/section/PackageHero'

/** Hero content for the vite-plugin-msw-server package page. Mirrors packages/…/package.json. */
export const hero: PackageHeroProps = {
  name: '@soroush.tech/vite-plugin-msw-server',
  tagline:
    'Mock the server side of your app in end-to-end tests — point Playwright or Cypress at Vite and your SSR data loaders resolve against msw handlers instead of a live API. Deterministic, no seeded backend, no network flake.',
  install: 'npm i -D @soroush.tech/vite-plugin-msw-server msw',
  npmUrl: 'https://www.npmjs.com/package/@soroush.tech/vite-plugin-msw-server',
  repoUrl: 'https://github.com/soroush-tech/core/tree/main/packages/vite-plugin-msw-server',
}
