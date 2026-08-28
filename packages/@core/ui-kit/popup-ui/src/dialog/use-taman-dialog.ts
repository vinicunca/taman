import type { Component } from 'vue';

import type {
  DialogApiOptions,
  DialogProps,
  ExtendedDialogApi,
  InferDialogData,
} from './dialog.types';

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
import { DialogApi } from './dialog.api';
import DialogComponent from './dialog.vue';

const TAMAN_DIALOG_INJECT_KEY = Symbol('TAMAN_DIALOG_INJECT');

declare const DIALOG_DATA_NOT_PROVIDED: unique symbol;

interface DialogDataNotProvided {
  readonly [DIALOG_DATA_NOT_PROVIDED]: true;
}

type ResolvedDialogData<
  TData,
  TConnectedComponent extends Component,
> = TData extends DialogDataNotProvided
  ? InferDialogData<TConnectedComponent>
  : TData;

interface DialogInjectData<TData> {
  consumed?: boolean;
  extendApi?: (api: ExtendedDialogApi<TData>) => void;
  options?: DialogApiOptions;
  reCreateModal?: () => Promise<void>;
}

const { globalEscapeShortcutKey } = usePreferences();

const DEFAULT_DIALOG_PROPS: Partial<DialogProps> = {};

export function setDefaultDialogProps(props: Partial<DialogProps>) {
  Object.assign(DEFAULT_DIALOG_PROPS, props);
}

export function useTamanDialog<
  TData = DialogDataNotProvided,
  TConnectedComponent extends Component = Component,
>(options: DialogApiOptions<TConnectedComponent> = {}) {
  type TResolvedData = ResolvedDialogData<TData, TConnectedComponent>;

  // The Modal component is typically extracted into a separate module; if a `connectedComponent` is passed,
  // it indicates an external invocation that connects to the internal component.
  // The external Modal passes the API via provide/inject.

  const defaultOptions = {
    closeOnPressEscape: globalEscapeShortcutKey.value,
    ...options,
  };

  const { connectedComponent } = options;

  if (connectedComponent) {
    const extendedApi = shallowReactive({}) as ExtendedDialogApi<TResolvedData>;
    const isDialogReady = ref(true);
    const Dialog = defineComponent(
      (props: DialogProps, { attrs, slots }) => {
        function rebindApi(api: ExtendedDialogApi<TResolvedData>) {
          Object.setPrototypeOf(extendedApi, markRaw(api));
        }

        provide(
          TAMAN_DIALOG_INJECT_KEY,
          {
            extendApi: rebindApi,
            consumed: false,
            options: defaultOptions,
            async reCreateDialog() {
              isDialogReady.value = false;
              await nextTick();
              isDialogReady.value = true;
            },
          },
        );

        checkProps(extendedApi, {
          ...props,
          ...attrs,
          ...slots,
        });

        return () =>
          h(
            isDialogReady.value ? connectedComponent : 'div',
            {
              ...props,
              ...attrs,
            },
            slots,
          );
      },

      {
        name: 'TamanParentDialog',
        inheritAttrs: false,
      },
    );

    return [Dialog, extendedApi] as const;
  }

  const injectData = inject<DialogInjectData<TResolvedData>>(
    TAMAN_DIALOG_INJECT_KEY,
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
    ...DEFAULT_DIALOG_PROPS,
    ...effectiveOptions,
    ...defaultOptions,
  } as DialogApiOptions;

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
      injectData.reCreateModal?.();
    }
  };

  const api = new DialogApi<TResolvedData>(mergedOptions);

  const extendedApi = api as ExtendedDialogApi<TResolvedData>;

  extendedApi.useStore = (selector) => {
    return useSelector(api.store, selector);
  };

  const Dialog = defineComponent(
    (props: DialogProps, { attrs, slots }) => {
      return () =>
        h(
          DialogComponent,
          {
            ...props,
            ...attrs,
            dialogApi: extendedApi,
          },
          slots,
        );
    },

    {
      name: 'TamanDialog',
      inheritAttrs: false,
    },
  );
  injectData.extendApi?.(extendedApi);

  return [Dialog, extendedApi] as const;
}

export function createTamanDialog<TData = unknown>() {
  return function useTypedTamanDialog<
    TConnectedComponent extends Component = Component,
  >(options: DialogApiOptions<TConnectedComponent> = {}) {
    return useTamanDialog<TData, TConnectedComponent>(options);
  };
}

async function checkProps<TData>(
  api: ExtendedDialogApi<TData>,
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
      // When a `connectedComponent` is present, do not pass props to the `Dialog` directly, as this increases complexity; if you need to modify the `Dialog`'s props, please use `useTamanDialog` or the API instead.
      console.warn(
        `[Taman Dialog]: When 'connectedComponent' exists, do not set props or slots '${attr}', which will increase complexity. If you need to modify the props of Modal, please use useTamanDialog or api.`,
      );
    }
  }
}
