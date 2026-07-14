import type { ElementType } from 'react'
import type { CSSObject } from '@emotion/react'
import type { TypographyVariant } from './Typography'
import { spacing, generateBoxShadow, alpha, type SpaceUnits } from './utils'
import {
  blackAlpha,
  carbonBlack,
  clayOrange,
  cyberCyan,
  deepCrimson,
  forestGreen,
  kineticGreen,
  kineticSurface,
  lightSurface,
  neonRed,
  neutral,
  orchidPurple,
  pineTeal,
  royalBlue,
  sageGreen,
  sandGold,
  softGreen,
  solarAmber,
} from './colors'

/** The semantic color keys of `theme.palette`. */
export type PaletteColor =
  'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'

export interface Theme {
  name: string
  space: {
    auto: string
  } & {
    [key in SpaceUnits]: number | string
  }
  border: {
    default?: string
    light?: string
    primary: string
    dark?: string
  }
  text: {
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
  background: {
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
  typography: Record<
    TypographyVariant,
    {
      element: ElementType
      fontSize?: number
      fontWeight?: string
      letterSpacing?: string
      textTransform?: CSSObject['textTransform']
    }
  >
  fonts: {
    body: string
    heading: string
    mono: string
  }
  lineHeights: Record<'none' | 'tight' | 'snug' | 'base' | 'relaxed' | 'loose', number>
  letterSpacings: Record<'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest', string>
  fontSizes: number[]
  radii: Record<'sq' | 'sm' | 'md' | 'lg', string>
  borderWidths: Record<'none' | 'thin' | 'base' | 'thick', string>
  avatar: Record<'sm' | 'md' | 'lg' | 'xl', string>
  /** Skeleton placeholder tokens. `highlight` is the wave-animation shimmer band. */
  skeleton: {
    highlight: string
  }
  /**
   * Syntax-highlighting colors for fenced code blocks — mapped onto highlight.js
   * token classes in `Markdown`'s code block. Values differ per theme so blocks
   * stay legible on the `background.terminal` surface in both light and dark.
   */
  syntax: {
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
  sizes: typeof sizes
  colorScheme: 'light' | 'dark'
  blur: string
  logoFilter: string
  /** mix-blend-mode for the AboutHero portrait — screen on dark, multiply on light. */
  portraitBlend: string
  /** opacity for the AboutHero portrait. */
  portraitOpacity: number
  shadows: string[]
  fontWeights: Record<
    | 'thin'
    | 'extraLight'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semiBold'
    | 'bold'
    | 'extraBold'
    | 'black',
    number
  >
  palette: Record<PaletteColor, { main: string; light: string; dark: string; contrastText: string }>
  /** Stacking order for layered UI — ascending: appBar < drawer < modal. */
  zOrder: {
    appBar: number
    drawer: number
    modal: number
  }
}

export type Light = typeof light
export type Dark = typeof dark

const lightShadows = Array.from({ length: 25 }, (_, elevation) =>
  generateBoxShadow(elevation, blackAlpha[100])
)

const darkShadows = Array.from({ length: 25 }, (_, elevation) =>
  generateBoxShadow(elevation, blackAlpha[400])
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
  // 'X Variable' is the self-hosted @fontsource-variable family; the plain name is a fallback
  // for anyone who has it installed locally, then the generic family.
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
export const sizes = {
  sm: { paddingTop: 0.5, paddingBottom: 0.5, paddingLeft: 1.5, paddingRight: 1.5, fontSize: 0 },
  md: { paddingTop: 1, paddingBottom: 1, paddingLeft: 2, paddingRight: 2, fontSize: 1 },
  lg: { paddingTop: 1.5, paddingBottom: 1.5, paddingLeft: 3, paddingRight: 3, fontSize: 1 },
} as const
export const space = {
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

export const typography: Theme['typography'] = {
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

const baseTheme = {
  name: 'base',
  spacing,
  radii,
  borderWidths,
  fontSizes,
  lineHeights,
  typography,
  letterSpacings,
  fontWeights,
  fonts,
  avatar,
  sizes,
  space,
  zOrder,
  blur: '12px',
  // get space() {
  //   return new Proxy(
  //     {},
  //     {
  //       get: (_, unit: SpaceUnits) => spacing(unit),
  //     }
  //   )
  // },
}

export const light: Theme = {
  ...baseTheme,
  name: 'light',
  colorScheme: 'light',
  palette: {
    default: {
      main: carbonBlack[500],
      light: carbonBlack[400],
      dark: carbonBlack[800],
      contrastText: lightSurface[950],
    },
    primary: {
      main: forestGreen[600], // #006e17
      light: forestGreen[400], // #37e449
      dark: forestGreen[700], // #00530f
      contrastText: lightSurface[100],
    },
    secondary: {
      main: softGreen[600], // #006e17
      light: softGreen[400], // #58ff60
      dark: softGreen[700], // #00530f
      contrastText: lightSurface[100],
    },
    success: {
      main: kineticGreen[700],
      light: kineticGreen[500],
      dark: kineticGreen[800],
      contrastText: kineticSurface[100],
    },
    error: {
      main: deepCrimson[600], // #ba1a1a
      light: deepCrimson[100], // #ffdad6
      dark: deepCrimson[700], // #93000a
      contrastText: lightSurface[100],
    },
    info: {
      main: cyberCyan[800],
      light: cyberCyan[600],
      dark: cyberCyan[900],
      contrastText: lightSurface[100],
    },
    warning: {
      main: solarAmber[500],
      light: solarAmber[400],
      dark: solarAmber[600],
      contrastText: lightSurface[950],
    },
  },
  background: {
    backdrop: blackAlpha[500],
    appBar: alpha(lightSurface[100], 0.8),
    glass: alpha(lightSurface[100], 0.3),
    modal: lightSurface[100],
    default: lightSurface[700],
    primary: lightSurface[400], // #f9f9f9
    secondary: lightSurface[600], // #eeeeee
    paper: lightSurface[300], // #f3f3f3
    terminal: lightSurface[600], // #e2e2e2
    grid: alpha(softGreen[600], 0.2),
    transparent: blackAlpha[0],
  },
  text: {
    inherit: 'inherit',
    initial: lightSurface[950], // #1a1c1c
    primary: forestGreen[500], // #1a1c1c
    secondary: lightSurface[900], // #444748
    disabled: alpha(lightSurface[950], 0.627),
    error: deepCrimson[600], // #ba1a1a
    success: kineticGreen[700],
    info: cyberCyan[700],
    warning: solarAmber[800],
  },
  border: {
    default: carbonBlack[200],
    light: alpha(forestGreen[500], 0.1),
    primary: forestGreen[600],
    dark: forestGreen[800],
  },
  skeleton: {
    highlight: alpha(lightSurface[100], 0.65),
  },
  // Matched to JetBrains "Light" editor scheme (Islands Light's editorScheme).
  syntax: {
    base: lightSurface[950], // #1a1c1c ≈ JB text #080808
    keyword: royalBlue[700], // #184E99 ≈ JB keyword #0033b3
    string: forestGreen[600], // #006e17 ≈ JB string #067d17
    number: royalBlue[500], // #2877E9 ≈ JB number #1750eb
    title: pineTeal[700], // #00627A = JB function #00627a
    constant: orchidPurple[700], // #871094 = JB field/constant #871094
    type: pineTeal[600], // #137B86 ≈ JB type #007e8a
    comment: lightSurface[850], // #747878 ≈ JB comment #8c8c8c
    tag: pineTeal[600], // #137B86 ≈ JB tag #008077
  },
  logoFilter: 'brightness(0)',
  portraitBlend: 'multiply',
  portraitOpacity: 1,
  shadows: lightShadows,
}

export const dark: Theme = {
  ...baseTheme,
  name: 'dark',
  colorScheme: 'dark',
  palette: {
    default: {
      main: kineticSurface[600],
      light: kineticSurface[500],
      dark: kineticSurface[900],
      contrastText: carbonBlack[100],
    },
    primary: {
      main: kineticGreen[500],
      light: kineticGreen[300],
      dark: kineticGreen[800],
      contrastText: carbonBlack[900],
    },
    secondary: {
      main: softGreen[400],
      light: softGreen[200],
      dark: softGreen[600],
      contrastText: carbonBlack[900],
    },
    success: {
      main: kineticGreen[700],
      light: kineticGreen[500],
      dark: kineticGreen[800],
      contrastText: kineticSurface[100],
    },
    error: {
      main: neonRed[500],
      light: neonRed[300],
      dark: neonRed[600],
      contrastText: kineticSurface[100],
    },
    info: {
      main: cyberCyan[600],
      light: cyberCyan[400],
      dark: cyberCyan[700],
      contrastText: carbonBlack[900],
    },
    warning: {
      main: solarAmber[400],
      light: solarAmber[200],
      dark: solarAmber[600],
      contrastText: carbonBlack[900],
    },
  },
  background: {
    backdrop: blackAlpha[700],
    appBar: blackAlpha[700],
    glass: blackAlpha[300],
    modal: kineticSurface[800],
    default: kineticSurface[600],
    primary: kineticSurface[900],
    secondary: kineticSurface[700],
    paper: kineticSurface[800],
    terminal: carbonBlack[900],
    grid: alpha(kineticGreen[500], 0.06),
    transparent: blackAlpha[0],
  },
  text: {
    inherit: 'inherit',
    initial: kineticSurface[100],
    primary: kineticGreen[500],
    secondary: kineticSurface[300],
    disabled: kineticSurface[500],
    error: neonRed[700],
    success: kineticGreen[700],
    info: cyberCyan[600],
    warning: solarAmber[800],
  },
  border: {
    default: kineticSurface[600],
    light: alpha(kineticGreen[100], 0.1),
    primary: kineticGreen[500],
    dark: kineticGreen[800],
  },
  skeleton: {
    highlight: alpha(kineticSurface[500], 0.65),
  },
  // Matched to the JetBrains "Islands Dark" editor scheme.
  syntax: {
    base: neutral[500], // #BBBBBB ≈ Islands text #bcbec4
    keyword: clayOrange[400], // #CF8E6D = Islands keyword #cf8e6d
    string: sageGreen[400], // #6AAB73 = Islands string #6aab73
    number: pineTeal[400], // #2AACB8 = Islands number #2aacb8
    title: royalBlue[400], // #6BA9FA ≈ Islands function #56a8f5
    constant: orchidPurple[400], // #C77DBB = Islands field/constant #c77dbb
    type: pineTeal[400], // #2AACB8 ≈ Islands type #16baac
    comment: neutral[600], // #919191 ≈ Islands comment #7a7e85
    tag: sandGold[400], // #D5B778 = Islands markup tag #d5b778
  },
  logoFilter: 'brightness(0) invert(1)',
  portraitBlend: 'screen',
  portraitOpacity: 0.8,
  shadows: darkShadows,
}

const themes = {
  light,
  dark,
}

export default themes

// Alias so the augmentation below can reference the package's Theme without
// colliding with @emotion/react's own `Theme` name inside the module declaration.
type CustomTheme = Theme

// Emotion's Theme is our theme — every consumer that imports from this package
// (barrel, ThemeProvider, or themes) gets the augmentation automatically.
declare module '@emotion/react' {
  export interface Theme extends CustomTheme, Light, Dark {}
}
