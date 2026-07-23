import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // The bin/ files are two-line CLI shells over src/; only the logic is covered.
      include: ['src/**/*.ts'],
      thresholds: { 100: true },
    },
  },
})
