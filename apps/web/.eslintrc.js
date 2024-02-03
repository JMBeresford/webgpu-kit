/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["eslint-config-custom/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    "no-bitwise": "off",
    "no-undef": "off",
    "no-unsafe-call": "off",
  },
};
