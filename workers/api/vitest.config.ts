import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Load `.sql` files as their raw text (default export), mirroring wrangler's `Text` module rule
// so `import schema from './x.sql'` resolves the same way under both bundlers.
const sqlAsText = {
  name: 'sql-as-text',
  enforce: 'pre' as const,
  load(id: string) {
    const file = id.split('?')[0]
    if (file.endsWith('.sql')) {
      return `export default ${JSON.stringify(readFileSync(file, 'utf8'))}`
    }
    return null
  },
}

export default defineConfig({
  plugins: [sqlAsText],
  resolve: { alias: { src: resolve(__dirname, 'src') } },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      thresholds: { 100: true },
    },
  },
})
