const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    "eslint:recommended",
    require.resolve("@vercel/style-guide/eslint/next"),
    "prettier",
    "eslint-config-turbo",
    "plugin:@typescript-eslint/recommended",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  plugins: ["prettier"],
  ignorePatterns: ["node_modules/", "dist/", ".*.js"],
  // add rules configurations here
  rules: {
    "prettier/prettier": "error",
    "import/no-default-export": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-definitions": "off",
    "react/no-unknown-property": "off",
  },
};
