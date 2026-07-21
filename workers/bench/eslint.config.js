import globals from 'globals'
import base from '@soroush.tech/eslint-config/base'

export default [
  // Generated wrangler build artifacts — never lint these.
  { ignores: ['.wrangler/**'] },
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
