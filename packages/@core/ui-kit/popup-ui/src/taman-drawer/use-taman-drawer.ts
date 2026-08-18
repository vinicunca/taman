import type { Component, Slots } from 'vue';

import type {
  ExtendedTamanDrawerApi,
  TamanDrawerApiOptions,
  TamanDrawerProps,
} from './drawer.types';

import { useSelector } from '@taman-core/shared/store';
import {
  defineComponent,
  getCurrentScope,
  h,
  inject,
  nextTick,
  onDeactivated,
  onScopeDispose,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { TamanDrawerApi } from './drawer.api';
import { drawerDefaults } from './drawer.defaults';
import { registerDrawer, unregisterDrawer } from './drawer.registry';
import TamanDrawerComponent from './taman-drawer.vue';

const TAMAN_DRAWER_INJECT_KEY = Symbol('TAMAN_DRAWER_INJECT');

/**
 * Caller side: registers `connectedComponent` with the global
 * <TamanDrawerProvider />. Render the returned <Drawer> in this
 * component's template to forward attrs, listeners, and slots.
 */
export function useTamanDrawer(
  options: TamanDrawerApiOptions & { connectedComponent: Component },
): readonly [Component, ExtendedTamanDrawerApi];
/**
 * Content-component side: returns [Drawer, api]; render <Drawer> in the
 * content component's own template to get the chrome.
 */
export function useTamanDrawer(
  options?: Omit<TamanDrawerApiOptions, 'connectedComponent'>,
): readonly [Component, ExtendedTamanDrawerApi];
// Both overloads return `[Component, api]`. The implementation uses `any`
// because TypeScript requires the implementation signature to be assignable
// to every overload, and the two call styles are still documented separately.
export function useTamanDrawer(options: TamanDrawerApiOptions = {}): any {
  const { connectedComponent } = options;

  if (connectedComponent) {
    const id = Symbol('TamanDrawer');
    const hasRendered = ref(false);
    const isDrawerReady = ref(true);

    const extendedApi = reactive({});
    Object.setPrototypeOf(extendedApi, {
      open() {
        if (hasRendered.value) {
          console.warn(
            '[Taman Drawer]: the connected component never completed the drawer handshake — it must call useTamanDrawer() with no arguments and render the returned <Drawer>. open() will resolve undefined until it does.',
          );
        } else {
          console.warn(
            '[Taman Drawer]: open() was called before <TamanDrawerProvider /> rendered this drawer. Mount <TamanDrawerProvider /> once in your root App component.',
          );
        }
        return Promise.resolve(undefined);
      },
    });

    const forwardedAttrs = shallowRef<Record<string, unknown>>({});
    const forwardedSlots = shallowRef<Slots>({});

    const Connector = defineComponent(
      () => {
        hasRendered.value = true;
        provide(TAMAN_DRAWER_INJECT_KEY, {
          extendApi(api: ExtendedTamanDrawerApi) {
            // Do not assign directly to reactive; reactivity would be lost.
            // Do not use Object.assign; prototype methods would be lost.
            Object.setPrototypeOf(extendedApi, api);
          },
          consumed: false,
          options,
          async reCreateDrawer() {
            isDrawerReady.value = false;
            await nextTick();
            isDrawerReady.value = true;
          },
        });
        return () =>
          h(
            isDrawerReady.value ? connectedComponent : 'div',
            forwardedAttrs.value,
            forwardedSlots.value,
          );
      },
      {
        name: 'TamanDrawerConnector',
        inheritAttrs: false,
      },
    );

    const Drawer = defineComponent(
      (_, { attrs, slots }) => {
        watch(
          () => ({ ...attrs }),
          (value) => {
            forwardedAttrs.value = value;
            void checkDrawerBinderProps(
              extendedApi as ExtendedTamanDrawerApi,
              value,
            );
          },
          { deep: true, immediate: true },
        );

        return () => {
          forwardedSlots.value = slots;
          return null;
        };
      },
      {
        name: 'TamanDrawerBinder',
        inheritAttrs: false,
      },
    );

    registerDrawer(id, Connector);
    if (getCurrentScope()) {
      onScopeDispose(() => unregisterDrawer(id));
      onDeactivated(() => {
        (extendedApi as ExtendedTamanDrawerApi).close?.();
      });
    } else {
      console.warn(
        '[Taman Drawer]: useTamanDrawer({ connectedComponent }) was called outside an effect scope, so this drawer will never be unregistered. Call it inside a component setup (or an effectScope()).',
      );
    }

    return [Drawer, extendedApi as ExtendedTamanDrawerApi] as const;
  }

  const injectData = inject<any>(TAMAN_DRAWER_INJECT_KEY, {});
  if (!injectData.extendApi || injectData.consumed) {
    throw new Error(
      '[Taman Drawer]: useTamanDrawer requires `connectedComponent`. Drawer bodies are standalone components rendered by <TamanDrawerProvider />; nested drawers must register their own connectedComponent.',
    );
  }
  injectData.consumed = true;
  // Also reset on this content instance's own teardown (not only on
  // destroyOnClose), so an HMR-triggered remount of the content component
  // — which tears this instance down without the drawer ever closing —
  // doesn't leave the Connector's handshake permanently marked consumed.
  if (getCurrentScope()) {
    onScopeDispose(() => {
      injectData.consumed = false;
    });
  }

  const mergedOptions = {
    ...drawerDefaults,
    ...injectData.options,
    ...options,
  } as TamanDrawerApiOptions;

  mergedOptions.onOpenChange = (isOpen: boolean) => {
    options.onOpenChange?.(isOpen);
    injectData.options?.onOpenChange?.(isOpen);
  };

  const onClosed = mergedOptions.onClosed;
  mergedOptions.onClosed = () => {
    onClosed?.();
    if (mergedOptions.destroyOnClose) {
      injectData.consumed = false;
      injectData.reCreateDrawer?.();
    }
  };

  const api = new TamanDrawerApi(mergedOptions);

  const extendedApi: ExtendedTamanDrawerApi = api as never;

  extendedApi.useStore = (selector) => {
    return useSelector(api.store, selector);
  };

  const Drawer = defineComponent(
    (props: TamanDrawerProps, { attrs, slots }) => {
      return () =>
        h(
          TamanDrawerComponent,
          {
            ...props,
            ...attrs,
            drawerApi: extendedApi,
          },
          slots,
        );
    },
    {
      name: 'TamanDrawer',
      inheritAttrs: false,
    },
  );

  injectData.extendApi(extendedApi);

  return [Drawer, extendedApi] as const;
}

async function checkDrawerBinderProps(
  api: ExtendedTamanDrawerApi,
  attrs: Record<string, unknown>,
) {
  if (Object.keys(attrs).length === 0) {
    return;
  }
  await nextTick();

  const state = api?.store?.state;
  if (!state) {
    return;
  }

  const stateKeys = new Set(Object.keys(state));

  for (const attr of Object.keys(attrs)) {
    if (attr === 'class' || attr.startsWith('on')) {
      continue;
    }
    if (stateKeys.has(attr)) {
      console.warn(
        `[Taman Drawer]: When 'connectedComponent' exists, do not set props or slots '${attr}' on the caller <Drawer>. If you need to modify the drawer chrome, pass them to useTamanDrawer() or api.setState().`,
      );
    }
  }
}
