import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    vue: true,
  },
  {
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
  },

  {
    files: [
      '**/scripts/**/*.ts',
      '**/internal/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
    },
  },
);
