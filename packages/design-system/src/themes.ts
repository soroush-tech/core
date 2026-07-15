import type { ElementType } from 'react'
import type {
  CSSObject,
  Theme,
  ThemeIconSizes,
  ThemePalette,
  ThemeSizes,
  ThemeSpace,
  ThemeTypographyVariants,
} from '@emotion/react'
import { spacing, generateBoxShadow, alpha } from './utils'

// ---------------------------------------------------------------------------
// Theme type layer — declared INSIDE emotion's module so consumers can extend
// every scale by declaration merging:
//
//   declare module '@emotion/react' {
//     interface ThemePalette { brand: PaletteEntry }   // new palette color
//     interface ThemeBackground { tertiary: string }   // new background token
//     interface Theme { elevations: Record<string, string> }  // whole new scale
//   }
//
// `@emotion/react` is the augmentation surface (not this file's specifier)
// because the published d.ts is chunk-bundled — only an external, stable module
// merges reliably for both monorepo-source and npm consumers. Every component
// prop union derives via `keyof Theme['scale']`, so augmented keys propagate
// to component props automatically. New scale interfaces and their entry types
// must be declared inside this block so member identity stays stable across
// d.ts chunks.
// ---------------------------------------------------------------------------
declare module '@emotion/react' {
  /**
   * Re-opens a named scale interface as an anonymous mapped type. Named
   * interfaces have no implicit index signature, which styled-system's
   * Record-based `Theme` constraint requires — the mapped copy restores it
   * while keeping the literal keys (and any consumer-augmented keys).
   */
  export type OpenScale<T> = { [K in keyof T]: T[K] }

  /** One semantic color of `theme.palette`. */
  export interface PaletteEntry {
    main: string
    light: string
    dark: string
    contrastText: string
  }
  export interface ThemePalette {
    default: PaletteEntry
    primary: PaletteEntry
    secondary: PaletteEntry
    success: PaletteEntry
    error: PaletteEntry
    info: PaletteEntry
    warning: PaletteEntry
  }
  export interface ThemeText {
    inherit: string
    initial: string
    primary: string
    secondary: string
    disabled: string
    error: string
    success: string
    info: string
    warning: string
  }
  export interface ThemeBackground {
    backdrop: string
    /** App bar / sticky header surface. Light in light theme; `backdrop` stays dark for scrims. */
    appBar: string
    glass: string
    modal: string
    default: string
    primary: string
    secondary?: string
    paper: string
    terminal: string
    grid: string
    transparent: string
  }
  export interface ThemeBorder {
    default?: string
    light?: string
    primary: string
    dark?: string
  }
  /**
   * Syntax-highlighting colors for fenced code blocks — mapped onto highlight.js
   * token classes in `Markdown`'s code block. Values differ per theme so blocks
   * stay legible on the `background.terminal` surface in both light and dark.
   */
  export interface ThemeSyntax {
    /** Default code text — plain identifiers, operators, punctuation. */
    base: string
    /** Keywords, built-ins, types, literals, selector tags. */
    keyword: string
    /** Strings, template literals, regular expressions. */
    string: string
    /** Numbers, symbols, links. */
    number: string
    /** Function / class titles, section headings, attributes. */
    title: string
    /** Fields, constants, and property keys. */
    constant: string
    /** Type and class names. */
    type: string
    /** Comments and quotes — rendered dimmed and italic. */
    comment: string
    /** Markup tags/names, meta, variables, deletions. */
    tag: string
  }
  export interface ThemeFonts {
    body: string
    heading: string
    mono: string
  }
  /** Skeleton placeholder tokens. `highlight` is the wave-animation shimmer band. */
  export interface ThemeSkeleton {
    highlight: string
  }
  /** Switch control tokens. The thumb stays light in both modes so it reads on any track. */
  export interface ThemeSwitch {
    /** Thumb fill. Its elevation shadow composites from `theme.shadow.color`. */
    thumb: string
  }
  /**
   * Shadow tokens — the single base color every shadow composites from
   * (the `theme.shadows` elevation array and component shadows alike).
   */
  export interface ThemeShadow {
    /** Opaque base color of all shadows. */
    color: string
    /** Alpha applied per elevation step in the default `theme.shadows` array. */
    opacity: number
  }
  /** Stacking order for layered UI — ascending: appBar < drawer < modal. */
  export interface ThemeZOrder {
    appBar: number
    drawer: number
    modal: number
  }
  export interface ThemeRadii {
    sq: string
    sm: string
    md: string
    lg: string
  }
  export interface ThemeBorderWidths {
    none: string
    thin: string
    base: string
    thick: string
  }
  export interface ThemeAvatarSizes {
    sm: string
    md: string
    lg: string
    xl: string
  }
  export interface ThemeFontWeights {
    thin: number
    extraLight: number
    light: number
    normal: number
    medium: number
    semiBold: number
    bold: number
    extraBold: number
    black: number
  }
  export interface ThemeLineHeights {
    none: number
    tight: number
    snug: number
    base: number
    relaxed: number
    loose: number
  }
  export interface ThemeLetterSpacings {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
  export interface ThemeSpace {
    auto: string
    0: number | string
    0.5: number | string
    1: number | string
    1.5: number | string
    2: number | string
    3: number | string
    4: number | string
    5: number | string
    6: number | string
    7: number | string
    8: number | string
    9: number | string
    10: number | string
  }
  /** One padding/font preset of `theme.sizes`. */
  export interface SizeEntry {
    paddingTop: Exclude<keyof ThemeSpace, 'auto'>
    paddingBottom: Exclude<keyof ThemeSpace, 'auto'>
    paddingLeft: Exclude<keyof ThemeSpace, 'auto'>
    paddingRight: Exclude<keyof ThemeSpace, 'auto'>
    /** Index into `theme.fontSizes`. */
    fontSize: number
  }
  export interface ThemeSizes {
    sm: SizeEntry
    md: SizeEntry
    lg: SizeEntry
  }
  /**
   * Square glyph dimension per density key — Icon token sizes and the
   * Checkbox/Radio glyphs. Mapped over `ThemeSizes` so augmenting a size key
   * forces the matching icon size to be supplied.
   */
  export type ThemeIconSizes = { [K in keyof ThemeSizes]: string }
  /** Style of one typography variant. */
  export interface TypographyVariantStyle {
    element: ElementType
    fontSize?: number
    fontWeight?: string
    letterSpacing?: string
    textTransform?: CSSObject['textTransform']
  }
  export interface ThemeTypographyVariants {
    h1: TypographyVariantStyle
    h2: TypographyVariantStyle
    h3: TypographyVariantStyle
    h4: TypographyVariantStyle
    h5: TypographyVariantStyle
    h6: TypographyVariantStyle
    subtitle1: TypographyVariantStyle
    subtitle2: TypographyVariantStyle
    body1: TypographyVariantStyle
    body2: TypographyVariantStyle
    caption: TypographyVariantStyle
    overline: TypographyVariantStyle
    button: TypographyVariantStyle
    inherit: TypographyVariantStyle
  }
  /**
   * Optional theme-driven component defaults. Components carry their own
   * literal fallbacks (`size = 'md'`, `variant = 'outside'`, …) and resolve
   * them through `themeDefault(theme, key, fallback)` — set any key here (or
   * via `ThemeProvider`'s `defaults` prop) to override that fallback globally,
   * e.g. when your theme uses entirely different size or palette keys.
   */
  export interface ThemeDefaults {
    /** Density token for sized components. Fallback: `'md'`. */
    size?: keyof ThemeSizes
    /** Compact density for dense secondary UI (table pagination actions). Fallback: `'sm'`. */
    compactSize?: keyof ThemeSizes
    /** Accent palette color (buttons, links, progress, pagination…). Fallback: `'primary'`. */
    color?: keyof ThemePalette
    /** Neutral palette color for toggle controls (checkbox, radio, switch…). Fallback: `'default'`. */
    neutralColor?: keyof ThemePalette
    /** Body text color. Fallback: `'initial'`. */
    textColor?: keyof ThemeText
    /** Accent text color (icons, input labels). Fallback: `'primary'`. */
    accentTextColor?: keyof ThemeText
    /** General control background (switch track). Fallback: `'default'`. */
    bg?: keyof ThemeBackground
    /** Elevated surface background (paper, cards). Fallback: `'paper'`. */
    surfaceBg?: keyof ThemeBackground
    /** Input surface background (selects, text inputs). Fallback: `'terminal'`. */
    inputBg?: keyof ThemeBackground
    /** Corner radius for grouped controls. Fallback: `'md'`. */
    borderRadius?: keyof ThemeRadii
    /** Corner radius for surfaces. Fallback: `'sq'`. */
    surfaceRadius?: keyof ThemeRadii
    /** Avatar size step. Fallback: `'md'`. */
    avatarSize?: keyof ThemeAvatarSizes
    /** Icon glyph size step. Fallback: `'lg'`. */
    iconSize?: keyof ThemeIconSizes
    /** Border/ring color. Fallback: `'primary'`. */
    borderColor?: keyof ThemeBorder
    /** Border/ring width. Fallback: `'thin'`. */
    borderWidth?: keyof ThemeBorderWidths
    /** Button visual variant. Fallback: `'contained'`. */
    buttonVariant?: keyof ButtonVariants
    /** Switch thumb/track layout. Fallback: `'outside'`. */
    switchVariant?: 'outside' | 'inside'
    /** Input frame style (TextInput, Select, NativeSelect). Fallback: `'default'`. */
    inputVariant?: 'default' | 'outlined' | 'text' | 'underline'
    /** Avatar shape. Fallback: `'circular'`. */
    avatarVariant?: 'circular' | 'rounded' | 'square'
    /** Link underline behavior. Fallback: `'always'`. */
    linkUnderline?: 'always' | 'hover' | 'none'
    /** Card surface treatment. Fallback: `'paper'`. */
    cardVariant?: 'paper' | 'bracketBox' | 'interactive'
    /** Pagination item visual variant. Fallback: `'text'`. */
    paginationVariant?: 'text' | 'outlined'
    /** Pagination item shape. Fallback: `'circular'`. */
    paginationShape?: 'circular' | 'rounded'
  }
  /**
   * A style contributed from `theme.components` — a plain CSS object, or a
   * callback receiving the theme and the styled root's resolved props
   * (`ownerState`) for conditional styling.
   */
  export type ComponentStyle<OwnerState> =
    CSSObject | ((args: { theme: Theme; ownerState: OwnerState }) => CSSObject)

  /** One theme-contributed variant: applied when every key in `props` matches the render props. */
  export interface ComponentVariant<OwnerState> {
    props: Partial<OwnerState>
    style: ComponentStyle<OwnerState>
  }

  /** Per-component customization: default prop values, per-slot CSS, extra variants. */
  export interface ComponentConfig<
    OwnerState = Record<string, unknown>,
    Slot extends string = 'root',
  > {
    /** Default prop values — explicit props and group context always win. */
    defaultProps?: Partial<OwnerState>
    /** Per-slot CSS merged after the component's own styles (theme wins). */
    styleOverrides?: Partial<Record<Slot, ComponentStyle<OwnerState>>>
    /** Extra variants matched by props. Replaced wholesale by `createTheme`, never merged. */
    variants?: ReadonlyArray<ComponentVariant<OwnerState>>
  }

  /** Button's variant values — augment to register new ones (then style them via `variants`). */
  export interface ButtonVariants {
    contained: true
    outlined: true
    text: true
  }

  /** The resolved props Button's styled roots receive — what `ownerState` exposes. */
  export interface ButtonOwnerState {
    variant?: keyof ButtonVariants
    color?: keyof ThemePalette
    size?: keyof ThemeSizes
    shape?: 'square' | 'rounded' | 'pill'
    fullWidth?: boolean
    disabled?: boolean
  }

  /** Token-typed Typography props a theme may set for Card's title/caption slots. */
  export interface CardSlotTypographyProps {
    variant?: keyof ThemeTypographyVariants
    color?: keyof ThemeText
    fontFamily?: keyof ThemeFonts
    mb?: keyof ThemeSpace
  }

  /** Token-typed Icon props a theme may set for Card's icon slot. */
  export interface CardSlotIconProps {
    color?: keyof ThemeText
    size?: string | number
  }

  /** Card's resolved props / theme-settable defaults. */
  export interface CardOwnerState {
    variant?: 'paper' | 'bracketBox' | 'interactive'
    /** Merged under any per-instance `titleProps` (instance wins). */
    titleProps?: CardSlotTypographyProps
    /** Merged under any per-instance `captionProps` (instance wins). */
    captionProps?: CardSlotTypographyProps
    /** Merged under any per-instance `iconProps` (instance wins). */
    iconProps?: CardSlotIconProps
  }

  /**
   * Per-component theme customization, keyed by component name. Augment this
   * interface to register additional components (including your own, when their
   * styled roots are created with this package's `styled(tag, { name })`).
   */
  export interface ThemeComponents {
    AppBar?: ComponentConfig
    Avatar?: ComponentConfig<Record<string, unknown>, 'root' | 'img'>
    Backdrop?: ComponentConfig
    Button?: ComponentConfig<ButtonOwnerState, 'root' | 'label' | 'icon' | 'loader'>
    ButtonGroup?: ComponentConfig
    Card?: ComponentConfig<CardOwnerState, 'root' | 'title' | 'caption' | 'icon'>
    Checkbox?: ComponentConfig<Record<string, unknown>, 'root' | 'input' | 'icon'>
    CircularProgress?: ComponentConfig<Record<string, unknown>, 'root' | 'track' | 'circle'>
    CodeBlock?: ComponentConfig<Record<string, unknown>, 'root' | 'surface'>
    Drawer?: ComponentConfig
    Flex?: ComponentConfig
    FocusTrap?: ComponentConfig
    Form?: ComponentConfig
    FormControl?: ComponentConfig
    FormHelperText?: ComponentConfig
    FormLabel?: ComponentConfig
    Grid?: ComponentConfig
    Icon?: ComponentConfig
    Image?: ComponentConfig
    LinearProgress?: ComponentConfig<
      Record<string, unknown>,
      'root' | 'track' | 'dash' | 'bar' | 'traveler' | 'segment' | 'secondaryBar'
    >
    Link?: ComponentConfig
    MarkdownEditor?: ComponentConfig
    MarkdownPreview?: ComponentConfig
    MarkdownToolbar?: ComponentConfig<
      Record<string, unknown>,
      'root' | 'strike' | 'tablePickerCell'
    >
    MenuItem?: ComponentConfig<Record<string, unknown>, 'root' | 'check'>
    Modal?: ComponentConfig
    NativeSelect?: ComponentConfig<Record<string, unknown>, 'root' | 'select' | 'icon'>
    Pagination?: ComponentConfig<Record<string, unknown>, 'root' | 'list'>
    PaginationItem?: ComponentConfig<Record<string, unknown>, 'root' | 'ellipsis'>
    Paper?: ComponentConfig
    Popover?: ComponentConfig<Record<string, unknown>, 'root' | 'positioner'>
    Quote?: ComponentConfig
    Radio?: ComponentConfig<Record<string, unknown>, 'root' | 'input' | 'icon'>
    Select?: ComponentConfig<
      Record<string, unknown>,
      'root' | 'value' | 'valueArea' | 'valueGhost' | 'listbox'
    >
    Skeleton?: ComponentConfig<Record<string, unknown>, 'root' | 'content'>
    Switch?: ComponentConfig<Record<string, unknown>, 'root' | 'input' | 'track' | 'thumb'>
    Table?: ComponentConfig
    TableBody?: ComponentConfig
    TableCell?: ComponentConfig
    TableContainer?: ComponentConfig
    TableFooter?: ComponentConfig
    TableHead?: ComponentConfig
    TablePagination?: ComponentConfig
    TablePaginationActions?: ComponentConfig
    TableRow?: ComponentConfig
    TableSortLabel?: ComponentConfig<Record<string, unknown>, 'root' | 'icon'>
    TextInput?: ComponentConfig<Record<string, unknown>, 'root' | 'input'>
    ToggleButton?: ComponentConfig
    ToggleButtonGroup?: ComponentConfig
    Typography?: ComponentConfig
    View?: ComponentConfig
  }

  export interface Theme {
    name: string
    /** Optional overrides for component default token/variant keys — see `ThemeDefaults`. */
    defaults?: OpenScale<ThemeDefaults>
    /** Optional per-component customization — see `ThemeComponents`. */
    components?: OpenScale<ThemeComponents>
    space: OpenScale<ThemeSpace>
    border: OpenScale<ThemeBorder>
    text: OpenScale<ThemeText>
    background: OpenScale<ThemeBackground>
    typography: OpenScale<ThemeTypographyVariants>
    fonts: OpenScale<ThemeFonts>
    lineHeights: OpenScale<ThemeLineHeights>
    letterSpacings: OpenScale<ThemeLetterSpacings>
    fontSizes: number[]
    radii: OpenScale<ThemeRadii>
    borderWidths: OpenScale<ThemeBorderWidths>
    avatar: OpenScale<ThemeAvatarSizes>
    icon: ThemeIconSizes
    skeleton: OpenScale<ThemeSkeleton>
    switch: OpenScale<ThemeSwitch>
    shadow: OpenScale<ThemeShadow>
    syntax: OpenScale<ThemeSyntax>
    sizes: { [K in keyof ThemeSizes]: OpenScale<ThemeSizes[K]> }
    colorScheme: 'light' | 'dark'
    blur: string
    logoFilter: string
    /** mix-blend-mode for the AboutHero portrait — screen on dark, multiply on light. */
    portraitBlend: string
    /** opacity for the AboutHero portrait. */
    portraitOpacity: number
    shadows: string[]
    fontWeights: OpenScale<ThemeFontWeights>
    palette: OpenScale<ThemePalette>
    zOrder: OpenScale<ThemeZOrder>
  }
}

// Ergonomic re-exports so consumers import the theme types from this package
// rather than from '@emotion/react' directly.
export type {
  Theme,
  ThemeDefaults,
  ThemeComponents,
  ComponentConfig,
  ComponentStyle,
  ComponentVariant,
  ButtonVariants,
  ButtonOwnerState,
  CardOwnerState,
  CardSlotTypographyProps,
  CardSlotIconProps,
  PaletteEntry,
  ThemePalette,
  ThemeText,
  ThemeBackground,
  ThemeBorder,
  ThemeSyntax,
  ThemeFonts,
  ThemeSkeleton,
  ThemeSwitch,
  ThemeShadow,
  ThemeZOrder,
  ThemeRadii,
  ThemeBorderWidths,
  ThemeAvatarSizes,
  ThemeIconSizes,
  ThemeFontWeights,
  ThemeLineHeights,
  ThemeLetterSpacings,
  ThemeSpace,
  SizeEntry,
  ThemeSizes,
  TypographyVariantStyle,
  ThemeTypographyVariants,
} from '@emotion/react'

export { createTheme, type ThemeOverride, type DeepPartial } from './utils/createTheme'

/** The semantic color keys of `theme.palette`. */
export type PaletteColor = keyof ThemePalette

/** The variant keys of `theme.typography`. */
export type TypographyVariant = keyof ThemeTypographyVariants

// One base color for every shadow — the elevation array and component shadows
// (e.g. the Switch thumb) all composite from `shadow.color`.
const shadow = { color: '#000000', opacity: 0.4 }

const shadows = Array.from({ length: 25 }, (_, elevation) =>
  generateBoxShadow(elevation, alpha(shadow.color, shadow.opacity))
)
export const radii = {
  sq: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
}

export const borderWidths = {
  none: '0',
  thin: '1px',
  base: '2px',
  thick: '4px',
}

// Stacking order for layered UI. Ascending so overlays sit above the sticky header.
export const zOrder = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
}

export const fontSizes = [12, 14, 16, 20, 24, 32, 48]

export const lineHeights = {
  none: 1,
  tight: 1.2,
  snug: 1.35,
  base: 1.5,
  relaxed: 1.625,
  loose: 2,
}

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.2em',
}

export const fonts = {
  // 'X Variable' is the @fontsource-variable family name — the consumer's global styles load
  // the font files; the plain name is a fallback for local installs, then the generic family.
  body: "'Space Grotesk Variable', 'Space Grotesk', sans-serif",
  heading: "'Space Grotesk Variable', 'Space Grotesk', sans-serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
}

export const fontWeights = {
  thin: 100,
  extraLight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
}
export const avatar = {
  sm: spacing(4),
  md: spacing(5),
  lg: spacing(6),
  xl: spacing(7),
}
// 16/20/24px at the default 16px root.
export const icon: ThemeIconSizes = {
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
}
export const sizes: ThemeSizes = {
  sm: { paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 1.5, paddingRight: 1.5, fontSize: 0 },
  md: { paddingTop: 1, paddingBottom: 1, paddingLeft: 2, paddingRight: 2, fontSize: 1 },
  lg: { paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 3, paddingRight: 3, fontSize: 1 },
}
export const space: ThemeSpace = {
  0: 0,
  0.5: spacing(0.5),
  1: spacing(1),
  1.5: spacing(1.5),
  2: spacing(2),
  3: spacing(3),
  4: spacing(4),
  5: spacing(5),
  6: spacing(6),
  7: spacing(7),
  8: spacing(8),
  9: spacing(9),
  10: spacing(10),
  auto: 'auto',
}

export const typography: ThemeTypographyVariants = {
  h1: { element: 'h1', fontSize: 6, fontWeight: 'bold' },
  h2: { element: 'h2', fontSize: 5, fontWeight: 'bold' },
  h3: { element: 'h3', fontSize: 4, fontWeight: 'bold' },
  h4: { element: 'h4', fontSize: 3, fontWeight: 'bold' },
  h5: { element: 'h5', fontSize: 2, fontWeight: 'bold' },
  h6: { element: 'h6', fontSize: 1, fontWeight: 'semiBold' },
  subtitle1: { element: 'h6', fontSize: 2, fontWeight: 'medium' },
  subtitle2: { element: 'h6', fontSize: 1, fontWeight: 'medium' },
  body1: { element: 'p', fontSize: 2, fontWeight: 'normal' },
  body2: { element: 'p', fontSize: 1, fontWeight: 'normal' },
  caption: { element: 'span', fontSize: 0, fontWeight: 'normal' },
  overline: {
    element: 'span',
    fontSize: 0,
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: 'wider',
  },
  button: {
    element: 'span',
    fontSize: 1,
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: 'wide',
  },
  inherit: {
    element: 'span',
  },
}

/**
 * The package's complete default theme (dark-schemed). Raw hex only — palettes
 * belong to the consumer, who builds brand themes with `createTheme(baseTheme, …)`.
 */
export const baseTheme: Theme = {
  name: 'base',
  // The thumb stays light on any track color.
  switch: { thumb: '#FFFFFF' },
  radii,
  borderWidths,
  fontSizes,
  lineHeights,
  typography,
  letterSpacings,
  fontWeights,
  fonts,
  avatar,
  icon,
  sizes,
  space,
  zOrder,
  blur: '12px',
  colorScheme: 'dark',
  palette: {
    default: {
      main: '#262626',
      light: '#363636',
      dark: '#0E0E0E',
      contrastText: '#F2F3F4',
    },
    primary: {
      main: '#00FC40',
      light: '#9CFF93',
      dark: '#006413',
      contrastText: '#000000',
    },
    secondary: {
      main: '#b3eeb1',
      light: '#d4f9d2',
      dark: '#5acc57',
      contrastText: '#000000',
    },
    success: {
      main: '#009928',
      light: '#00FC40',
      dark: '#006413',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF3B30',
      light: '#FF9590',
      dark: '#E0251A',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#00B8D9',
      light: '#33D9FF',
      dark: '#0099CC',
      contrastText: '#000000',
    },
    warning: {
      main: '#FFD930',
      light: '#FFF0A0',
      dark: '#CCA800',
      contrastText: '#000000',
    },
  },
  background: {
    backdrop: '#000000B3',
    appBar: '#000000B3',
    glass: '#0000004D',
    modal: '#131313',
    default: '#262626',
    primary: '#0E0E0E',
    secondary: '#1A1A1A',
    paper: '#131313',
    terminal: '#000000',
    grid: alpha('#00FC40', 0.06),
    transparent: '#00000000',
  },
  text: {
    inherit: 'inherit',
    initial: '#FFFFFF',
    primary: '#00FC40',
    secondary: '#9C9C9C',
    disabled: '#363636',
    error: '#D70015',
    success: '#009928',
    info: '#00B8D9',
    warning: '#8C6D00',
  },
  border: {
    default: '#262626',
    light: alpha('#E8FFE5', 0.1),
    primary: '#00FC40',
    dark: '#006413',
  },
  skeleton: {
    highlight: alpha('#363636', 0.65),
  },
  // Matched to the JetBrains "Islands Dark" editor scheme.
  syntax: {
    base: '#BBBBBB', // ≈ Islands text #bcbec4
    keyword: '#CF8E6D', // = Islands keyword #cf8e6d
    string: '#6AAB73', // = Islands string #6aab73
    number: '#2AACB8', // = Islands number #2aacb8
    title: '#6BA9FA', // ≈ Islands function #56a8f5
    constant: '#C77DBB', // = Islands field/constant #c77dbb
    type: '#2AACB8', // ≈ Islands type #16baac
    comment: '#919191', // ≈ Islands comment #7a7e85
    tag: '#D5B778', // = Islands markup tag #d5b778
  },
  logoFilter: 'brightness(0) invert(1)',
  portraitBlend: 'screen',
  portraitOpacity: 0.8,
  shadow,
  shadows,
}
