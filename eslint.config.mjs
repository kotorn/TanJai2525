import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/_legacy_backup/**',
      'public/sw.js',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
