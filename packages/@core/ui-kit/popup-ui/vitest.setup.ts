import { afterEach } from 'vitest';

import { dialogRegistry } from './src/dialog/dialog.registry';

afterEach(() => {
  // Keep the singleton reactive array, but remove registrations left behind
  // when a test fails before its wrapper can be unmounted.
  dialogRegistry.splice(0);
});
