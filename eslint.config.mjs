import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// Emulate Node.js __dirname inside ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize ESLint compatibility layer for handling Next.js core setups
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Advanced ESLint Flat Config Engine.
 * Tailored exclusively for Next.js 15+ flat parsing systems.
 * Uses FlatCompat to safely extend legacy configurations without compilation crashes.
 */
export default [
  // Direct compatibility injection for official Next.js inspection systems
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Explicit array-level configuration block for global rules and workspaces ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "*.config.{js,mjs,ts}",
    ],
  },
];