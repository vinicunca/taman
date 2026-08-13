import { fileURLToPath } from 'node:url';

import Vue from '@vitejs/plugin-vue';
import vitePohon from 'pohon-ui/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), vitePohon({ dts: false })],
  test: {
    environment: 'happy-dom',
    setupFiles: [fileURLToPath(new URL('./vitest.setup.ts', import.meta.url))],
  },
});
