import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

// Guards the hand-written subpath export map against drift: every component folder
// (src/<Name>/index.ts) must be exported as its own explicit subpath in both `exports`
// (source) and `publishConfig.exports` (published dist), and no component-shaped entry
// may point at a folder that no longer exists. `utils` and `hooks` are non-component
// folders with their own hand-managed subpaths, so they are excluded here.
const srcDir = join(process.cwd(), 'src')
const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))

const NON_COMPONENT_FOLDERS = new Set(['utils', 'hooks'])

const componentFolders = readdirSync(srcDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !NON_COMPONENT_FOLDERS.has(entry.name))
  .filter((entry) => existsSync(join(srcDir, entry.name, 'index.ts')))
  .map((entry) => entry.name)
  .sort()

const distEntry = (base: string) => ({
  import: { types: `./dist/${base}.d.mts`, default: `./dist/${base}.mjs` },
  require: { types: `./dist/${base}.d.cts`, default: `./dist/${base}.cjs` },
})

describe('package subpath exports', () => {
  it('exposes no wildcard subpath — every entry is explicit', () => {
    expect(pkg.exports['./*']).toBeUndefined()
    expect(pkg.publishConfig.exports['./*']).toBeUndefined()
  })

  it.each(componentFolders)('exports ./%s as source and dist subpaths', (name) => {
    expect(pkg.exports[`./${name}`]).toBe(`./src/${name}/index.ts`)
    expect(pkg.publishConfig.exports[`./${name}`]).toEqual(distEntry(name))
  })

  it('has no component-shaped export pointing at a missing folder', () => {
    const known = new Set(componentFolders.map((name) => `./${name}`))
    const stale = Object.keys(pkg.exports).filter(
      (key) => /^\.\/[A-Z]/.test(key) && !known.has(key)
    )
    expect(stale).toEqual([])
  })
})
