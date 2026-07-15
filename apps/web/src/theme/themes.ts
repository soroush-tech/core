import type { Theme } from '@soroush.tech/design-system'
import { baseTheme } from '@soroush.tech/design-system/themes'
import { alpha, createTheme, generateBoxShadow } from '@soroush.tech/design-system/utils'
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

// The site's brand themes. Structural tokens (spacing, typography, radii, fonts, …)
// come from the design-system `baseTheme` via createTheme's deep merge; every
// color-driven scale is defined here from the app's own palettes in `src/theme/colors/`.

const lightShadows = Array.from({ length: 25 }, (_, elevation) =>
  generateBoxShadow(elevation, blackAlpha[100])
)

const darkShadows = Array.from({ length: 25 }, (_, elevation) =>
  generateBoxShadow(elevation, blackAlpha[400])
)

export const light: Theme = createTheme(baseTheme, {
  name: 'light',
  colorScheme: 'light',
  logoFilter: 'brightness(0)',
  portraitBlend: 'multiply',
  portraitOpacity: 1,
  shadow: { color: carbonBlack[900], opacity: 0.1 },
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
  shadows: lightShadows,
})

export const dark: Theme = createTheme(baseTheme, {
  name: 'dark',
  colorScheme: 'dark',
  logoFilter: 'brightness(0) invert(1)',
  portraitBlend: 'screen',
  portraitOpacity: 0.8,
  shadow: { color: carbonBlack[900], opacity: 0.4 },
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
  shadows: darkShadows,
})

const themes = {
  light,
  dark,
}

export default themes
