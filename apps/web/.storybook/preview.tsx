import type { Preview } from '@storybook/react-vite'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import { initialize, mswLoader } from 'msw-storybook-addon'
import type { PageContext as VikePageContext } from 'vike/types'
import { ThemeProvider } from '@soroush.tech/design-system/theme'
import { light, dark } from '../src/theme/themes'
import { GlobalStyles } from '../src/theme/GlobalStyles'
import { PageContext } from '../src/common/PageContext'

initialize()

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
  loaders: [mswLoader],
  decorators: [
    (Story, { parameters }) => (
      <PageContext.Provider
        value={{ urlPathname: parameters.urlPathname ?? '/' } as VikePageContext}
      >
        <Story />
      </PageContext.Provider>
    ),
    withThemeFromJSXProvider({
      themes: {
        light,
        dark,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles,
    }),
  ],
}

export default preview
