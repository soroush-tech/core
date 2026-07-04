import type { Config } from 'vike/types'

export default {
  title: '@soroush.tech/vite-plugin-msw-server',
  description:
    'Vite plugin that runs an msw/node mock server during dev and SSG/SSR builds, so server-side data fetching and prerendering resolve against mocks.',
} satisfies Config
