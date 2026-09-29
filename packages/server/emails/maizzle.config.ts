import { defineConfig } from '@maizzle/framework';

export default defineConfig({
  content: ['emails/**/*.vue'],
  output: {
    path: '.maizzle',
    extension: 'html',
  },
  plaintext: true,
});
