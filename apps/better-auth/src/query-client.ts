import type { App } from 'vue';
import { useTamanToast } from '@taman/common-ui';
import { QueryCache, QueryClient } from '@tanstack/vue-query';
import { getErrors } from '#/api/errors';

let appInstance: App | undefined;

/**
 * Called once from bootstrap.ts right after `createApp()`. pohon-ui's
 * `useToast()` calls `inject(toastMaxInjectionKey, undefined)` — it has a
 * default so it never throws, but Vue still warns "inject() can only be
 * used inside setup()" when there's no active component *and* no active
 * app. Running the toast call through `app.runWithContext()` sets Vue's
 * `currentApp`, which is exactly what `inject()` checks, so the warning
 * goes away for real instead of just being suppressed.
 */
export function setQueryClientAppContext(app: App): void {
  appInstance = app;
}

function notifyQueryError(error: unknown): void {
  const { toaster } = useTamanToast();
  toaster.error(getErrors(error));
}

/**
 * App-wide query client. A module-level instance (rather than the implicit
 * one VueQueryPlugin creates) so non-component code — the router guard and
 * the auth store — can reach the same cache as components.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },

  // Centralized query-error toast: fires once per real query failure,
  // regardless of how many components observe that query (contrast with
  // a per-composable `watch(error, ...)`, which would fire once per
  // observer and duplicate the toast). Opt out per-query with
  // `useQuery({ ..., meta: { silentError: true } })`.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silentError) {
        return;
      }

      if (appInstance) {
        appInstance.runWithContext(() => notifyQueryError(error));
      } else {
        notifyQueryError(error);
      }
    },
  }),
});
