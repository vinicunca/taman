import { fileURLToPath } from 'node:url';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import vitePohon from 'pohon-ui/vite';
import { configDefaults, defineConfig } from 'vitest/config';

const NUXT_ICON_STUB_ID = 'virtual:vitest-nuxt-icon';
const RESOLVED_NUXT_ICON_STUB_ID = `\0${NUXT_ICON_STUB_ID}`;

export default defineConfig({
  plugins: [
    {
      name: 'vitest:nuxt-icon',
      resolveId(id) {
        if (id === NUXT_ICON_STUB_ID) {
          return RESOLVED_NUXT_ICON_STUB_ID;
        }
      },
      load(id) {
        if (id === RESOLVED_NUXT_ICON_STUB_ID) {
          return `
            import { defineComponent, h } from 'vue'
            export default defineComponent({
              name: 'NuxtIconStub',
              setup() {
                return () => h('span')
              },
            })
          `;
        }
      },
    },
    vitePohon({
      colorMode: false,
      dts: false,
      router: false,
      theme: {
        unstyled: true,
      },
    }),
    Vue(),
    VueJsx(),
  ],
  resolve: {
    alias: {
      '#build/nuxt-icon-client-bundle': 'virtual:pohon-ui-icons',
      '@nuxt/icon/runtime/components/index.js': NUXT_ICON_STUB_ID,
      '@formkit/auto-animate/vue': fileURLToPath(
        new URL('./tests/mocks/auto-animate.ts', import.meta.url),
      ),
    },
  },
  ssr: {
    noExternal: ['pohon-ui'],
  },
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          // happy-dom v20+ disables JS evaluation by default (security fix).
          // Treat disabled script loading as success to preserve test behavior.
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    exclude: [
      ...configDefaults.exclude,
      '**/e2e/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/node_modules/**',
      '**/{eslint}.config.*',
    ],
  },
});
