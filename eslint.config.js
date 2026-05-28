import { vinicuncaESLint } from '@vinicunca/eslint-config';

export default vinicuncaESLint(
  {
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
);
