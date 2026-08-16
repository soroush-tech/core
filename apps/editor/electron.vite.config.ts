import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Coverage e2e runs map V8 coverage on the built bundles back to src/** -
// inline sourcemaps keep the mapping inside the files monocart reads.
const sourcemap = process.env.E2E_COVERAGE === 'true' ? ('inline' as const) : false

export default defineConfig({
  main: {
    build: { sourcemap },
  },
  preload: {
    build: {
      rollupOptions: {
        // Sandboxed preload scripts cannot be ESM, so force a CJS bundle.
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: {
    plugins: [react()],
    build: { sourcemap },
  },
})
