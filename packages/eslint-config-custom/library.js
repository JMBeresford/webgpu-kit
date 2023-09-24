const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * typescript packages.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/typescript',
    'eslint-config-turbo',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  plugins: ['prettier'],
  ignorePatterns: ['node_modules/', 'dist/', 'vite.config.js'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    'no-undef': 'off',
    'unicorn/filename-case': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    "no-bitwise": "off",
  },
};
