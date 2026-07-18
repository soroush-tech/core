// Type-level test: the markdown package's `theme.components` slots must reach
// consumers through the PUBLISHED d.ts. Runs via `pnpm test:types` (builds dist
// first, then typechecks this isolated program). Guards that importing the
// package barrel pulls in the `declare module '@emotion/react'` augmentation —
// i.e. it survives tsdown's d.ts chunking — so `theme.components.MarkdownPreview`
// and friends type-check for npm consumers.
import '@soroush.tech/markdown'
import type { Theme, ThemeComponents } from '@emotion/react'

// The three slots the package registers resolve to configurable component slots.
export const editor: ThemeComponents['MarkdownEditor'] = {
  styleOverrides: { root: { padding: 8 } },
}
export const preview: ThemeComponents['MarkdownPreview'] = {
  styleOverrides: { root: { lineHeight: 1.6 } },
}
export const toolbar: ThemeComponents['MarkdownToolbar'] = {
  styleOverrides: {
    root: { gap: 4 },
    strike: { textDecoration: 'line-through' },
    tablePickerCell: { cursor: 'pointer' },
  },
}

// A slot the toolbar never declared still errors.
export const bogus: ThemeComponents['MarkdownToolbar'] = {
  // @ts-expect-error -- 'bogusSlot' is not a MarkdownToolbar slot
  styleOverrides: { bogusSlot: { color: 'red' } },
}

// `theme.mermaid` accepts both the named variables and any other mermaid one.
export const mermaid: Theme['mermaid'] = {
  primaryColor: '#BB2528',
  lineColor: '#F8B229',
  quadrant1Fill: '#101418',
}
