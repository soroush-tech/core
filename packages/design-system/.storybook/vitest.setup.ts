import { setProjectAnnotations } from '@storybook/react-vite'
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview'
import * as projectAnnotations from './preview'

// Register project annotations so @storybook/addon-vitest skips injecting
// its own setup-file-with-project-annotations.js (which uses an unresolvable
// virtual module in standalone browser-mode vitest runs).
// The addon's setup-file.js still runs and calls beforeAll via globalProjectAnnotations.
setProjectAnnotations([projectAnnotations, a11yAddonAnnotations])
