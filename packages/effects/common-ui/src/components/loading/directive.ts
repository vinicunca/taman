import type { App, Directive, DirectiveBinding } from 'vue';
import { PohonLoading, PohonSpinner } from '@taman-core/pohon-ui';
import { isString } from '@vinicunca/perkakas';
import { h, render } from 'vue';

const LOADING_INSTANCE_KEY = Symbol('loading');
const SPINNER_INSTANCE_KEY = Symbol('spinner');

const CLASS_NAME_RELATIVE = 'spinner-parent--relative';

function getOptions(binding: DirectiveBinding) {
  if (binding.value === undefined) {
    return { spinning: true };
  } else if (typeof binding.value === 'boolean') {
    return { spinning: binding.value };
  } else {
    return { ...binding.value };
  }
}

const loadingDirective: Directive = {
  mounted(el, binding) {
    const instance = h(PohonLoading, getOptions(binding));
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

const spinningDirective: Directive = {
  mounted(el, binding) {
    const instance = h(PohonSpinner, getOptions(binding));
    render(instance, el);

    el.classList.add(CLASS_NAME_RELATIVE);
    el[SPINNER_INSTANCE_KEY] = instance;
  },
  unmounted(el) {
    const instance = el[SPINNER_INSTANCE_KEY];
    el.classList.remove(CLASS_NAME_RELATIVE);
    render(null, el);
    instance.el.remove();

    el[SPINNER_INSTANCE_KEY] = null;
  },

  updated(el, binding) {
    const instance = el[SPINNER_INSTANCE_KEY];
    const options = getOptions(binding);
    if (options && instance?.component) {
      try {
        Object.keys(options).forEach((key) => {
          instance.component.props[key] = options[key];
        });
        instance.component.update();
      } catch (error) {
        console.error(
          'Failed to update spinner component in directive:',
          error,
        );
      }
    }
  },
};

interface LoadingDirectiveParams {
  /** Whether to register the loading directive. If a string is provided, the directive will be registered as the specified name */
  loading?: boolean | string;
  /** Whether to register the spinning directive. If a string is provided, the directive will be registered as the specified name */
  spinning?: boolean | string;
}

/**
 * Register loading directive
 */
export function registerLoadingDirective(
  app: App,
  params?: LoadingDirectiveParams,
) {
  // Inject a style for the directive to use, ensuring the container is relative positioning
  const style = document.createElement('style');
  style.id = CLASS_NAME_RELATIVE;
  style.innerHTML = `
    .${CLASS_NAME_RELATIVE} {
      position: relative !important;
    }
  `;
  document.head.append(style);
  if (params?.loading !== false) {
    app.directive(
      isString(params?.loading) ? params.loading : 'loading',
      loadingDirective,
    );
  }
  if (params?.spinning !== false) {
    app.directive(
      isString(params?.spinning) ? params.spinning : 'spinning',
      spinningDirective,
    );
  }
}
