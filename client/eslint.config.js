//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import i18nextPlugin from 'eslint-plugin-i18next'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/routes/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**'],
    plugins: {
      i18next: i18nextPlugin,
    },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-text-only',
          words: {
            exclude: [
              '🍽️',
              '⚠️',
              '⏸️',
              '📝',
              'm',
              '×',
              '·',
              '•',
              '—',
              '#',
              ':',
              '=',
              '/200',
              '\\(',
              '\\)',
            ],
          },
        },
      ],
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'src/components/ui'],
  },
]
