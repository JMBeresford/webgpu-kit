// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint-config-custom/library.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  parserOptions: {
    project: [
      "./tsconfig.json",
      "./packages/*/tsconfig.json",
      "./apps/*/tsconfig.json",
    ],
  },
};
