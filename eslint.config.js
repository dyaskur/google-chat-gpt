// eslint.config.js
import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended, // Base ESLint rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
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
