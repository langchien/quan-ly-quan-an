// @ts-check
import clientConfig from './client/eslint.config.js'

export default [
  ...clientConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'server/**', // Server uses oxlint
    ],
  },
]
