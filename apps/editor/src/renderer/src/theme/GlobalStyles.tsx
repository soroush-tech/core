// Self-hosted webfonts, bundled by Vite and served from our own origin so they load
// within the CSP's `default-src 'self'` — same pattern as apps/web.
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import { css, type Theme } from '@soroush.tech/design-system'
import { Global, globalStyles } from '@soroush.tech/design-system/engine'

const globalLocalStyles = (theme: Theme) => css`
  html {
    font-family: ${theme.fonts.body};
  }

  #root {
    min-height: 100dvh;
  }
`

// App font-family + #root sizing composed with the package reset (box-sizing,
// margins, theme-driven body colors). Must render inside ThemeProvider.
export const GlobalStyles = () => <Global styles={[globalLocalStyles, globalStyles]} />
