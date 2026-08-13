import type { App, Component, InjectionKey } from 'vue';

import type {
  FieldComponentRegistry,
  FormBuilderMessages,
} from './types';

import { inject } from 'vue';

import { DEFAULT_MESSAGES } from './types';

export interface FormBuilderConfig<R extends FieldComponentRegistry = FieldComponentRegistry> {
  components: R;
  defaults?: { [K in keyof R]?: Record<string, any> };
  messages?: Partial<FormBuilderMessages>;
}

export interface ResolvedFormBuilderConfig {
  components: FieldComponentRegistry;
  defaults: Record<string, Record<string, any>>;
  messages: FormBuilderMessages;
}

export const FORM_BUILDER_KEY: InjectionKey<ResolvedFormBuilderConfig>
  = Symbol('taman-form-builder');

export function defineFieldComponents<R extends FieldComponentRegistry>(map: R): R {
  return map;
}

export function createFormBuilder<R extends FieldComponentRegistry>(
  config: FormBuilderConfig<R>,
) {
  const resolved: ResolvedFormBuilderConfig = {
    components: config.components,
    defaults: (config.defaults ?? {}) as Record<string, Record<string, any>>,
    messages: { ...DEFAULT_MESSAGES, ...config.messages },
  };
  return {
    install(app: App) {
      app.provide(FORM_BUILDER_KEY, resolved);
    },
  };
}

const EMPTY_CONFIG: ResolvedFormBuilderConfig = {
  components: {},
  defaults: {},
  messages: DEFAULT_MESSAGES,
};

/** Must be called during component setup. */
export function useFormBuilderConfig(): ResolvedFormBuilderConfig {
  return inject(FORM_BUILDER_KEY, EMPTY_CONFIG);
}

export function resolveFieldComponent(
  component: Component | string,
  config: ResolvedFormBuilderConfig,
): Component {
  if (typeof component !== 'string') {
    return component;
  }
  const resolved = config.components[component];
  if (!resolved) {
    const known = Object.keys(config.components).join(', ') || '(none)';
    const message = `[form-builder] Unknown field component "${component}". Registered components: ${known}`;
    if (import.meta.env?.DEV) {
      throw new Error(message);
    }
    console.error(message);
    return () => null;
  }
  return resolved;
}
