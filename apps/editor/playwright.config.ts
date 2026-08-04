import * as process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  tsconfig: './tsconfig.json',
  globalSetup: './src/test/e2e/coverage.setup.ts',
  globalTeardown: './src/test/e2e/coverage.teardown.ts',
  // Every test boots its own Electron instance (see src/test/e2e/fixtures.ts);
  // keep them sequential so two apps never race on the shared user-data dir.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: { trace: 'on-first-retry' },
  projects: [{ name: 'electron' }],
})
