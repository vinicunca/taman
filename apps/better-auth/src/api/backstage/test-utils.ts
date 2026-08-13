import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createApp, defineComponent, h } from 'vue';

/**
 * Runs a composable inside a real Vue app with a fresh QueryClient
 * (retry disabled so error states settle immediately).
 */
export function withVueQuery<T>(composable: () => T): {
  result: T;
  unmount: () => void;
} {
  let result!: T;
  const app = createApp(
    defineComponent({
      setup() {
        result = composable();
        return () => h('div');
      },
    }),
  );
  app.use(VueQueryPlugin, {
    queryClient: new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    }),
  });
  app.mount(document.createElement('div'));
  return { result, unmount: () => app.unmount() };
}
