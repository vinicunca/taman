import type { Component, VNode } from 'vue';

import type { AlertBeforeCloseScope, AlertPromptProps, AlertProps } from './alert';

import { useSimpleLocale } from '@taman-core/composables';
import { isFunctionType, isString } from '@taman-core/shared/utils';
import { TamanRenderContent } from '@taman-core/taman-ui';
import PInput from 'pohon-ui/components/Input.vue';
import { h, nextTick, ref, render } from 'vue';
import Alert from './alert.vue';

const alerts = ref<Array<{
  container: HTMLElement;
  instance: Component;
}>>([]);

const { $t } = useSimpleLocale();

export function tamanAlert(options: AlertProps): Promise<void>;
export function tamanAlert(
  message: string,
  options?: Partial<AlertProps>,
): Promise<void>;
export function tamanAlert(
  message: string,
  title?: string,
  options?: Partial<AlertProps>,
): Promise<void>;

export function tamanAlert(
  arg0: AlertProps | string,
  arg1?: Partial<AlertProps> | string,
  arg2?: Partial<AlertProps>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: AlertProps = isString(arg0)
      ? {
          content: arg0,
        }
      : { ...arg0 };
    if (arg1) {
      if (isString(arg1)) {
        options.title = arg1;
      } else if (!isString(arg1)) {
        // If the second argument is an object, it is merged into the options.
        Object.assign(options, arg1);
      }
    }

    if (arg2 && !isString(arg2)) {
      Object.assign(options, arg2);
    }

    const container = document.createElement('div');
    document.body.append(container);

    // Create a reference to access the instance in the callback.
    const alertRef = { container, instance: null as any };

    const props: AlertProps & Record<string, any> = {
      onClosed: (isConfirm: boolean) => {
        // Remove the component instance and all the DOM created (restore the page to the state before opening).
        // Remove the instance from the alerts array.
        alerts.value = alerts.value.filter((item) => item !== alertRef);

        // Remove the container from the DOM.
        render(null, container);
        if (container.parentNode) {
          container.remove();
        }

        // Parse the Promise, pass the user operation result.
        if (isConfirm) {
          resolve();
        } else {
          reject(new Error('dialog cancelled'));
        }
      },
      ...options,
      open: true,
      title: options.title ?? $t.value('prompt'),
    };

    // Create the VNode for the Alert component.
    const vnode = h(Alert, props);

    // Render the component to the container.
    render(vnode, container);

    // Save the component instance reference.
    alertRef.instance = vnode.component?.proxy as Component;

    // Add the instance and container to the alerts array.
    alerts.value.push(alertRef);
  });
}

export function tamanConfirm(options: AlertProps): Promise<void>;
export function tamanConfirm(
  message: string,
  options?: Partial<AlertProps>,
): Promise<void>;
export function tamanConfirm(
  message: string,
  title?: string,
  options?: Partial<AlertProps>,
): Promise<void>;

export function tamanConfirm(
  arg0: AlertProps | string,
  arg1?: Partial<AlertProps> | string,
  arg2?: Partial<AlertProps>,
): Promise<void> {
  const defaultProps: Partial<AlertProps> = {
    showCancel: true,
  };
  if (!arg1) {
    return isString(arg0)
      ? tamanAlert(arg0, defaultProps)
      : tamanAlert({ ...defaultProps, ...arg0 });
  } else if (!arg2) {
    return isString(arg1)
      ? tamanAlert(arg0 as string, arg1, defaultProps)
      : tamanAlert(arg0 as string, { ...defaultProps, ...arg1 });
  }
  return tamanAlert(arg0 as string, arg1 as string, {
    ...defaultProps,
    ...arg2,
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
  alerts.value.forEach((alert) => {
    // Remove the container from the DOM.
    render(null, alert.container);
    if (alert.container.parentNode) {
      alert.container.remove();
    }
  });
  alerts.value = [];
}
