// eslint.config.mjs
import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['dist/', 'tests/', 'pnpm-lock.yaml', 'coverage/'], // Ignore the dist folder
  },
  js.configs.recommended, // Base ESLint rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      globals: {
        process: true, // ✅ Allow `process` as a global variable
        console: 'readonly', // Allow console usage
      },
      // env: {
      //   node: true, // Enable Node.js environment (includes process, setTimeout, etc.)
      //   es2022: true, // Enable modern JavaScript features
      // },
      ecmaVersion: 'latest', // Use latest ECMAScript version
      sourceType: 'module', // Set module type for ESM
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', {bracketSpacing: false, printWidth: 120}],
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      'object-curly-spacing': ['error', 'never'],
      'max-len': ['warn', {code: 120, ignoreStrings: true, ignoreTemplateLiterals: true}],
    },
  },
  prettierConfig, // Apply Prettier last to avoid conflicts
]
