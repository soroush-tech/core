import type { Preview } from '@storybook/react-vite'
import { ThemeProvider, baseTheme, type Theme } from '@soroush.tech/design-system/theme'
import { Global, globalStyles } from '@soroush.tech/design-system/engine'
import { css } from '@soroush.tech/design-system'

// Font-family is consumer policy, not part of the package's reset — the site loads the
// webfonts itself. Here only the family is applied, so text falls back to the generic
// stack in `theme.fonts`, which is exactly what an unstyled consumer gets.
const fontFamily = (theme: Theme) => css`
  html {
    font-family: ${theme.fonts.body};
  }
`

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={baseTheme}>
        <Global styles={[fontFamily, globalStyles]} />
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview
