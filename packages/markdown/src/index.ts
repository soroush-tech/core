import type { ThemeSyntax } from './CodeBlock/CodeBlock.data'

export * from './Control'
export * from './Toolbar'
export * from './Editor'
export * from './Preview'
export * from './CodeBlock'
export * from './Mermaid'
export * from './MarkdownContext'

/**
 * Per-theme overrides for the `Mermaid` renderer, merged over (and winning against) its default
 * mermaid `themeVariables`. Common variables are listed for autocomplete; any other mermaid theme
 * variable is accepted. Set via `theme.mermaid` (e.g. `createTheme(baseTheme, { mermaid: … })`).
 */
export interface MermaidThemeVariables {
  darkMode?: boolean
  background?: string
  fontFamily?: string
  fontSize?: string
  primaryColor?: string
  primaryTextColor?: string
  primaryBorderColor?: string
  secondaryColor?: string
  tertiaryColor?: string
  lineColor?: string
  textColor?: string
  mainBkg?: string
  noteBkgColor?: string
  noteTextColor?: string
  [variable: string]: string | number | boolean | undefined
}

// This package renders through design-system's `styled` engine, so its named roots
// (`MarkdownEditor`, `MarkdownPreview`, `MarkdownToolbar`, `CodeBlock`) resolve
// `theme.components` at runtime. Registering the slots here — on
// `@soroush.tech/design-system/theme`, the module that owns `Theme`/`ThemeComponents`
// and merges reliably across tsdown's d.ts chunks — lets consumers type
// `theme.components.MarkdownPreview = { … }`. `ComponentConfig` is pulled in via an
// inline `import(...)` type (no top-level import) so nothing reads as unused under the
// app's `noUnusedLocals`, which ignores usage inside `declare module`.
declare module '@soroush.tech/design-system/theme' {
  interface ThemeComponents {
    MarkdownEditor?: import('@soroush.tech/design-system/theme').ComponentConfig
    MarkdownPreview?: import('@soroush.tech/design-system/theme').ComponentConfig
    MarkdownToolbar?: import('@soroush.tech/design-system/theme').ComponentConfig<
      Record<string, unknown>,
      'root' | 'strike' | 'tablePickerCell'
    >
    CodeBlock?: import('@soroush.tech/design-system/theme').ComponentConfig<
      Record<string, unknown>,
      'root' | 'surface'
    >
  }
  interface Theme {
    /** Per-theme overrides for the `Mermaid` renderer's mermaid `themeVariables`. */
    mermaid?: MermaidThemeVariables
    /**
     * Syntax-highlighting tokens for `CodeBlock` — see `syntaxDark`/`syntaxLight`. Optional
     * only so `design-system`'s own `baseTheme` literal still satisfies `Theme` in this
     * monorepo's source-consuming builds; `CodeBlock` requires it in practice (no fallback).
     */
    syntax?: ThemeSyntax
  }
}
