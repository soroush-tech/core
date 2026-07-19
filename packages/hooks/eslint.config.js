import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import base from '@soroush.tech/eslint-config/base'

export default [
  ...base,
  { ignores: ['coverage'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
]
