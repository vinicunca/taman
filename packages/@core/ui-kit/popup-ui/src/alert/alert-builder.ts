import type { Recordable } from '@taman-core/typings';
import type { Component, VNode } from 'vue';

import type { AlertProps, BeforeCloseScope, PromptProps } from './alert';

import { useSimpleLocale } from '@taman-core/composables';
import { globalShareState } from '@taman-core/shared/global-state';
import { isFunctionType } from '@taman-core/shared/utils';
import { TamanRenderContent } from '@taman-core/taman-ui';
import PInput from 'pohon-ui/components/Input.vue';
import { h, nextTick, ref, render } from 'vue';
import Alert from './alert.vue';

const alerts = ref<Array<{ container: HTMLElement; instance: Component }>>([]);

const { $t } = useSimpleLocale();

/**
 * Show an alert popup. Resolves `true` when confirmed, `false` when
 * dismissed (cancel button, close button, or Esc) — never rejects.
 */
export function tamanAlert(options: AlertProps): Promise<boolean> {
  return new Promise((resolve) => {
    // Create container element
    const container = document.createElement('div');
    document.body.append(container);

    // Reference used in callbacks to access the instance
    const alertRef = { container, instance: null as any };

    const props: AlertProps & Recordable<any> = {
      onClosed: (isConfirm: boolean) => {
        // Tear down the component and DOM (restore page to pre-open state)
        // Remove this instance from the alerts array
        alerts.value = alerts.value.filter((item) => item !== alertRef);

        // Remove container from the DOM
        render(null, container);
        if (container.parentNode) {
          container.remove();
        }

        resolve(isConfirm);
      },
      ...options,
      open: true,
      title: options.title ?? $t.value('prompt'),
    };

    // Create Alert component VNode
    const vnode = h(Alert, props);

    // Render outside the normal component tree (no parent instance), so
    // without this the vnode has no app context and anything inside Alert's
    // chrome that injects app-level state (e.g. Vue Router) warns/breaks.
    const appContext = globalShareState.getAppContext();
    if (appContext) {
      vnode.appContext = appContext;
    }

    // Render component into container
    render(vnode, container);

    // Store component instance reference
    alertRef.instance = vnode.component?.proxy as Component;

    // Track instance and container in alerts array
    alerts.value.push(alertRef);
  });
}

/**
 * Show a confirm popup (adds a cancel button by default). Resolves `true`
 * when confirmed, `false` when dismissed — never rejects.
 */
export function tamanConfirm(options: AlertProps): Promise<boolean> {
  return tamanAlert({ showCancel: true, ...options });
}

/**
 * Show a prompt popup collecting one input value. Resolves the entered
 * value when confirmed, `undefined` when dismissed — never rejects.
 */
export async function tamanPrompt<T = any>(
  options: PromptProps<T>,
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

  // Content renderer recomputed on each render
  const contentRenderer = () => {
    const currentProps = {
      ...componentProps,
      [modelPropName]: modelValue.value,
      [`onUpdate:${modelPropName}`]: (val: T) => {
        modelValue.value = val;
      },
    };

    // Create input component
    inputComponentRef.value = h(
      _component || PInput,
      currentProps,
      componentSlots,
    );

    // Return static content plus the input component
    return h(
      'div',
      { class: 'flex flex-col gap-2' },
      {
        default: () => [
          ...staticContents,
          inputComponentRef.value,
        ],
      },
    );
  };

  const props: AlertProps & Recordable<any> = {
    ...delegated,
    async beforeClose(scope: BeforeCloseScope) {
      if (delegated.beforeClose) {
        return await delegated.beforeClose({
          ...scope,
          value: modelValue.value,
        });
      }
    },
    // Use a function so content is recomputed on each render
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

  const confirmed = await tamanConfirm(props);

  return confirmed ? modelValue.value : undefined;
}

export function clearAllAlerts() {
  alerts.value.forEach((alert) => {
    // Remove container from the DOM
    render(null, alert.container);
    if (alert.container.parentNode) {
      alert.container.remove();
    }
  });
  alerts.value = [];
}
