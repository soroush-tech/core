export * from './Control'
export * from './Toolbar'
export * from './Editor'
export * from './Preview'
export * from './MarkdownContext'

// This package renders through design-system's `styled` engine, so its named roots
// (`MarkdownEditor`, `MarkdownPreview`, `MarkdownToolbar`) resolve `theme.components`
// at runtime. Registering the slots here — on the external `@emotion/react` module,
// the only augmentation surface that merges reliably across tsdown's d.ts chunks —
// lets consumers type `theme.components.MarkdownPreview = { … }`. `ComponentConfig` is
// pulled in via an inline `import(...)` type (no top-level import) so nothing reads as
// unused under the app's `noUnusedLocals`, which ignores usage inside `declare module`.
declare module '@emotion/react' {
  interface ThemeComponents {
    MarkdownEditor?: import('@soroush.tech/design-system/themes').ComponentConfig
    MarkdownPreview?: import('@soroush.tech/design-system/themes').ComponentConfig
    MarkdownToolbar?: import('@soroush.tech/design-system/themes').ComponentConfig<
      Record<string, unknown>,
      'root' | 'strike' | 'tablePickerCell'
    >
  }
}
