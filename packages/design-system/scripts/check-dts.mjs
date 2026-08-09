// Fails when a built declaration file references a name the emitted types never declare.
//
//   pnpm check:dts     (run by `test:types`, after the build)
//
// tsdown flattens the barrel into a `declare namespace index_d_exports { … }` whenever a
// component's public props reach for something through it. A namespace cannot carry the
// barrel's `export * from '@soroush.tech/styled-system'` (nor `export type *`), so any name
// arriving only through that star is referenced but never declared. Consumers compile with
// `skipLibCheck`, which turns the dangling reference into `any` instead of an error: style
// props silently vanish from a component's props, and a `Pick<LayoutProps, …>` of them turns
// required. That shipped in 1.2.0 and 1.3.0.
//
// Components import those types straight from `@soroush.tech/styled-system` now, which leaves
// nothing to route through the namespace. This check keeps it that way without anyone tracking
// what styled-system exports: it re-derives the answer from the build every time.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const files = readdirSync(distDir).filter((file) => /\.d\.[cm]ts$/.test(file))

const sources = new Map(files.map((file) => [file, readFileSync(join(distDir, file), 'utf8')]))

// Each declaration file is its own module, so a namespace is only in scope where it is declared
// or imported — two files declaring the same name are unrelated. Keep both maps per file rather
// than merging them build-wide, which would let one file's declaration satisfy another's
// reference.
/** Per file: the names each `declare namespace` block in it declares, keyed by namespace. */
const declaredIn = new Map()
/** Per file: the sibling modules it imports, where a namespace it uses may be declared. */
const importsOf = new Map()

for (const [file, source] of sources) {
  const namespaces = new Map()
  for (const [, namespace, body] of source.matchAll(/declare namespace (\w+) \{([^}]*)\}/g)) {
    // `export { A$1 as A, B }` — the exported name is the last token of each entry.
    const names = body
      .split(',')
      .map((entry) => entry.trim().split(/\s+/).pop())
      .filter(Boolean)
    namespaces.set(namespace, new Set([...(namespaces.get(namespace) ?? []), ...names]))
  }
  declaredIn.set(file, namespaces)
  importsOf.set(
    file,
    [...source.matchAll(/from "\.\/([^"]+)"/g)].map(([, specifier]) => specifier)
  )
}

/** The declaration file an import specifier resolves to: `./index-A.mjs` → `index-A.d.mts`. */
const declarationsFor = (specifier) => {
  const base = specifier.replace(/\.[cm]?js$/, '')
  return [`${base}.d.mts`, `${base}.d.cts`].filter((candidate) => declaredIn.has(candidate))
}

const dangling = new Set()
for (const [file, source] of sources) {
  const scope = [file, ...importsOf.get(file).flatMap(declarationsFor)]
  // Match every `a.b` and filter after: pinning the suffix inside the pattern would make the
  // preceding `\w+` backtrack at each position, since `_` is a word character itself.
  for (const [, namespace, name] of source.matchAll(/([\w$]+)\.([\w$]+)/g)) {
    if (!namespace.endsWith('_d_exports')) continue
    const inScope = scope.some((candidate) => declaredIn.get(candidate)?.get(namespace)?.has(name))
    if (!inScope) dangling.add(`${file}: ${namespace}.${name}`)
  }
}

if (dangling.size > 0) {
  console.error('Declaration files reference names the build never declares:')
  for (const reference of [...dangling].sort((a, b) => a.localeCompare(b))) {
    console.error(`  - ${reference}`)
  }
  console.error(
    '\nThese resolve to `any` for consumers instead of erroring. Import the type straight from\n' +
      'the package that declares it rather than through the barrel, then rebuild.'
  )
  process.exit(1)
}

console.log(`No dangling declaration references in ${files.length} files.`)
