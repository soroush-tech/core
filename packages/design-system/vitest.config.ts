import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import storybookTest from '@storybook/addon-vitest/vitest-plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.stories.*', '**/__mocks__/**'],
      thresholds: { 100: true },
    },
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['**/*.browser.test.*', '**/node_modules/**', '**/dist/**'],
        },
      },
      {
        // Real-browser tier: specs that need a layout engine jsdom can't provide
        // (Modal scroll-lock metrics). Only *.browser.test.* files run here.
        test: {
          name: 'browser',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // Vitest's default API port (63315) can land in a Windows
            // Hyper-V excluded port range, failing with listen EACCES.
            api: { port: 51315 },
          },
        },
      },
      {
        // Story tier: every story's play function and a11y check, run against the
        // package's own Storybook (`baseTheme`). The site's Storybook runs these
        // same stories in the brand themes from its own vitest project.
        plugins: [storybookTest({ configDir: resolve(__dirname, '.storybook') })],
        test: {
          name: 'storybook',
          setupFiles: ['./.storybook/vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // See the `browser` project: avoid the Windows excluded port range.
            api: { port: 51318 },
          },
        },
      },
    ],
  },
})
