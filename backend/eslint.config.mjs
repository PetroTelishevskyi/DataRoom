import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

export default tseslint.config(
  { ignores: ["dist", "src/generated", "eslint.config.mjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
);
