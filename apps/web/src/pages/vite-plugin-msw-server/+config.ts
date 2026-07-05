import type { Config } from 'vike/types'

export default {
  title: '@soroush.tech/vite-plugin-msw-server',
  description:
    'Make server-side rendering deterministic in end-to-end tests: point Playwright or Cypress at Vite and your SSR data loaders resolve against msw mocks instead of a live API.',
} satisfies Config
