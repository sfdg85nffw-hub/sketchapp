import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dist-artifact', 'candidates', 'scratch', 'node_modules', 'playwright-report', 'test-results', 'docs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    files: ['src/sw.template.js'],
    languageOptions: { globals: { self: 'readonly', caches: 'readonly', fetch: 'readonly', Request: 'readonly', Response: 'readonly', URL: 'readonly' } },
  },
  {
    files: ['scripts/**', 'e2e/**', '*.config.*'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', document: 'readonly', window: 'readonly', fetch: 'readonly', setTimeout: 'readonly', Buffer: 'readonly', AbortSignal: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
);
