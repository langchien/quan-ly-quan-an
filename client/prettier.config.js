//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  arrowParens: 'avoid',
  endOfLine: 'lf',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: 'src/styles.css',
  tailwindFunctions: ['cn', 'cva'],
  jsxSingleQuote: true,
}

export default config
