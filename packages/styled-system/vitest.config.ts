import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Redirect the package's self-references to local source so coverage is
  // attributed to ./src (not the node_modules symlink). Test-only - it does
  // not affect how consumers resolve the package.
  resolve: {
    alias: [
      {
        find: /^@soroush\.tech\/styled-system$/,
        replacement: resolve(__dirname, 'src/index.ts'),
      },
      {
        find: /^@soroush\.tech\/styled-system\/(.+)$/,
        replacement: resolve(__dirname, 'src/$1/index.ts'),
      },
    ],
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts,tsx,jsx}'],
      thresholds: { 100: true },
    },
  },
})
