import { registerAccessDirective } from '@taman/access';
import { registerLoadingDirective } from '@taman/common-ui';
import { preferences } from '@taman/preferences';
import { initStores } from '@taman/stores';
import { useTitle } from '@vueuse/core';
import { createApp, watchEffect } from 'vue';
import { $t, setupI18n } from '~~/locales';
import { router } from '~~/router';

import App from './app.vue';

async function bootstrap(namespace: string) {
  const app = createApp(App);

  // Register v-loading directive
  registerLoadingDirective(app, {
    loading: 'loading', // Here you can customize the directive name, or explicitly provide false to not register this directive
    spinning: 'spinning',
  });

  // Internationalization i18n configuration
  await setupI18n(app);

  // Configure pinia store
  await initStores(app, { namespace });

  // Install permission directive
  registerAccessDirective(app);

  // Configure router and router guard
  app.use(router);

  // Configure @tanstack/vue-query
  // const { VueQueryPlugin } = await import('@tanstack/vue-query');
  // app.use(VueQueryPlugin);

  // Configure Motion plugin
  // const { MotionPlugin } = await import('@vben/plugins/motion');
  // app.use(MotionPlugin);

  // Dynamic update title
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle
        = (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
