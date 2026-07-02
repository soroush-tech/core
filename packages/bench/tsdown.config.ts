import { defineConfig } from 'tsdown'

export default defineConfig([
  // The importable library API: dual ESM/CJS with declarations.
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
  },
  // The executable entrypoints: ESM-only (run by node/tsx), no declarations.
  // Kept separate because the harness uses top-level await, which CJS forbids.
  // mitata is bundled in (noExternal) so the in-container harness needs no
  // runtime module resolution for it — ESM `import` ignores NODE_PATH, so a
  // global install would not be found.
  {
    entry: { bin: 'src/bin.ts', harness: 'src/harness.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    noExternal: ['mitata'],
  },
])
