import { css } from '@emotion/react'
import type { Theme } from '../theme/themes'

/**
 * The base reset this package owns — box-sizing, margin/table resets, and
 * theme-driven body colors. Font-family, webfont loading, and anything else
 * app-specific are app policy — compose this into your own `Global` styles array.
 */
export const globalStyles = (theme: Theme) => css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    color-scheme: ${theme.colorScheme};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: ${theme.background.primary};
    color: ${theme.text.initial};
  }

  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    font-weight: inherit;
    margin-block-end: 0.5em;
  }

  textarea {
    overflow: auto;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    padding: 0;
  }
`
