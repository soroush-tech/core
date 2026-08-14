import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Shared, framework-agnostic ESLint base for every workspace member.
 * Consumers layer their own environment/framework rules on top
 * (e.g. apps/web adds React, Storybook, and browser globals).
 *
 * Formatting is not linted here — `oxfmt` owns it, enforced by the root
 * `format:check` script in CI and the pre-commit hook.
 */
const config = tseslint.config(
  { ignores: ['dist', 'build', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: String.raw`ImportDeclaration[source.value=/\.tsx?$/]`,
          message: 'Do not include .ts, .js, jsx, .tsx extensions in import paths.',
        },
      ],
    },
  }
)

export default config
