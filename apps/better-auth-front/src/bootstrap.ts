import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { registerAccessDirective } from '@taman/access';
import { registerLoadingDirective } from '@taman/common-ui';
import { preferences } from '@taman/preferences';
import { initStores } from '@taman/stores';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { useTitle } from '@vueuse/core';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import pohon from 'pohon-ui/vue-plugin';
import { createApp, watchEffect } from 'vue';
import { useSessionStore } from '#/auth';
import { $t, setupI18n } from '#/locales';
import { queryClient, setQueryClientAppContext } from '#/query-client';
import { router } from '#/router';
import App from './app.vue';
import 'virtual:uno.css';
import '@taman/designs/styles';
// Used for pohon ui theme
import 'virtual:pohon-theme';

async function bootstrap(namespace: string) {
  const app = createApp(App);

  // Register v-loading directive
  registerLoadingDirective(app, {
    loading: 'loading', // Custom directive name; pass false to skip registration
    spinning: 'spinning',
  });

  // i18n setup
  await setupI18n(app);

  // Pinia stores
  await initStores(app, { namespace });

  // Access control directive. Lazy getter — this runs before VueQueryPlugin
  // is registered below, so resolving useSessionStore() eagerly here would
  // instantiate its internal useQuery() before the QueryClient exists.
  // Deferring to a getter means the store's first real instantiation
  // happens on first actual access check (directive mount or component
  // setup), which only occurs after the app is mounted.
  registerAccessDirective(app, () => useSessionStore().roles);

  // Tippy tooltips
  const { initTippy } = await import('@taman/common-ui/es/tippy');
  initTippy(app);

  // Router and guards
  app.use(router);

  // @tanstack/vue-query — explicit client so non-component code (router
  // guard, auth store) shares the same cache. See #/query-client.
  app.use(VueQueryPlugin, { queryClient });
  setQueryClientAppContext(app);

  // Motion plugin
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // Dynamic document title
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle
        = (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  // Install pohon-ui
  app.use(pohon);

  // Auto animate plugin
  app.use(autoAnimatePlugin);

  // AG Grid
  ModuleRegistry.registerModules([AllCommunityModule]);

  app.mount('#app');
}

export { bootstrap };
