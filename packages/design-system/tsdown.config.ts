import { readdirSync } from 'node:fs'
import { defineConfig } from 'tsdown'

// One entry per component/token folder so the `"./*"` publishConfig wildcard
// resolves every subpath to its own dist file. `utils/test` story helpers and
// `__mocks__` are dev-only and never built.
const folderEntries = Object.fromEntries(
  readdirSync('src', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [entry.name, `src/${entry.name}/index.ts`])
)

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    themes: 'src/themes.ts',
    globalStyles: 'src/globalStyles.ts',
    'utils/styleCache': 'src/utils/styleCache.ts',
    'hooks/useThemeMode': 'src/hooks/useThemeMode.ts',
    'hooks/useCopyToClipboard': 'src/hooks/useCopyToClipboard.ts',
    ...folderEntries,
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
