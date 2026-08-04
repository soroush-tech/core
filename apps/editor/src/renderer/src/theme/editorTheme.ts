import { baseTheme, createTheme } from '@soroush.tech/design-system/theme'
import type { Theme } from '@soroush.tech/design-system'
import { syntaxDark } from '@soroush.tech/markdown'

// The design-system baseTheme (dark) plus the matching CodeBlock syntax tokens —
// `theme.syntax` has no runtime fallback, so any theme rendering markdown must merge one.
export const editorTheme: Theme = createTheme(baseTheme, { syntax: syntaxDark })
