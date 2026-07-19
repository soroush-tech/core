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
      // Electron/bootstrap glue (window creation, React mount) is exercised by
      // Playwright-Electron e2e per epic #295 — mirroring how apps/web keeps
      // pages/ e2e-only. Everything else must hold 100%.
      exclude: ['**/*.d.ts', 'src/main/index.ts', 'src/renderer/src/main.tsx'],
      thresholds: { 100: true },
    },
  },
})
