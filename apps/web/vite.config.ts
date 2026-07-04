import { defineConfig } from 'vite'
import vike from 'vike/plugin'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { imagetools } from 'vite-imagetools'
import { compression } from 'vite-plugin-compression2'
import { resolve } from 'node:path'
import watch from '@soroush.tech/vite-plugin-watch'
import mswServer from '@soroush.tech/vite-plugin-msw-server'
import sitemap from '@soroush.tech/vite-plugin-sitemap'
import { codecovVitePlugin } from '@codecov/vite-plugin'

// Opt-in: precompressed assets are only served by a static server configured for
// them (nginx gzip_static/brotli_static, etc.). GitHub Pages ignores them, so this
// stays off by default — enable with COMPRESS=true on the controlled-server build.
const compress = process.env.COMPRESS === 'true'

// Test-only: mock server-side GitHub fetches (dev SSR + prerender). The e2e commands
// set this; CD's build never does, so production always prerenders against the live API.
const mswEnabled = process.env.VITE_APP_MSW_ACTIVE === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    imagetools(),
    watch({
      script: 'scripts/gen-experienceGraph.ts',
      watch: 'src/section/ExperienceGraph/ExperienceGraph.data.ts',
    }),
    react(),
    process.env.NODE_ENV !== 'storybook' && vike(),
    sitemap(),
    mswServer({
      enable: mswEnabled,
      server: () => import('./src/test/mocks/server').then((m) => m.server),
    }),
    compress &&
      compression({
        algorithms: ['gzip', 'brotliCompress'],
        threshold: 10240,
        deleteOriginalAssets: false,
      }),
    // Codecov Bundle Analysis: only upload from CI, CD
    codecovVitePlugin({
      enableBundleAnalysis: Boolean(process.env.CI && process.env.CODECOV_TOKEN),
      bundleName: process.env.APP_ENV === 'production' ? '@soroush.tech/prod' : '@soroush.tech/dev',
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: 'github',
    }),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
      // Repo-root packages dir, so package pages can import a package's README as a raw
      // string (`packages/<name>/README.md?raw`) instead of a brittle `../../../../` path.
      packages: resolve(__dirname, '../../packages'),
    },
  },
  server: {
    // Playwright runs the dev server on a dedicated port (E2E_PORT) so it never
    // reuses a developer's `pnpm dev` on 3000 (which has MSW off). Unset → vike's
    // default 3000 for normal dev. Vike rejects a `--port` CLI flag, so set it here.
    ...(process.env.E2E_PORT ? { port: Number(process.env.E2E_PORT), strictPort: true } : {}),
    // Keep the test coverage output out of the dev server: don't watch it (no
    // reload churn when `pnpm test:coverage` writes it) and don't serve it.
    watch: { ignored: ['**/coverage/**'] },
    fs: { deny: ['**/coverage/**'] },
  },
  build: {
    outDir: './build',
    emptyOutDir: true,
    // Emit sourcemaps for the e2e coverage build so monocart can map chunk coverage
    // back to the original src/** files. Off for normal/production builds.
    sourcemap: process.env.E2E_COVERAGE === 'true',
  },
})
