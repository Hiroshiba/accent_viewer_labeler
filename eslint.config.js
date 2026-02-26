import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import gitignore from "eslint-config-flat-gitignore";
import eslintPluginVue from "eslint-plugin-vue";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  gitignore(),
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs["flat/recommended"],
    ],
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "error",
      eqeqeq: ["error", "smart"],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "BinaryExpression[operator='==='][right.type='Literal'][right.raw='null']",
          message:
            "null との比較に === を使わないでください。== を使ってください。",
        },
        {
          selector:
            "BinaryExpression[operator='==='][left.type='Literal'][left.raw='null']",
          message:
            "null との比較に === を使わないでください。== を使ってください。",
        },
        {
          selector:
            "BinaryExpression[operator='!=='][right.type='Literal'][right.raw='null']",
          message:
            "null との比較に !== を使わないでください。!= を使ってください。",
        },
        {
          selector:
            "BinaryExpression[operator='!=='][left.type='Literal'][left.raw='null']",
          message:
            "null との比較に !== を使わないでください。!= を使ってください。",
        },
      ],
      "no-implicit-coercion": "error",
    },
  },
  {
    files: ["packages/electron/electron/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
);
