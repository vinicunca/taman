import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    formatters: {
      html: true,
    },
    typescript: true,
    unocss: {
      configPath: './apps/backstage/uno.config.ts',
    },
    vue: true,
  },

  {
    files: [
      '**/scripts/**',
      '**/db/**',
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
);
