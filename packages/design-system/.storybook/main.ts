import type { StorybookConfig } from '@storybook/react-vite'

// The package's own Storybook: only this package's stories, rendered against the
// shipped `baseTheme` - what an npm consumer sees before they theme anything. The
// site's Storybook (`apps/web/.storybook`) still globs these same files to render
// them in the brand light/dark themes; that build is the Chromatic surface.
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  // Stories reference `/soroush.svg` as their demo image; the app serves it from its
  // own `public/`, so the package keeps a light placeholder under the same name.
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
export default config
