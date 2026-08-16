import { defineConfig, devices } from '@playwright/test'
import * as process from 'node:process'

// For coverage runs, serve a source mapped production build (monocart maps the chunk
// coverage back to src/**); otherwise use the dev server.
const coverage = process.env.E2E_COVERAGE === 'true'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  tsconfig: './tsconfig.app.json',
  globalSetup: './src/test/e2e/coverage.setup.ts',
  globalTeardown: './src/test/e2e/coverage.teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Cap local parallelism: the CPU-heavy D3 graph specs flake when all three browsers
  // run them concurrently. Two workers keeps the suite fast (~1m) and stable.
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9999',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    // Dedicated e2e port (via E2E_PORT below) so we never reuse a developer's
    // `pnpm dev` on 3000 (MSW off) - that server lacks VITE_APP_MSW_ACTIVE and
    // the mocks never load. The port is applied in vite.config.ts.
    command: coverage ? 'pnpm build && pnpm preview:e2e' : 'pnpm dev',
    port: 9999,
    // Never reuse a running dev server for coverage - it must hit the sourcemapped build.
    reuseExistingServer: coverage ? false : !process.env.CI,
    timeout: coverage ? 180_000 : 60_000,
    // Mock server-side GitHub fetches for e2e (dev SSR + prerender) via the gated
    // msw/node vite plugin and the browser worker. Never set by CD's build.
    env: { ...process.env, VITE_APP_MSW_ACTIVE: 'true', E2E_PORT: '9999' } as Record<
      string,
      string
    >,
  },
})
