import globals from 'globals'
import base from '@soroush.tech/eslint-config/base'

export default [
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
