import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
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
  },
})
