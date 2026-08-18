import { defineConfig } from 'vitest/config';

// node environment: this package is framework-agnostic (no Vue/DOM tests
// remain here since the vue-query layer moved to apps/better-auth-front).
export default defineConfig({
  test: {
    environment: 'node',
  },
});
