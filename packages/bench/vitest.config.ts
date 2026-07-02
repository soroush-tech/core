import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // Accepted coverage exception: the two executable entrypoints are impure
      // glue that never runs under vitest — bin.ts spawns Docker on the host,
      // harness.ts runs in-container under mitata. Their decision logic is
      // extracted into covered modules (cli, docker incl. `closeResult`, runner),
      // leaving only unconditional I/O wiring here; everything else stays at 100%.
      exclude: ['src/bin.ts', 'src/harness.ts'],
      thresholds: { 100: true },
    },
  },
})
