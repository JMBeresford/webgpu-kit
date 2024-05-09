const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

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
    "eslint:recommended",
    "prettier",
    "plugin:turbo/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    project,
  },
  env: { node: true },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  plugins: ["tsdoc", "prettier", "turbo"],
  ignorePatterns: ["node_modules/", "dist/", "vite.config.js", ".*.js"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "no-undef": "off",
    "unicorn/filename-case": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "no-bitwise": "off",
    "tsdoc/syntax": "warn",
  },
};
