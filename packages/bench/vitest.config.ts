import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // The executable entrypoints are impure process/Docker/mitata glue that
      // runs on the host (bin) or in-container (harness), not under vitest. All
      // of their logic lives in the covered modules (cli, docker, runner).
      exclude: ['src/bin.ts', 'src/harness.ts'],
      thresholds: { 100: true },
    },
  },
})
