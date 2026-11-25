import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Electron/bootstrap glue (spawn injection, React mount) is exercised by
      // the Playwright-Electron e2e suite per epic #295 - mirroring how
      // apps/web keeps pages/ e2e-only. Everything else must hold 100%.
      exclude: [
        '**/*.d.ts',
        '**/*.e2e.ts',
        'src/main/index.ts',
        'src/renderer/src/main.tsx',
        'src/test/**',
      ],
      thresholds: { 100: true },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          // Browser-mode specs run in the `unit-browser` project, not jsdom.
          exclude: ['**/*.browser.test.*'],
        },
      },
      {
        // Real-browser tier: suites that drive the whole renderer through
        // userEvent, which jsdom makes several times slower. Chromium is also
        // the engine the renderer ships in (Electron). Only *.browser.test.*
        // files run here, headless.
        extends: true,
        test: {
          name: 'unit-browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // Explicit, and not apps/web's 51316: both apps' browser projects
            // run at once under `pnpm -r test`. The default (63315) can also
            // land in a Windows Hyper-V excluded port range (listen EACCES).
            api: { port: 51317 },
          },
        },
      },
    ],
  },
})
