// Install-free: `import type` is erased at runtime, so this runs with nothing
// installed. `satisfies BenchConfig` type-checks it without a runtime wrapper.
//
//   npx '@soroush.tech/bench' ./clone.bench.ts --cpuset 0 --cpus 1 --memory 512m
//
// (Quote the '@…' for PowerShell; Docker must be running — the sandbox image is
// built once and cached.)
import type { BenchConfig } from '@soroush.tech/bench'

const data = { id: 1, tags: ['a', 'b', 'c'], nested: { x: [1, 2, 3], y: { z: true } } }

export default {
  name: 'deep clone',
  cases: {
    structuredClone: () => structuredClone(data),
    'JSON round-trip': () => JSON.parse(JSON.stringify(data)),
  },
  // Baked-in defaults (any CLI flag overrides): median of 5 runs.
  options: { rounds: 5 },
} satisfies BenchConfig
