import globals from 'globals'
import base from '@soroush.tech/eslint-config/base'

export default [
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    // TEMPORARY: signature are loosened to `any` to match the original @styled-system public types
    // TODO(next version): restore strict typing and remove this override.
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
]
