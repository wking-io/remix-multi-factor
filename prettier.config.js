module.exports = {
  $schema: "http://json.schemastore.org/prettierrc",
  arrowParens: "avoid",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  htmlWhitespaceSensitivity: "css",
  jsxSingleQuote: false,
  parser: "typescript",
  proseWrap: "always",
  quoteProps: "consistent",
  semi: false,
  trailingComma: "all",
  useTabs: true,
  plugins: [
    // @ts-ignore - No type defs
    require("prettier-plugin-organize-imports"),
    require("prettier-plugin-tailwindcss"),
  ],
};
