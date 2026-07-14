import type { StorybookConfig } from '@storybook/react-vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr'
import { imagetools } from 'vite-imagetools'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-themes',
  ],
  viteFinal: async (config) => {
    config.plugins = [svgr(), imagetools(), ...(config.plugins ?? [])]
    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      include: ['react', 'react/jsx-dev-runtime'],
    }
    config.resolve = {
      ...config.resolve,
      alias: [
        {
          find: '@soroush.tech/design-system/hooks/useThemeMode',
          replacement: resolve(
            __dirname,
            '../../../packages/design-system/src/hooks/__mocks__/useThemeMode'
          ),
        },
        ...(Array.isArray(config.resolve?.alias)
          ? config.resolve.alias
          : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({
              find,
              replacement: String(replacement),
            }))),
      ],
    }
    return config
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
export default config
