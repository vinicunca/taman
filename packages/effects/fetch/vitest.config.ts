import { defineConfig } from 'vitest/config';

// node environment: this package is framework-agnostic (no Vue/DOM tests
// remain here since the vue-query layer moved to apps/backstage).
export default defineConfig({
  test: {
    environment: 'node',
  },
});
