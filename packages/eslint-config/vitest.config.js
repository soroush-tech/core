import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['plugins/**/*.js'],
      thresholds: { 100: true },
    },
  },
})
