import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  // Default Next.js rules
  ...nextVitals,
  ...nextTs,

  // Custom igonres (override default next ignores)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "dist/**", "node_modules/**"]),

  // TypeScript recommended rules (flat config)
  ...tseslint.configs.recommended,

  // Prettier integration
  {
    plugins: {
      prettier,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
    },
  },
]);
