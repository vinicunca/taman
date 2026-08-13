import type { Component } from 'vue';

import type {
  DialogApiOptions,
  DialogProps,
  ExtendedDialogApi,
} from './dialog.types';

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
} from 'vue';

import { DialogApi } from './dialog.api';
import { dialogDefaults } from './dialog.defaults';
import { registerDialog, unregisterDialog } from './dialog.registry';
import DialogComponent from './dialog.vue';

const TAMAN_DIALOG_INJECT_KEY = Symbol('TAMAN_DIALOG_INJECT');

/**
 * Caller side: registers `connectedComponent` with the global
 * <TamanDialogProvider /> and returns the api. No template tag needed.
 */
export function useTamanDialog(
  options: DialogApiOptions & { connectedComponent: Component },
): ExtendedDialogApi;
/**
 * Content-component side: returns [Dialog, api]; render <Dialog> in the
 * content component's own template to get the chrome.
 */
export function useTamanDialog(
  options?: Omit<DialogApiOptions, 'connectedComponent'>,
): readonly [Component, ExtendedDialogApi];
export function useTamanDialog(options: DialogApiOptions = {}): any {
  const { connectedComponent } = options;

  if (connectedComponent) {
    const id = Symbol('TamanDialog');
    const hasRendered = ref(false);
    const isDialogReady = ref(true);

    const extendedApi = reactive({});
    Object.setPrototypeOf(extendedApi, {
      open() {
        if (hasRendered.value) {
          console.warn(
            '[Taman Dialog]: the connected component never completed the dialog handshake — it must call useTamanDialog() with no arguments and render the returned <Dialog>. open() will resolve undefined until it does.',
          );
        } else {
          console.warn(
            '[Taman Dialog]: open() was called before <TamanDialogProvider /> rendered this dialog. Mount <TamanDialogProvider /> once in your root App component.',
          );
        }
        return Promise.resolve(undefined);
      },
    });

    const Connector = defineComponent(
      () => {
        hasRendered.value = true;
        provide(TAMAN_DIALOG_INJECT_KEY, {
          extendApi(api: ExtendedDialogApi) {
            // Do not assign directly to reactive; reactivity would be lost.
            // Do not use Object.assign; prototype methods would be lost.
            Object.setPrototypeOf(extendedApi, api);
          },
          consumed: false,
          options,
          async reCreateModal() {
            isDialogReady.value = false;
            await nextTick();
            isDialogReady.value = true;
          },
        });
        return () => h(isDialogReady.value ? connectedComponent : 'div');
      },
      {
        name: 'TamanDialogConnector',
        inheritAttrs: false,
      },
    );

    registerDialog(id, Connector);
    if (getCurrentScope()) {
      onScopeDispose(() => unregisterDialog(id));
      onDeactivated(() => {
        (extendedApi as ExtendedDialogApi).close?.();
      });
    } else {
      console.warn(
        '[Taman Dialog]: useTamanDialog({ connectedComponent }) was called outside an effect scope, so this dialog will never be unregistered. Call it inside a component setup (or an effectScope()).',
      );
    }

    return extendedApi as ExtendedDialogApi;
  }

  const injectData = inject<any>(TAMAN_DIALOG_INJECT_KEY, {});
  if (!injectData.extendApi || injectData.consumed) {
    throw new Error(
      '[Taman Dialog]: useTamanDialog requires `connectedComponent`. Dialog bodies are standalone components rendered by <TamanDialogProvider />; nested dialogs must register their own connectedComponent.',
    );
  }
  injectData.consumed = true;

  const mergedOptions = {
    ...dialogDefaults,
    ...injectData.options,
    ...options,
  } as DialogApiOptions;

  mergedOptions.onOpenChange = (isOpen: boolean) => {
    options.onOpenChange?.(isOpen);
    injectData.options?.onOpenChange?.(isOpen);
  };

  const onClosed = mergedOptions.onClosed;
  mergedOptions.onClosed = () => {
    onClosed?.();
    if (mergedOptions.destroyOnClose) {
      injectData.consumed = false;
      injectData.reCreateModal?.();
    }
  };

  const api = new DialogApi(mergedOptions);

  const extendedApi: ExtendedDialogApi = api as never;

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

  injectData.extendApi(extendedApi);

  return [Dialog, extendedApi] as const;
}
