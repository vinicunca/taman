import type { Component, VNode } from 'vue';

import type { AlertBeforeCloseScope, AlertPromptProps, AlertProps } from './alert';

import { useSimpleLocale } from '@taman-core/composables';
import { isFunctionType } from '@taman-core/shared/utils';
import { TamanRenderContent } from '@taman-core/taman-ui';
import PInput from 'pohon-ui/components/Input.vue';
import { useOverlay } from 'pohon-ui/composables';
import { h, nextTick, ref } from 'vue';
import AlertOverlay from './alert-overlay.vue';

const alertIds = new Set<symbol>();

const { $t } = useSimpleLocale();

export function tamanAlert(options: AlertProps): Promise<void> {
  const overlay = useOverlay().create(AlertOverlay, {
    destroyOnClose: true,
    props: {
      ...options,
      title: options.title ?? $t.value('prompt'),
    },
  });
  alertIds.add(overlay.id);

  return (async () => {
    try {
      const result = await overlay.open();

      if (result?.isConfirm) {
        return;
      }
      throw new Error('dialog cancelled');
    } finally {
      alertIds.delete(overlay.id);
    }
  })();
}

export function tamanConfirm(options: AlertProps): Promise<void> {
  return tamanAlert({
    showCancel: true,
    ...options,
  });
}

export async function tamanPrompt<T = any>(
  options: AlertPromptProps<T>,
): Promise<T | undefined> {
  const {
    component: _component,
    componentProps: _componentProps,
    componentSlots,
    content,
    defaultValue,
    modelPropName: _modelPropName,
    ...delegated
  } = options;

  const modelValue = ref<T | undefined>(defaultValue);
  const inputComponentRef = ref<null | VNode>(null);
  const staticContents: Array<Component> = [
    h(TamanRenderContent, { content, renderBr: true }),
  ];

  const modelPropName = _modelPropName || 'modelValue';
  const componentProps = { ..._componentProps };

  // The content function that will be recalculated each time it is rendered.
  const contentRenderer = () => {
    const currentProps = {
      ...componentProps,
      [modelPropName]: modelValue.value,
      [`onUpdate:${modelPropName}`]: (val: T) => {
        modelValue.value = val;
      },
    };

    inputComponentRef.value = h(
      _component || PInput,
      currentProps,
      componentSlots,
    );

    // Return an array containing the static content and the input component.
    return h(
      'div',
      { class: 'flex flex-col gap-2' },
      { default: () => [...staticContents, inputComponentRef.value] },
    );
  };

  const props: AlertProps & Record<string, any> = {
    ...delegated,
    async beforeClose(scope: AlertBeforeCloseScope) {
      if (delegated.beforeClose) {
        return await delegated.beforeClose({
          ...scope,
          value: modelValue.value,
        });
      }
    },
    // Use a function form, the content will be recalculated each time it is rendered.
    content: contentRenderer,
    contentMasking: true,
    async onOpened() {
      await nextTick();
      const componentRef: null | VNode = inputComponentRef.value;
      if (componentRef) {
        if (
          componentRef.component?.exposed
          && isFunctionType(componentRef.component.exposed.focus)
        ) {
          componentRef.component.exposed.focus();
        } else {
          if (componentRef.el) {
            if (
              isFunctionType(componentRef.el.focus)
              && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
                componentRef.el.tagName,
              )
            ) {
              componentRef.el.focus();
            } else if (isFunctionType(componentRef.el.querySelector)) {
              const focusableElement = componentRef.el.querySelector(
                'input, select, textarea, button',
              );
              if (focusableElement && isFunctionType(focusableElement.focus)) {
                focusableElement.focus();
              }
            } else if (
              componentRef.el.nextElementSibling
              && isFunctionType(componentRef.el.nextElementSibling.focus)
            ) {
              componentRef.el.nextElementSibling.focus();
            }
          }
        }
      }
    },
  };

  await tamanConfirm(props);
  return modelValue.value;
}

export function clearAllAlerts() {
  const overlay = useOverlay();

  for (const id of [...alertIds]) {
    overlay.close(id, { isConfirm: false });
    overlay.unmount(id);
    alertIds.delete(id);
  }
}
