/**
 * Local oxlint plugin: ban file extensions in static import paths.
 *
 * oxlint has no `no-restricted-syntax`, which is how this ban used to be spelled,
 * so the rule is expressed directly instead. Only `ImportDeclaration` is visited,
 * which deliberately leaves dynamic `import()` calls alone - the codegen scripts
 * use those with an explicit `.ts` so node's native TS runner can resolve them.
 */
const EXTENSION = /\.(?:ts|tsx|js|jsx)$/

/** @type {import('oxlint').Plugin} */
const plugin = {
  meta: { name: 'local' },
  rules: {
    'no-import-extensions': {
      create(context) {
        return {
          ImportDeclaration(node) {
            if (EXTENSION.test(node.source.value)) {
              context.report({
                node: node.source,
                message: 'Do not include .ts, .tsx, .js or .jsx extensions in import paths.',
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
