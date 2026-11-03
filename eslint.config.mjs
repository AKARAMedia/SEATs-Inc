import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // opennextjs-cloudflare's build output (gitignored, see .gitignore) — a minified bundle, not
    //   source. Missing from here let ESLint try to parse it as source, which OOM'd on its longest file.
    ".open-next/**",
    // Static assets (e.g. the standalone /jp landing page) aren't part of the Next.js app.
    "public/**",
  ]),
]);

export default eslintConfig;
