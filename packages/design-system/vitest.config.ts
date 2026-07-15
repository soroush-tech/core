import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

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
          },
        },
      },
    ],
  },
})
