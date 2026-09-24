import type { App, Directive, DirectiveBinding } from 'vue';

import { TamanLoading } from '@taman-core/taman-ui';
import { h, render } from 'vue';

const LOADING_INSTANCE_KEY = Symbol('loading');

const CLASS_NAME_RELATIVE = 'loading-parent--relative';

const loadingDirective: Directive = {
  mounted(el, binding) {
    const instance = h(TamanLoading, getOptions(binding));
    render(instance, el);

    el.classList.add(CLASS_NAME_RELATIVE);
    el[LOADING_INSTANCE_KEY] = instance;
  },
  unmounted(el) {
    const instance = el[LOADING_INSTANCE_KEY];
    el.classList.remove(CLASS_NAME_RELATIVE);
    render(null, el);
    instance.el.remove();

    el[LOADING_INSTANCE_KEY] = null;
  },

  updated(el, binding) {
    const instance = el[LOADING_INSTANCE_KEY];
    const options = getOptions(binding);
    if (options && instance?.component) {
      try {
        Object.keys(options).forEach((key) => {
          instance.component.props[key] = options[key];
        });
        instance.component.update();
      } catch (error) {
        console.error(
          'Failed to update loading component in directive:',
          error,
        );
      }
    }
  },
};

function getOptions(binding: DirectiveBinding) {
  if (binding.value === undefined) {
    return { spinning: true };
  } else if (typeof binding.value === 'boolean') {
    return { spinning: binding.value };
  } else {
    return { ...binding.value };
  }
}

/**
 * Register the v-loading directive (renders TamanLoading overlay).
 */
export function registerLoadingDirective(app: App) {
  // Inject relative positioning style for directive targets
  const style = document.createElement('style');
  style.id = CLASS_NAME_RELATIVE;
  style.innerHTML = `
    .${CLASS_NAME_RELATIVE} {
      position: relative !important;
    }
  `;
  document.head.append(style);

  app.directive('loading', loadingDirective);
}
