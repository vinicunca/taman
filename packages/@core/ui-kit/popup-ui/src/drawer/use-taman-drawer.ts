import type { Component } from 'vue';

import type {
  DrawerApiOptions,
  DrawerProps,
  ExtendedDrawerApi,
  InferDrawerData,
} from './drawer.types';

import { usePreferences } from '@taman-core/preferences';
import { useSelector } from '@taman-core/shared/store';
import {
  defineComponent,
  h,
  inject,
  markRaw,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  shallowReactive,
} from 'vue';

import { DrawerApi } from './drawer.api';
import TamanDrawer from './drawer.vue';

const TAMAN_DRAWER_INJECT_KEY = Symbol('TAMAN_DRAWER_INJECT');

declare const DRAWER_DATA_NOT_PROVIDED: unique symbol;

interface DrawerDataNotProvided {
  readonly [DRAWER_DATA_NOT_PROVIDED]: true;
}

type ResolvedDrawerData<
  TData,
  TConnectedComponent extends Component,
> = TData extends DrawerDataNotProvided
  ? InferDrawerData<TConnectedComponent>
  : TData;

interface DrawerInjectData<TData> {
  consumed?: boolean;
  extendApi?: (api: ExtendedDrawerApi<TData>) => void;
  options?: DrawerApiOptions;
  reCreateDrawer?: () => Promise<void>;
}

const { globalEscapeShortcutKey } = usePreferences();

/**
 * Default configuration
 */
const DEFAULT_DRAWER_PROPS: Partial<DrawerProps> = {};

export function setDefaultDrawerProps(props: Partial<DrawerProps>) {
  Object.assign(DEFAULT_DRAWER_PROPS, props);
}

export function useTamanDrawer<
  TData = DrawerDataNotProvided,
  TConnectedComponent extends Component = Component,
>(options: DrawerApiOptions<TConnectedComponent> = {}) {
  type TResolvedData = ResolvedDrawerData<TData, TConnectedComponent>;

  // Drawer is typically extracted into a separate module; if a `connectedComponent` is passed,
  // it indicates an external invocation that connects to the internal component.
  // The external Drawer passes the API via provide/inject.

  const defaultOptions = {
    closeOnPressEscape: globalEscapeShortcutKey.value,
    ...options,
  };
  const { connectedComponent } = options;
  if (connectedComponent) {
    const extendedApi = shallowReactive({}) as ExtendedDrawerApi<TResolvedData>;
    const isDrawerReady = ref(true);
    const Drawer = defineComponent(
      (props: DrawerProps, { attrs, slots }) => {
        function rebindApi(api: ExtendedDrawerApi<TResolvedData>) {
          Object.setPrototypeOf(extendedApi, markRaw(api));
        }

        provide(TAMAN_DRAWER_INJECT_KEY, {
          extendApi: rebindApi,
          consumed: false,
          options: defaultOptions,
          async reCreateDrawer() {
            isDrawerReady.value = false;
            await nextTick();
            isDrawerReady.value = true;
          },
        });
        checkProps(extendedApi, {
          ...props,
          ...attrs,
          ...slots,
        });
        return () =>
          h(
            isDrawerReady.value ? connectedComponent : 'div',
            { ...props, ...attrs },
            slots,
          );
      },

      {
        name: 'TamanParentDrawer',
        inheritAttrs: false,
      },
    );

    return [Drawer, extendedApi] as const;
  }

  const injectData = inject<DrawerInjectData<TResolvedData>>(
    TAMAN_DRAWER_INJECT_KEY,
    {},
  );
  const isConsumed = injectData.consumed;
  const effectiveOptions = isConsumed ? {} : injectData.options;
  if (!isConsumed && injectData.consumed !== undefined) {
    injectData.consumed = true;
  }
  onBeforeUnmount(() => {
    if (!isConsumed && injectData.consumed !== undefined) {
      injectData.consumed = false;
    }
  });

  const mergedOptions = {
    ...DEFAULT_DRAWER_PROPS,
    ...effectiveOptions,
    ...defaultOptions,
  } as DrawerApiOptions;

  mergedOptions.onOpenChange = (isOpen: boolean) => {
    options.onOpenChange?.(isOpen);
    if (!isConsumed) {
      injectData.options?.onOpenChange?.(isOpen);
    }
  };

  const onClosed = mergedOptions.onClosed;
  mergedOptions.onClosed = () => {
    onClosed?.();
    if (mergedOptions.destroyOnClose && !isConsumed) {
      if (injectData.consumed !== undefined) {
        injectData.consumed = false;
      }
      injectData.reCreateDrawer?.();
    }
  };
  const api = new DrawerApi<TResolvedData>(mergedOptions);

  const extendedApi = api as ExtendedDrawerApi<TResolvedData>;

  extendedApi.useStore = (selector) => {
    return useSelector(api.store, selector);
  };

  const Drawer = defineComponent(
    (props: DrawerProps, { attrs, slots }) => {
      return () =>
        h(TamanDrawer, { ...props, ...attrs, drawerApi: extendedApi }, slots);
    },

    {
      name: 'TamanDrawer',
      inheritAttrs: false,
    },
  );
  injectData.extendApi?.(extendedApi);
  return [Drawer, extendedApi] as const;
}

export function createTamanDrawer<TData = unknown>() {
  return function useTypedTamanDrawer<
    TConnectedComponent extends Component = Component,
  >(options: DrawerApiOptions<TConnectedComponent> = {}) {
    return useTamanDrawer<TData, TConnectedComponent>(options);
  };
}

async function checkProps<TData>(
  api: ExtendedDrawerApi<TData>,
  attrs: Record<string, any>,
) {
  if (!attrs || Object.keys(attrs).length === 0) {
    return;
  }
  await nextTick();

  const state = api?.store?.state;

  if (!state) {
    return;
  }

  const stateKeys = new Set(Object.keys(state));

  for (const attr of Object.keys(attrs)) {
    if (stateKeys.has(attr) && !['class'].includes(attr)) {
      // When the `connectedComponent` exists, do not pass in the Drawer's props, which will increase complexity.
      // If you need to modify the Drawer's props, please use `useTamanDrawer` or `api`.
      console.warn(
        `[Taman Drawer]: When 'connectedComponent' exists, do not set props or slots '${attr}', which will increase complexity. If you need to modify the props of Drawer, please use useTamanDrawer or api.`,
      );
    }
  }
}
