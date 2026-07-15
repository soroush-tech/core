import globals from 'globals'
import storybook from 'eslint-plugin-storybook'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import base from '@soroush.tech/eslint-config/base'

export default [
  ...base,
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react: react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['*.config.ts', 'vitest.setup.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...storybook.configs['flat/recommended'],
]
