import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    formatters: {
      html: true,
    },
    typescript: true,
    unocss: {
      configPath: './apps/better-auth-front/uno.config.ts',
    },
    vue: true,
  },

  {
    files: [
      '**/scripts/**',
      '**/db/**',
      '**/db-pg/**',
      '**/playwright.config.ts',
      '**/internal/**/*.ts',
      './apps/**/server/**/*.ts',
    ],
    rules: {
      'node/prefer-global/process': 'off',
    },
  },

  {
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
  },

  {
    files: [
      '**/e2e/**',
    ],
    rules: {
      'sonar/assertions-in-tests': 'off',
    },
  },
);
